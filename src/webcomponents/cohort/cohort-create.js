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
import UtilsNew from "./../../core/utilsNew.js";
import "../commons/tool-header.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import "../study/annotationset/annotation-set-update.js";
import LitUtils from "../commons/utils/lit-utils.js";

export default class CohortCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    // 'attribute:false' is to "simulate" as a internal property.
    //  if the cohort is not declare as a property it not render the change
    // and not update the data-form to enable the save button.
    // Note: In the recent version of lit it has to be changed to "state:true"
    static get properties() {
        return {
            cohort: {
                type: Object,
                attribute: false
            },
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
        if (UtilsNew.isUndefined(this.cohort)) {
            this.cohort = {};
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
        const [field, prop] = e.detail.param.split(".");
        if (e.detail.value) {
            if (prop) {
                this.cohort[field] = {
                    ...this.cohort[field],
                    [prop]: e.detail.value
                };
            } else {
                this.cohort = {
                    ...this.cohort,
                    [field]: e.detail.value
                };
            }
        } else {
            if (prop) {
                delete this.cohort[field][prop];
            } else {
                delete this.cohort[field];
            }
        }
        console.log("changeValue: ", this.cohort);
    }

    onAddSamples(e) {
        console.log("Samples: ", e.detail.value);
        this.sampleId = e.detail.value;
        console.log("Sample value: ", this.sampleId);
        this.cohort.samples.push(e.detail.value);
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onRemoveSample(e) {
        console.log("This is to remove a item ");
        this.cohort = {
            ...this.cohort,
            samples: this.cohort.samples.filter(
                item => item !== e.detail.value
            )
        };
        this.requestUpdate();
    }

    onSyncAnnotationSets(e) {
        e.stopPropagation();
        console.log("Updated list ", this);
        this.cohort = {...this.cohort, annotationSets: e.detail.value};
    }


    onSubmit(e) {
        e.stopPropagation();
        this.opencgaSession.opencgaClient.cohorts().create(this.cohort, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.cohort = {};
                LitUtils.dispatchEventCustom(this, "sessionUpdateRequest");
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
        LitUtils.dispatchEventCustom(this, "sessionUpdateRequest");
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                // width: "8",
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
                                    text: "short Sample id for thehis as;lsal"
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
                            display: {}
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "e.g. Homo sapiens, ..."
                            }
                        },
                        {
                            name: "Samples",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <div class="col-md-12" style="padding: 10px 20px">
                                        ${this.cohort?.samples?.map(item => html`
                                            <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item}
                                                <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                                            </span>`
                                        )}
                                    </div>
                                <sample-id-autocomplete
                                    .value=${this.sampleId}
                                    .opencgaSession=${this.opencgaSession}
                                    @filterChange="${e => this.onAddSamples(e)}">
                                </sample-id-autocomplete>`
                            }
                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Cohort description..."
                            }
                        }
                    ]
                },
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: () => html`
                //                     <annotation-set-update
                //                         .annotationSets="${this.cohort?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onSyncAnnotationSets(e)}">
                //                     </annotation-set-update>
                //                 `
                //             }
                //         }
                //     ]
                // }
            ]
        };
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

}

customElements.define("cohort-create", CohortCreate);
