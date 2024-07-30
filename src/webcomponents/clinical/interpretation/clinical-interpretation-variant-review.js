/*
 * Copyright 2015-2024 OpenCB
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
        this.updatedFields = {};
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
        this.updatedFields = {};
        this._config = this.getDefaultconfig();
    }

    modeObserver() {
        this._config = this.getDefaultconfig();
    }

    onFieldChange(e) {
        const param = e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(this.variant, this.updatedFields, param, e.detail.value, e.detail.action);

        if (param === "confidence.value") {
            // Check OpenCGA version
            const compareResult = UtilsNew.compareVersions("2.4.6", this.opencgaSession.about.Version);
            if (compareResult >= 0) {
                // this.updatedFields = FormUtils.updateObjectParams(this._variant, this.variant, this.updatedFields, param, e.detail.value);
                if (typeof this.updatedFields["confidence.value"] !== "undefined") {
                    this._variant.confidence.author = this.opencgaSession.user?.id || "-";
                    this._variant.confidence.date = UtilsNew.getDatetime();
                } else {
                    // We need to reset discussion author and date
                    this._variant.confidence.author = this.variant.confidence?.author;
                    this._variant.confidence.date = this.variant.confidence?.date;
                }
            }
        } else if (param === "discussion.text") {
            // After TASK-1472, discussion is now an object containing text, author and date
            // this.updatedFields = FormUtils.updateObjectParams(this._variant, this.variant, this.updatedFields, param, e.detail.value);
            if (typeof this.updatedFields["discussion.text"] !== "undefined") {
                this._variant.discussion.author = this.opencgaSession.user?.id || "-";
                this._variant.discussion.date = UtilsNew.getDatetime();
            } else {
                // We need to reset discussion author and date
                this._variant.discussion.author = this.variant.discussion?.author;
                this._variant.discussion.date = this.variant.discussion?.date;
            }
        } else if (param.startsWith("comments")) {
            // Assign comment author and date (TASK-1473)
            const lastComment = this._variant.comments[this._variant.comments.length - 1];
            this._variant.comments[this._variant.comments.length - 1] = {
                ...lastComment,
                author: this.opencgaSession?.user?.id || "-",
                date: UtilsNew.getDatetime(),
            };
        }

        // We need to fix tags in comments
        LitUtils.dispatchCustomEvent(this, "variantChange", {
            ...this._variant,
            comments: (this._variant?.comments || []).map(comment => ({
                ...comment,
                tags: UtilsNew.commaSeparatedArray(comment.tags || []),
            })),
        });
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._variant}"
                .originalData="${this.variant}"
                .updateParams="${this.updatedFields}"
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
                        search: false,
                        multiple: false,
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
                        search: false,
                        multiple: false,
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
                            showAddBatchListButton: false,
                            showEditItemListButton: false,
                            showDeleteItemListButton: false,
                            view: comment => {
                                const tags = UtilsNew.commaSeparatedArray(comment.tags)
                                    .join(", ") || "-";

                                return html`
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
                                            <div class="text-muted">Tags: ${tags}</div>
                                        </div>
                                    </div>
                                `;
                            }
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

