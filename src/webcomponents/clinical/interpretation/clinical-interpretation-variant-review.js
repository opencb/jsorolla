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
import UtilsNew from "../../../core/utils-new.js";
import FormUtils from "../../commons/forms/form-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";

export default class ClinicalInterpretationVariantReview extends LitElement {

    constructor() {
        super();

        this.#init();
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

    #init() {
        this.updateParams = {};
        this.mode = "form";
        this.variant = {};
        this._variant = {};
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
        this._variant = UtilsNew.objectClone(this.variant);
        this.updateParams = {};
        this._config = this.getDefaultconfig();
    }

    modeObserver() {
        this._config = this.getDefaultconfig();
    }

    onFieldChange(e) {
        const param = e.detail.param;
        switch (param) {
            case "status":
                this.updateParams = FormUtils.updateScalar(this._variant, this.variant, this.updateParams, param, e.detail.value);
                break;
            case "confidence.value":
                // Check OpenCGA version
                const compareResult = UtilsNew.compareVersions("2.4.6", this.opencgaSession.about.Version);
                if (compareResult >= 0) {
                    this.updateParams = FormUtils.updateObjectParams(this._variant, this.variant, this.updateParams, param, e.detail.value);
                    if (typeof this.updateParams?.confidence?.value !== "undefined") {
                        this.variant.confidence.author = this.opencgaSession.user?.id || "-";
                        this.variant.confidence.date = UtilsNew.getDatetime();
                    } else {
                        // We need to reset discussion author and date
                        this.variant.confidence.author = this._variant.confidence?.author;
                        this.variant.confidence.date = this._variant.confidence?.date;
                    }
                }
                break;
            case "discussion.text":
                // After TASK-1472, discussion is now an object containing text, author and date
                this.updateParams = FormUtils.updateObjectParams(this._variant, this.variant, this.updateParams, param, e.detail.value);
                if (typeof this.updateParams?.discussion?.text !== "undefined") {
                    this.variant.discussion.author = this.opencgaSession.user?.id || "-";
                    this.variant.discussion.date = UtilsNew.getDatetime();
                } else {
                    // We need to reset discussion author and date
                    this.variant.discussion.author = this._variant.discussion?.author;
                    this.variant.discussion.date = this._variant.discussion?.date;
                }
                break;
            case "comments":
                this.updateParams = FormUtils.updateArraysObject(
                    this._variant,
                    this.variant,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value
                );

                // Assign comment author and date (TASK-1473)
                const lastComment = this.variant.comments[this.variant.comments.length - 1];
                this.variant.comments[this.variant.comments.length - 1] = {
                    ...lastComment,
                    tags: Array.isArray(lastComment.tags) ? lastComment.tags : (lastComment.tags || "").split(" "),
                    author: this.opencgaSession?.user?.id || "-",
                    date: UtilsNew.getDatetime(),
                };
                break;
        }

        // this.dispatchEvent(new CustomEvent("variantChange", {
        //     detail: {
        //         value: this.variant,
        //         update: this.updateParams
        //     },
        // }));
        LitUtils.dispatchCustomEvent(this, "variantChange", this.variant, {update: this.updateParams});

        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.variant}"
                .updateParams="${this.updateParams}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultconfig() {
        const discussion = this.variant?.discussion || {};
        const confidence = this.variant?.confidence || {};
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
                            "REPORTED",
                            "ARTIFACT",
                        ],
                    },
                    {
                        title: "Confidence",
                        field: "confidence.value",
                        type: "select",
                        allowedValues: [
                            "HIGH",
                            "MEDIUM",
                            "LOW",
                        ],
                        display: {
                            // Ths must be only visible for OpenCGA >= 2.4.6
                            visible: this.opencgaSession?.about?.Version ? UtilsNew.compareVersions("2.4.6", this.opencgaSession?.about?.Version) >= 0 : false,
                            helpMessage: confidence.author ? html`Last confidence added by <b>${confidence.author}</b> on <b>${UtilsNew.dateFormatter(confidence.date)}</b>.` : null,
                        }
                    },
                    {
                        title: "Discussion",
                        field: "discussion.text",
                        type: "input-text",
                        display: {
                            placeholder: "Add a discussion",
                            rows: 5,
                            helpMessage: discussion.author ? html`Last discussion added by <b>${discussion.author}</b> on <b>${UtilsNew.dateFormatter(discussion.date)}</b>.` : null,
                        },
                    },
                    {
                        title: "Comments",
                        field: "comments",
                        type: "object-list",
                        display: {
                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                            // collapsable: false,
                            // maxNumItems: 5,
                            showEditItemListButton: false,
                            showDeleteItemListButton: false,
                            view: comment => html`
                                <div style="margin-bottom:1rem;">
                                    <div style="display:flex;margin-bottom:0.5rem;">
                                        <div style="padding-right:1rem;">
                                            <i class="fas fa-comment-dots"></i>
                                        </div>
                                        <div style="font-weight:bold">
                                            ${comment.author || "-"} - ${UtilsNew.dateFormatter(comment.date)}
                                        </div>
                                    </div>
                                    <div style="width:100%;">
                                        <div style="margin-bottom:0.5rem;">${comment.message || "-"}</div>
                                        <div class="text-muted">Tags: ${(comment.tags || []).join(" ") || "-"}</div>
                                    </div>
                                </div>
                            `,
                        },
                        elements: [
                            {
                                title: "Message",
                                field: "comments[].message",
                                type: "input-text",
                                display: {
                                    placeholder: "Add comment...",
                                    rows: 3
                                }
                            },
                            {
                                title: "Tags",
                                field: "comments[].tags",
                                type: "input-text",
                                display: {
                                    placeholder: "Add tags..."
                                }
                            },
                        ]
                    },
                ]
            }
        ];

        if (this.mode === "modal") {
            return {
                title: "Edit",
                icon: "fas fa-edit",
                mode: "modal",
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

