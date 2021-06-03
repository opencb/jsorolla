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

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            annotations: {
                type: Array
            },
            variables: {
                type: Array
            }
        };
    }

    _init() {
        this.annotation = {};
        this.annotations = [];
        this.annotationsElements = [];
    }

    update(changedProperties) {
        if (changedProperties.has("variables")) {
            this.variablesObserver();
        }
        super.update(changedProperties);
    }

    variablesObserver() {
        this.annotationsElements = this.variables.map(item => {
            return {
                name: item.id,
                field: item.name,
                type: "input-text",
            };
        });

        console.log("Annotations Elements ", this.annotationsElements);
        this._config = {...this.getDefaultConfig(), ...this.config};
        console.log(this._config);
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
                    elements: [{
                        name: "Id",
                        field: "annotation.id",
                        type: "input-text",
                        display: {
                            placeholder: "Id ...",
                        }
                    },
                    {
                        name: "Name",
                        field: "annotation.name",
                        type: "input-text",
                        display: {
                            placeholder: "Name ...",
                        }
                    }]
                }
            ]
        };
    }

    onFieldChangeAnnotation(e) {
        console.log("onFieldChangeAnnotation ", e.detail.param, e.detail.value);
        // switch (e.detail.param) {
        //     case "annotationSet.id":
        //     case "annotationSet.name":
        //     case "annotationSet.variableSetId":
        //         break;
        // }
        // To stop the bubbles when dispatched this method
        e.stopPropagation();
    }

    onClearForm(e) {
        console.log("Clear form");
        this.onShow();
        e.stopPropagation();
    }

    onAddAnnotation(e, item) {
        this.onAddItem(item);
        console.log("Add new Annotation");
        this.onShow();
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h4>Annotation</h4>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShow}">
                    Add Annotation
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px">
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.annotations?.map(item => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.name}
                        <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                    </span>`
                )}
            </div>
        </div>

        <div class="subform-test" style="${this.isShow ? "display:block" : "display:none"}">
            <data-form
                .data=${this.annotations}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChangeAnnotation(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onAddAnnotation(e, this.annotation)}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("annotation-manager", AnnotationManager);
