/**
 * Copyright 2015-2019 OpenCB
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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/tool-header.js";
import "../commons/filters/variableset-id-autocomplete.js";

export default class AnnotationSetForm extends LitElement {

    static UPDATE_MODE = "update";
    static CREATE_MODE = "create";

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sample: {
                type: Object
            },
            mode: {
                type: String
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
        this._prefix = UtilsNew.randomString(8);
        this.annotationSets = []
        this.showAnnotation = false; // showAnnotationForm
        this.showSubForm = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Id",
                            field: "annotationSet.id",
                            type: "input-text",
                            display: {
                                placeholder: "Id ...",
                            }
                        },
                        {
                            name: "Name",
                            field: "annotationSet.name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ...",
                            }
                        },
                        {
                            name: "Variable Set Id",
                            field: "variableSetId",
                            type: "select",
                            allowedValues: ["TEST_1", "TEST_2", "TEST_3", "TEST_4"],
                            display: {
                                placeholder: "Name ...",
                            }
                        },
                        {
                            field: "annotations",
                            type: "custom",
                            display: {
                                visible: () => {
                                    return this.showAnnotation
                                },
                                render: (sample) => html`
                                    <p>... Annotation Form ...</p>
                                    `
                            }
                        },
                        // {
                        //     name: "Variable Set Id",
                        //     field: "variableSetId",
                        //     type: "custom",
                        //     display: {
                        //         render: (sample) => html`
                        //             <variableset-id-autocomplete 
                        //                     .value="${sample?.variableSetId}"
                        //                     .opencgaSession="${this.opencgaSession}" 
                        //                     @filterChange="${e => this.onFieldChange({ detail: { param: "variableSetId", value: e.detail.value } })}">
                        //             </variableset-id-autocomplete>`
                        //     }
                        // },
                    ]
                }
            ]
        }
    }

    onFieldChange(e){
        console.log(e.detail.param, e.detail.value)
        if(e.detail.param === "variableSetId"){
            let self_dataForm = this.querySelector("data-form")
            this.showAnnotation = true;
            self_dataForm.requestUpdate()
        }
    }

    onSubmit(e) {
        let parentForm = document.querySelector("sample-form")

        if (!this.sample.annotationSets) {
            this.sample.annotationSets = []
        }

        this.sample.annotationSets.push(parentForm.annotationSets)
        parentForm.annotationSets = {}

        console.log("added Item and close", this.annotationSets)

        // document.querySelector(".subform-test select-field-filter").value = ""
        // document.querySelector(".subform-test text-field-filter").value = ""
        // TODO: Look other way to clean field.
        this.onShowForm()

    }

    onClear(e) {
        // This not work very well.
        console.log("Cancel Subform annotation")
        this.onShowForm()
        //to clear input text..
        // TODO: look how to binding property with data-form to avoid use querySelector
        // document.querySelector(".subform-test select-field-filter").value = ""
        // document.querySelector(".subform-test text-field-filter").value = ""
        console.log(this.annotationSets)

        // avoid to execute other components listen this function too
        // sample-form has this function too.. without e.stopPropagation both function are called
        e.stopPropagation()
    }

    onRemoveItem(item, e) {
        console.log("Elemento: ", item)

        this.sample = {
            ...this.sample,
            annotationSets: this.sample.annotationSets.filter(element => element !== item)
        };
    }

    onShowForm() {
        console.log("show: ", this.showSubForm)
        this.showSubForm = !this.showSubForm;
        this.requestUpdate();
    }

    render() {
        console.log("Render Components")
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Annotation Sets</h3>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShowForm}">
                    Add Annotation
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px"> 
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.sample?.annotationSets?.map((item) => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.name}
                        <span class="badge" style="cursor:pointer" @click=${() => this.onRemoveItem(item, this)}>X</span>
                    </span>`
        )}
            </div>
        </div>

        <div class="subform-test" style="${this.showSubForm ? "display:block" : "display:none"}">
            <data-form  
                .data=${this.sample}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("annotation-set-form", AnnotationSetForm);
