/* select
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "./../../../core/utilsNew.js";
import "../../commons/forms/data-form.js";
import NotificationUtils from "../../commons/utils/notification-utils";
import FormUtils from "../../commons/forms/form-utils";


export default class ExomiserAnalysis extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            title: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.updateParams = {};
        this.config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysis = {
                ...this.clinicalAnalysis,
                job: {
                    id: `exomiser-${UtilsNew.getDatetime()}`
                }
            };
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
                this.updateParams = FormUtils
                    .updateScalar(this._interpretation, this.interpretation, this.updateParams, param, e.detail.value);
                break;
        }
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this.clinicalAnalysis.id,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...this.clinicalAnalysis.job
        };

        if (UtilsNew.isNotEmpty(toolParams)) {
            this.opencgaSession.opencgaClient.clinical().runInterpreterExomiser(toolParams, params)
                .then(response => {
                    console.log(response);
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: "Exomiser launched",
                        message: `Exomiser has been launched successfully`,
                    });
                })
                .catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                });
        }
    }

    render() {
        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this.config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-interpretation",
            title: "Edit Interpretation",
            icon: "fas fa-edit",
            // type: this.mode,
            description: "Update an interpretation",
            // display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Clinical Analysis ID",
                            field: "id",
                            type: "input-text",
                            defaultValue: this.id,
                            display: {
                                disabled: true,
                            },
                        },
                    ]
                },
                {
                    title: "Job Info",
                    elements: [
                        {
                            title: "Job ID",
                            field: "job.id",
                            type: "input-text",
                            display: {
                                disabled: true,
                            },
                        },
                        {
                            title: "Description",
                            field: "job.tags",
                            type: "input-text",
                            display: {
                                placeholder: "Add job tags...",
                            },
                        },
                        {
                            title: "Description",
                            field: "job.description",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a job description...",
                            },
                        },
                    ]
                }
            ]
        };
    }

}

customElements.define("exomiser-analysis", ExomiserAnalysis);
