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
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/filters/acmg-filter.js";
import "../../commons/forms/select-field-filter.js";

export default class ClinicalInterpretationVariantEvidenceReview extends LitElement {

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
            review: {
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.updateParams = {};
        this._review = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("review")) {
            this.reviewObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    reviewObserver() {
        this._review = UtilsNew.objectClone(this.review);
    }

    onFieldChange(event) {
        const param = event.detail.param;

        if (param === "select") {
            // If the field is selected, we need to refresh the configuration
            this._config = this.getDefaultConfig();
        } else if (param === "clinicalSignificance") {
            // Fix clinical significance value --> must be in uppercase
            this._review.clinicalSignificance = typeof event.detail.value === "string" ? event.detail.value.toUpperCase() : event.detail.value;
        } else if (param === "discussion.text") {
            if (typeof this.updateParams?.discussion?.text !== "undefined") {
                this._review.discussion.author = this.opencgaSession.user?.id || "-";
                this._review.discussion.date = UtilsNew.getDatetime();
            } else {
                // We need to reset discussion author and date
                this._review.discussion.author = this.review.discussion?.author;
                this._review.discussion.date = this.review.discussion?.date;
            }
        } else if (param.startsWith("acmg")) {
            if (event.detail.action === "ADD") {
                // Assign ACMG comment author and date (similar as implemented in TASK-1473)
                const lastAcmgReview = this._review.acmg[this._review.acmg.length - 1];
                lastAcmgReview.author = this.opencgaSession?.user?.id || "-";
                lastAcmgReview.date = UtilsNew.getDatetime();
            }
            // we need to clone the review object to trigger the update
            this._review = {...this._review};
        }

        // dispatch a review change event
        LitUtils.dispatchCustomEvent(this, "evidenceReviewChange", null, {
            review: this._review
        });

        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._review}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const discussion = this.review?.discussion || {};
        return {
            display: {
                defaultValue: "",
                defaultLayout: "horizontal",
                titleVisible: false,
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            field: "select",
                            type: "custom",
                            display: {
                                render: (selected, dataFormFilterChange) => html`
                                    <div class="alert ${selected ? "alert-primary" : "alert-light"} d-flex align-items-center justify-content-between gap-3 flex-grow-1 mb-0">
                                        <label class="form-label mb-0 fw-bold">
                                            ${selected ? html`
                                                <span>Added as a supported evidence of the variant.</span>    
                                            ` : html`
                                                <span>Add as a supported evidence for the variant.</span>
                                            `}
                                        </label>
                                        <button class="btn btn-sm ${selected ? "btn-primary" : "btn-light"} rounded-2" @click="${() => dataFormFilterChange(!selected)}">
                                            <i class="fa fa-check lh-1 ${selected ? "opacity-100" : "opacity-25 text-secondary"}"></i>
                                        </button>
                                    </div>
                                `,
                                defaultValue: false,
                                helpMessage: selected => {
                                    return !selected ? "You have not selected this evidence. Click on the check button to add it as a supported evidence for the variant and to enable the review" : "";
                                },
                            },
                        },
                        {
                            title: "Clinical Significance",
                            field: "clinicalSignificance",
                            type: "select",
                            allowedValues: CLINICAL_SIGNIFICANCE,
                            display: {
                                disabled: !this._review?.selected,
                            },
                            // type: "custom",
                            // display: {
                            //     render: clinicalSignificance => html`
                            //         <select-field-filter
                            //             .data="${CLINICAL_SIGNIFICANCE}"
                            //             .value="${(clinicalSignificance || "").toLowerCase()}"
                            //             @filterChange="${e => this.onFieldChange(e, "clinicalSignificance")}">
                            //         </select-field-filter>
                            //     `,
                            //     defaultValue: "",
                            // },
                        },
                        {
                            title: "Tier",
                            field: "tier",
                            type: "input-text",
                            display: {
                                rows: 1,
                                disabled: !this._review?.selected,
                            },
                        },
                        {
                            title: "ACMG",
                            field: "acmg",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                showEditItemListButton: true,
                                showDeleteItemListButton: true,
                                disabled: !this._review?.selected,
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
                                    </div>
                                `,
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
                                disabled: !this._review?.selected,
                            },
                        },
                    ]
                }
            ],
        };
    }

}

customElements.define("clinical-interpretation-variant-evidence-review", ClinicalInterpretationVariantEvidenceReview);

