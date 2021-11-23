/**
 * Copyright 2015-2021 OpenCB
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
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import "../commons/tool-header.js";
import "../study/annotationset/annotation-set-update.js";


export default class CohortCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.cohort = {};
        this.sampleId = "";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        switch (param) {
            case "samples":
                // let samples = [];
                // if (e.detail.value) {
                //     samples = e.detail.value.split(",").map(sample => {
                //         return {id: sample};
                //     });
                // }
                this.cohort = {...this.cohort, samples: e.detail.value};
                break;
            case "annotationSets":
                this.cohort = {...this.cohort, annotationSets: e.detail.value};
                break;
            default:
                this.cohort = {
                    ...FormUtils.createObject(
                        this.cohort,
                        param,
                        e.detail.value
                    )
                };
                break;
        }
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        console.log("Cohort Saved", this.cohort);
        this.opencgaSession.opencgaClient.cohorts().create(this.cohort, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.cohort = {};
                // LitUtils.dispatchEventCustom(this, "sessionUpdateRequest");
                FormUtils.showAlert("New Cohort", "New Cohort created correctly", "success");
            })
            .catch(err => {
                console.error(err);
                FormUtils.showAlert(
                    "New Cohort",
                    `Could not save cohort ${err}`,
                    "error"
                );
            });
    }

    onClear() {
        this.cohort = {};
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data=${this.cohort}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear=${this.onClear}
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }


    getDefaultConfig() {
        return {
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block" // icon
                }
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                help: {
                                    text: "short Sample id"
                                },
                                validation: {
                                }
                            }
                        },
                        {
                            name: "Cohort Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["CASE_CONTROL", "CASE_SET", "CONTROL_SET", "PAIRED", "PAIRED_TUMOR", "AGGREGATE", "TIME_SERIES", "FAMILY", "TRIO", "COLLECTION"],
                            display: {
                                placeholder: "Select a cohort type..."
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a cohort description...",
                            }
                        },
                        {
                            name: "Samples",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: () => html `
                                <sample-id-autocomplete
                                    .value=${this.sampleId}
                                    .opencgaSession=${this.opencgaSession}
                                    @filterChange="${e => this.onFieldChange(e, "samples")}">
                                </sample-id-autocomplete>`
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            name: "Modification Date",
                            field: "modificationDate",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add status name..."
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a status description..."
                            }
                        }
                    ]
                },
                {
                    title: "Annotations Sets",
                    elements: [
                        {
                            field: "annotationSets",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: cohort => html`
                                    <annotation-set-update
                                        .annotationSets="${cohort?.annotationSets}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changeAnnotationSets="${e => this.onFieldChange(e, "annotationSets")}">
                                    </annotation-set-update>
                                `
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("cohort-create", CohortCreate);
