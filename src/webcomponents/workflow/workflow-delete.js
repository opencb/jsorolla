/**
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

export default class WorkflowDelete extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflowId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.JOB_ID = "workflow-delete";
        this._workflow = null;
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("workflowId") || changedProperties.has("opencgaSession")) {
            this.workflowIdObserver();
        }
        super.update(changedProperties);
    }

    workflowIdObserver() {
        if (this.opencgaSession && this.workflowId) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            this.opencgaSession.opencgaClient.workflows()
                .info(this.workflowId, params)
                .then(response => {
                    this._workflow = UtilsNew.objectClone(response.responses[0].results[0]);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            jobId: `${this.JOB_ID}-${UtilsNew.getDatetime()}`,
        };

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.workflows()
            .delete(this._workflow.id, params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Delete Workflow: Job launched",
                    message: `Job ${params.jobId} has been launched successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "workflowDelete", this._workflow.id, {});
                LitUtils.dispatchCustomEvent(this, "closeNotification", this._workflow.id, {});
                this._workflow = null;
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }
        if (this._workflow) {
            // Caution 20241218 Vero: displaying a notification for now. Deleting is launching an endpoint, but
            //  we are not seeing the job parameters in the meta endpoint. Waiting for Pedro's feedback.
            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: `Delete Workflow: Workflow <b>${this._workflow.id}</b> in organization ${this.opencgaSession.organization.id}`,
                message: `
                    Are you sure you want to delete this workflow ${this._workflow.id}?
                `,
                ok: () => {
                    this.onSubmit();
                },
                cancel: () => {
                    this._workflow = null;
                    LitUtils.dispatchCustomEvent(this, "closeNotification", null);
                },
            });
        }
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("workflow-delete", WorkflowDelete);
