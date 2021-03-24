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

export default class StudyEditor extends LitElement {

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
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    // update(changedProperties) {
    //     if (changedProperties.has("opencgaSession")) {
    //         this.usersAndProjects = this.getProjetcsPerUser();
    //     }
    //     super.update(changedProperties);
    // }

    // getDefaultConfig() {
    //     return {
    //         title: "Study Dashboard",
    //         icon: "variant_browser.svg",
    //         active: false
    //     };
    // }

    getStudyFormCOnfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save",
                classes: "btn btn-primary"
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
        // Check if there is any project available
        // console.log(this.opencgaSession)
        // if (!this.opencgaSession?.study) {
        //     return html`
        //         <div class="guard-page">
        //         <i class="fas fa-lock fa-5x"></i>
        //             <h3>No public projects available to browse. Please login to continue</h3>
        //         </div>`;
        // }

        return html`
            <data-form  .data=${this.variant}
                        .config="${this.getSaveForm()}"
                        @fieldChange="${e => this.onSaveFieldChange(e)}"
                        @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("study-editor", StudyEditor);
