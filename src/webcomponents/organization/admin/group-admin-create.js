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
import UtilsNew from "../../../core/utils-new";

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
            studyFqn: {
                type: String,
            },
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
        this.isLoading = false;
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
        if (this.studies && this.opencgaSession && Array.isArray(this.studies)) {
            if (this.studies.length === 1) {
                this.group.listStudies = [this.studies[0]];
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
        if (changedProperties.has("studyFqn") ||
        changedProperties.has("opencgaSession")) {
            this.studyFqnObserver();
        }
        if (changedProperties.has("studies") ||
            changedProperties.has("opencgaSession")) {
            this.#initOriginalObjects();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    studyFqnObserver() {
        if (this.studyFqn && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyFqn)
                .then(response => {
                    this.study = UtilsNew.objectClone(response.responses[0].results[0]);
                    this.studies = [this.study];
                })
                .catch(reason => {
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "studyChange", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
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
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            includeResult: true,
            action: "ADD",
        };
        this.#setLoading(true);
        const groupPromises = (this.group.listStudies || [])
            .map(study => {
                let error;
                return this.opencgaSession.opencgaClient.studies()
                    .updateGroups(study.fqn, {id: this.group.id}, params)
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            title: `Group Create`,
                            message: `Group ${this.group.id} in study ${study.fqn} CREATED successfully`,
                        });
                    })
                    .catch(reason => {
                        error = reason;
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                    })
                    .finally(() => {
                        LitUtils.dispatchCustomEvent(this, "groupCreate", {}, {
                            group: this.group,
                            studyFqn: study,
                        }, error);
                    });
            });

        Promise.all(groupPromises)
            .finally(() => {
                this.#setLoading(false);
                this.#initOriginalObjects();
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", {});
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
                    // title: "General Information",
                    elements: [
                        {
                            title: "Group ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: `The group ID must start with the character '@' [e.g.'@myNewGroup'].`,
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
                                visible: !!this.allowedValues?.length,
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
