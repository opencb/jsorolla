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

export default class FileDelete extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            fileId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.JOB_ID = "file-delete";
        this._file = null;
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("fileId") || changedProperties.has("opencgaSession")) {
            this.fileIdObserver();
        }
        super.update(changedProperties);
    }

    fileIdObserver() {
        if (this.opencgaSession && this.fileId) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            this.opencgaSession.opencgaClient.files()
                .info(this.fileId, params)
                .then(response => {
                    this._file = UtilsNew.objectClone(response.responses[0].results[0]);
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

        const endpoint = this._file.external ?
            this.opencgaSession.opencgaClient.files().unlink(this._file.id, params) :
            this.opencgaSession.opencgaClient.files().delete(this._file.id, params);

        // FIXME 20241217 VERO: When trying to delete a file fetched from an external source in the root path:
        //  - If delete is used, opencga returns error "Use unlink". This is happening because the field "external" in this case is set to true in opencga.
        //  - If unlink is used, opencga returns error "[...] Could not unlink [...] Could not delete file: No documents could be found to be updated".
        //  Bug created:  https://app.clickup.com/t/36631768/TASK-7291
        this.#setLoading(true);
        endpoint
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Delete File: Job launched",
                    message: `Job ${params.jobId} has been launched successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "fileDelete", this._file.id, {});
                LitUtils.dispatchCustomEvent(this, "closeNotification", this._file.id, {});
                this._file = null;
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        debugger
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }
        if (this._file) {
            // Caution 20241218 Vero: displaying a notification for now. Deleting is launching and endpoint, but
            //  we are not seeing the job parameters in the meta endpoint. Waiting for Pedro's feedback.
            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: `Delete File: File <b>${this._file.id}</b> in organization ${this.opencgaSession.organization.id}`,
                message: `
                    Are you sure you want to delete the file ${this._file.id}?
                `,
                ok: () => {
                    this.onSubmit();
                },
                cancel: () => {
                    this._file = null;
                    LitUtils.dispatchCustomEvent(this, "closeNotification", null);
                },
            });
        }
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("file-delete", FileDelete);
