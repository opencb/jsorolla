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
import UtilsNew from "./../../utilsNew.js";
import "../commons/tool-header.js";

export default class IndividualEditor extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
        this._prefix = UtilsNew.randomString(8);
        this.newIndividual = {}
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    onSaveFieldChange(e) {
        console.log(e.detail.param)
    }

    getSaveForm(e) {
        console.log(e.detail.param)
    }

    onSave(e) {
        console.log(e.detail.param)
    }

    onHide() {
        this.dispatchEvent(new CustomEvent("hide", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    getIndividualFormConfig() {
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
                style: "margin: 25px 50px 0px 0px",
                // mode: {
                //     type: "modal",
                //     title: "Review Variant",
                //     buttonClass: "btn-link"
                // },
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "id",
                            field: "ID",
                            type: "select",
                            allowedValues: ["NOT_REVIEWED", "REVIEW_REQUESTED", "REVIEWED", "DISCARDED", "REPORTED"],
                            display: {
                            }
                        },
                        {
                            name: "Name",
                            field: "discussion",
                            type: "input-text",
                            display: {
                                placeholder: "Add a Name",
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments",
                            type: "input-text",
                            display: {
                                placeholder: "Add a description",
                                rows: 5
                            }
                        },
                    ]
                }
            ]
        }
    }

    render() {

        return html`
            <data-form  .data=${this.newIndividual}
                        .config="${this.getIndividualFormConfig()}"
                        @clear="${this.onHide}"
                        @fieldChange="${e => this.onSaveFieldChange(e)}"
                        @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("individual-editor", IndividualEditor);
