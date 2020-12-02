/*
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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";


export default class OpencgaInterpretationVariantReview extends LitElement {

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
            variant: {
                type: Object,
            },
        }
    }

    _init(){
        this._prefix = UtilsNew.randomString(8);

        // this.save = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }
    }

    variantObserver() {
        // this._fetchCohortStats(e);
        // this.variant;
        // this.requestUpdate();
    }

    getSaveConfig() {
        return {
            title: "Save",
            icon: "fas fa-save",
            type: "form",
            // buttons: {
            //     show: true,
            //     cancelText: "Cancel",
            //     okText: "Save",
            // },
            display: {
                style: "margin: 25px 50px 0px 0px",
                // mode: {
                //     type: "modal",
                //     title: "Save Variant Stats",
                //     buttonClass: "btn btn-default ripple"
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
                            name: "Status",
                            field: "status",
                            type: "select",
                            allowedValues: ["NOT_REVIEWED", "REVIEW_REQUESTED", "REVIEWED", "DISCARDED", "REPORTED"],
                            display: {
                            }
                        },
                        {
                            name: "Discussion",
                            field: "discussion",
                            type: "input-text",
                            display: {
                                placeholder: "Add a discussion",
                                rows: 5
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                render: comments => html`
                                    <clinical-analysis-comment-editor .comments="${comments}" .opencgaSession="${this.opencgaSession}"></clinical-analysis-comment-editor>`
                            }
                        },
                    ]
                }
            ]
        }
    }

    render() {
        return html`
            <data-form  .data=${this.variant}
                        .config="${this.getSaveConfig()}"
                        @fieldChange="${e => this.onSaveFieldChange(e)}" @
                        submit="${this.onSave}">
            </data-form>
        `;
    }
}

customElements.define("opencga-interpretation-variant-review", OpencgaInterpretationVariantReview);

