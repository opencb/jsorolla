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
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/filters/acmg-filter.js";
import "../../commons/forms/select-field-filter.js";

export default class ClinicalInterpretationVariantEvidenceReview extends LitElement {

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
            review: {
                type: Object,
            },
            somatic: {
                type: Boolean,
            },
            mode: {
                type: String, // Values: form, modal
            },
            displayConfig: {
                type: Object
            },
        };
    }

    _init() {
        this.updateParams = {};
        this.mode = "";
        this.review = {};
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("review")) {
            this.variantEvidenceObserver();
        }

        if (changedProperties.has("somatic")) {
            this.config = this.getDefaultConfig();
        }

        if (changedProperties.has("mode")) {
            this.config = this.getDefaultConfig();
        }

        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            };
            this.config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    variantEvidenceObserver() {
        this.review = this.review || {}; // Prevent undefined clinical evidence review
        this._review = UtilsNew.objectClone(this.review);
        this.config = this.getDefaultConfig();
    }

    onFieldChange(e, field) {
        const param = (field || e.detail.param);

        switch (param) {
            case "clinicalSignificance":
                // Fix clinical significance value --> must be in uppercase
                this.review.clinicalSignificance = typeof e.detail.value === "string" ? e.detail.value.toUpperCase() : e.detail.value;
                break;
            case "discussion.text":
                if (typeof this.updateParams?.discussion?.text !== "undefined") {
                    this.review.discussion.author = this.opencgaSession.user?.id || "-";
                    this.review.discussion.date = UtilsNew.getDatetime();
                } else {
                    // We need to reset discussion author and date
                    this.review.discussion.author = this._review.discussion?.author;
                    this.review.discussion.date = this._review.discussion?.date;
                }
                break;
            case param.match(/^acmg/)?.input:
                // Assign ACMG comment author and date (similar as implemented in TASK-1473)
                const lastReview = this.review.acmg[this.review.acmg.length - 1];
                this.review.acmg[this.review.acmg.length - 1] = {
                    ...lastReview,
                    author: this.opencgaSession?.user?.id || "-",
                    date: UtilsNew.getDatetime(),
                };
                this.review = {...this.review};
                break;
        }

        this.review = {...this.review};

        LitUtils.dispatchCustomEvent(this, "evidenceReviewChange", null, {
            value: this.review
        });

        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.review}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const discussion = this.review?.discussion || {};
        const sections = [
            {
                elements: [
                    {
                        title: "Clinical Significance",
                        field: "clinicalSignificance",
                        type: "custom",
                        display: {
                            render: clinicalSignificance => html`
                                <select-field-filter
                                    .data="${CLINICAL_SIGNIFICANCE}"
                                    .value="${(clinicalSignificance || "").toLowerCase()}"
                                    @filterChange="${e => this.onFieldChange(e, "clinicalSignificance")}">
                                </select-field-filter>
                            `,
                            defaultValue: "",
                        },
                    },
                    {
                        title: "Tier",
                        field: "tier",
                        type: "input-text",
                        display: {
                            rows: 1,
                        },
                    },
                    {
                        title: "ACMG",
                        field: "acmg",
                        type: "object-list",
                        display: {
                            // visible: !this.somatic,
                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                            // collapsable: false,
                            // maxNumItems: 5,
                            showEditItemListButton: true,
                            showDeleteItemListButton: true,
                            view: acmg => html `
                                <div style="margin-bottom:1rem;">
                                    <div>
                                        <div>
                                            <label>${acmg.classification || "-"}</label>
                                            <span>  -  ${acmg.strength || html`<span style="color: gray; font-style: italic">No strength level found</span>`}</span>
                                        </div>
                                        <div>${acmg.comment || "No comment found"}</div>
                                    </div>
                                    <div class="d-block text-secondary" style="margin: 5px">
                                        Added by <b>${acmg.author || this.opencgaSession?.user?.id || "-"}</b> on
                                        <b>${UtilsNew.dateFormatter(acmg.date || UtilsNew.getDatetime())}</b>
                                    </div>
                                </div>`,
                        },
                        elements: [
                            {
                                title: "Classification",
                                field: "acmg[].classification",
                                type: "custom",
                                display: {
                                    render: (acmg, dataFormFilterChange) => html`
                                        <acmg-filter
                                            .acmg="${acmg || []}"
                                            .multiple="${false}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value?.[0])}">
                                        </acmg-filter>
                                    `,
                                }
                            },
                            {
                                title: "Strength",
                                field: "acmg[].strength",
                                type: "select",
                                allowedValues: ACMG_STRENGTH_LEVEL,
                                display: {
                                    placeholder: "Add strength..."
                                }
                            },
                            {
                                title: "Comment",
                                field: "acmg[].comment",
                                type: "input-text",
                                display: {
                                    rows: 3,
                                    placeholder: "Add comment...",
                                }
                            },
                        ]
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

customElements.define("clinical-interpretation-variant-evidence-review", ClinicalInterpretationVariantEvidenceReview);

