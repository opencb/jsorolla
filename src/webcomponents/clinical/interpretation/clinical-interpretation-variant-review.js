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
import FormUtils from "../../commons/forms/form-utils.js";

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
        this._variant = {};
        this._config = this.getDefaultconfig();
        this.newCommentsAdded = false;
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
        this.newCommentsAdded = false;
    }

    modeObserver() {
        this._config = this.getDefaultconfig();
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail;

        if (this.commentsUpdate?.newComments?.length > 0) {
            // Josemi 20220719 Note: added fix to append new comments to the variant instead of replacing
            // the saved comment with the new comment
            if (!this.newCommentsAdded) {
                if (!this.variant.comments) {
                    this.variant.comments = [];
                }
                this.variant.comments.push(this.commentsUpdate.newComments[0]);
                this.newCommentsAdded = true;
            } else {
                this.variant.comments[this.variant.comments.length - 1] = this.commentsUpdate.newComments[0];
            }

            // Assign comment author and date (TASK-1473)
            this.variant.comments[this.variant.comments.length - 1] = {
                ...this.variant.comments[this.variant.comments.length - 1],
                author: this.opencgaSession?.user?.id || "-",
                date: UtilsNew.getDatetime(),
            };
        }

        this.dispatchEvent(new CustomEvent("variantChange", {
            detail: {
                value: this.variant,
                update: this.updateParams
            },
        }));
    }

    onSaveFieldChange(e) {
        const param = e.detail.param;
        switch (param) {
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
            case "status":
                this.updateParams = FormUtils.updateScalar(this._variant, this.variant, this.updateParams, param, e.detail.value);
                break;
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
        const discussion = this.variant?.discussion || {};
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
                        type: "custom",
                        display: {
                            // Josemi 20220719 NOTE: comments field has been removed from the comment-editor properties to allow
                            // saving more than one comment to the variant
                            render: comments => html`
                                <div>
                                    ${(comments || []).map(comment => html`
                                        <div style="margin-bottom:2rem;">
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
                                    `)}
                                </div>
                                <clinical-analysis-comment-editor
                                    .comments="${[]}"
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

