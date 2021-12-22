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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utilsNew.js";


export default class ClinicalInterpretationVariantReview extends LitElement {

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
                type: Object,
            },
            variant: {
                type: Object,
            },
            mode: {
                type: String, // Values: form, modal
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.updateParams = {};
        this.mode = "form";
        this.variant = {};
        this._config = this.getDefaultconfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("mode")) {
            this.modeObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this.variant = this.variant || {}; // Prevent undefined variant review
    }

    modeObserver() {
        this._config = this.getDefaultconfig();
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail;

        if (this.commentsUpdate?.newComments?.length > 0) {
            this.variant.comments = this.commentsUpdate.newComments;
        }

        this.dispatchEvent(new CustomEvent("variantChange", {
            detail: {
                value: this.variant,
                update: this.updateParams
            },
        }));
    }

    onSaveFieldChange(e) {
        switch (e.detail.param) {
            case "status":
            case "discussion":
                if (e.detail.value !== null) {
                    this.variant[e.detail.param] = e.detail.value;
                    this.updateParams[e.detail.param] = e.detail.value;
                } else {
                    delete this.updateParams[e.detail.param];
                }
                break;
        }

        if (this.commentsUpdate?.newComments?.length > 0) {
            this.variant.comments = this.commentsUpdate.newComments;
        }

        this.dispatchEvent(new CustomEvent("variantChange", {
            detail: {
                value: this.variant,
                update: this.updateParams
            },
        }));
    }

    render() {
        return html`
            <data-form 
                .data="${this.variant}"
                .config="${this._config}"
                @fieldChange="${e => this.onSaveFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultconfig() {
        const sections = [
            {
                elements: [
                    {
                        title: "Status",
                        field: "status",
                        type: "select",
                        allowedValues: [
                            "NOT_REVIEWED",
                            "REVIEW_REQUESTED",
                            "REVIEWED",
                            "DISCARDED",
                            "REPORTED"
                        ],
                    },
                    {
                        title: "Discussion",
                        field: "discussion",
                        type: "input-text",
                        display: {
                            placeholder: "Add a discussion",
                            rows: 5,
                        },
                    },
                    {
                        title: "Comments",
                        field: "comments",
                        type: "custom",
                        display: {
                            render: comments => html`
                                <clinical-analysis-comment-editor
                                    .comments="${comments}"
                                    @commentChange="${e => this.onCommentChange(e)}">
                                </clinical-analysis-comment-editor>
                            `,
                        },
                    },
                ]
            }
        ];

        if (this.mode === "modal") {
            return {
                title: "Edit",
                icon: "fas fa-edit",
                type: "modal",
                display: {
                    // style: "margin: 25px 50px 0px 0px",
                    titleWidth: 3,
                    defaultValue: "",
                    defaultLayout: "horizontal",
                    buttonClearText: "Cancel",
                    buttonOkText: "Save",
                },
                sections: sections,
            };
        } else {
            return {
                title: "Save",
                // icon: "fas fa-save",
                display: {
                    style: "padding:16px;",
                    titleWidth: 3,
                    titleAlign: "right",
                    defaultValue: "",
                    defaultLayout: "horizontal",
                    titleVisible: false,
                    buttonsVisible: false,
                },
                sections: sections,
            };
        }
    }

}

customElements.define("clinical-interpretation-variant-review", ClinicalInterpretationVariantReview);

