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

import {LitElement, html} from "/web_modules/lit-element.js";
import {BaseManagerMixin} from "./base-manager.js";
import "../commons/tool-header.js";
import "../commons/filters/variableset-id-autocomplete.js";
import FormUtils from "../../form-utils.js";

// eslint-disable-next-line new-cap
export default class AnnotationManager extends BaseManagerMixin(LitElement) {

    // This component work for annotations and attribute (Map<string,object>).. should be rename the component
    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            annotations: {
                type: Array
            }
        };
    }

    _init() {
        this.annotation = {};
        this.annotations = [];
    }

    firstUpdated() {
        // Calling once this service
        this.variableSetObserver();
    }


    async variableSetObserver() {
        const resp = await this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn);
        const variableSets = resp.responses[0].results;
        this.variableSetIds = variableSets.map(item => item.id);
        this._config = {...this.getDefaultConfig(), ...this.config};
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
                            field: "annotationSet.variableSetId",
                            type: "select",
                            allowedValues: this.variableSetIds,
                            display: {
                                placeholder: "Name ...",
                            }
                        }
                    ]
                }
            ]
        };
    }

    onFieldChangeAnnotationSet(e) {
        console.log("onFieldChangeAnnotationSets ", e.detail.param, e.detail.value);
        switch (e.detail.param) {
            case "annotationSet.id":
            case "annotationSet.name":
            case "annotationSet.variableSetId":
                FormUtils.createObject(
                    this.annotationSet,
                    e.detail.param,
                    e.detail.value
                );
                break;
        }
        // To stop the bubbles when dispatched this method
        e.stopPropagation();
    }

    onClearForm(e) {
        console.log("Clear form");
        this.onShow();
        e.stopPropagation();
    }

    onAddAnnotationSet(e, item) {
        this.onAddItem(item);
        console.log("Add new Annotation Set");
        this.onShow();
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Annotation Sets</h3>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShow}">
                    Add Annotation
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px">
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.annotationSets?.map(item => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.name}
                        <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                    </span>`
                )}
            </div>
        </div>

        <div class="subform-test" style="${this.isShow ? "display:block" : "display:none"}">
            <data-form
                .data=${this.annotationSets}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChangeAnnotationSet(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onAddAnnotationSet(e, this.annotationSet)}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("annotation-manager", AnnotationManager);
