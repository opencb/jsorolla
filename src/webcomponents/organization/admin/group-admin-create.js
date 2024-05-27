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

import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";

export default class GroupAdminCreate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studies: {
                type: Array,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.group = {};
        this.isLoading = false;
        this.isStudyAdmin = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();
    }

    #initOriginalObjects() {
        this.group = {};
        this.allowedValues = [];
        if (this.studies && this.opencgaSession) {
            if (Array.isArray(this.studies) && this.studies.length === 1) {
                this.isStudyAdmin = true;
                this.allowedValues = [this.studies[0]];
            } else {
                // 1. Prepare structure for displaying studies per project in dropdown
                const projects = this.studies.reduce((acc, {fqn, name, projectId}) => {
                    const study = {fqn, name};
                    const item = acc.find(y => y.projectId === projectId);
                    (item) ? item.studies.push(study) :
                        acc.push({projectId: projectId, studies: [study]});
                    return acc;
                }, []);
                // 2. Fill allowed values
                this.allowedValues = projects
                    .filter(({studies}) => studies.length > 0)
                    .map(({projectId, studies}) => ({
                        name: `Project '${projectId}'`,
                        fields: studies.map(({fqn, name}) => ({id: fqn, name}))
                    }));
            }
        }
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("studies") || changedProperties.has("opencgaSession")) {
            this.#initOriginalObjects();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        // 1. Update group id
        if (param === "id") {
            // QUESTION 20240325 Vero: verify group name starts with @?
            this.group.id = e.detail.data.id;
        }
        // 2. Update the list of studies
        if (param === "fqn") {
            this.group.listStudies = e.detail.value?.length > 0 ? e.detail.value?.split(",") : [];
        }
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear group",
            message: "Are you sure to clear?",
            ok: () => {
                this.group = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        this.#setLoading(true);
        const groupPromises = this.group.listStudies
            .map(study => {
                let error;
                return this.opencgaSession.opencgaClient.studies()
                    .updateGroups(study, {id: this.group.id}, {action: "ADD"})
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            title: `Group Create`,
                            message: `Group ${this.group.id} in study ${study} CREATED successfully`,
                        });
                    })
                    .catch(reason => {
                        error = reason;
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                    })
                    .finally(() => {
                        LitUtils.dispatchCustomEvent(this, "groupCreate", {}, {
                            id: this.group.id,
                            study: study,
                        }, error);
                    });
            });

        Promise.all(groupPromises)
            .finally(() => {
                this.#setLoading(false);
                this.#initOriginalObjects();
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", {}, {}, null);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.group}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Group ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "Short group id...",
                            },
                        },
                        {
                            title: "Study",
                            field: "fqn",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
                            allowedValues: this.allowedValues,
                            display: {
                                placeholder: "Select study or studies..."
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("group-admin-create", GroupAdminCreate);
