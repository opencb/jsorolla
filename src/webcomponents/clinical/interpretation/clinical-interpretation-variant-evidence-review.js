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
import FormUtils from "../../commons/forms/form-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
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
        if (changedProperties.has("variantEvidence")) {
            this.variantEvidenceObserver();
        }
        if (changedProperties.has("mode")) {
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    variantEvidenceObserver() {
        this.review = this.review || {}; // Prevent undefined clinical evidence review
        this._review = UtilsNew.objectClone(this.review);
    }

    onFieldChange(e, field) {
        this.updateParams = FormUtils.updateScalar(this._review, this.review, this.updateParams, field || e.detail.param, e.detail.value);

        LitUtils.dispatchCustomEvent(this, "evidenceReviewChange", null, {
            value: this.review,
            update: this.updateParams,
        });
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
                                    .data=${CLINICAL_SIGNIFICANCE}
                                    .value=${clinicalSignificance}
                                    @filterChange="${e => this.onFieldChange(e, "clinicalSignificance")}">
                                </select-field-filter>
                            `,
                            defaultValue: "",
                        },
                    },
                    {
                        title: "ACMG",
                        type: "custom",
                        field: "acmg",
                        display: {
                            render: acmg => html`
                                <acmg-filter
                                    .acmg="${acmg || []}"
                                    @filterChange="${e => this.onFieldChange(e, "acmg")}">
                                </acmg-filter>
                            `,
                            defaultValue: [],
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
                        title: "Discussion",
                        field: "discussion",
                        type: "input-text",
                        display: {
                            placeholder: "Add a discussion",
                            rows: 5,
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

customElements.define("clinical-interpretation-variant-evidence-review", ClinicalInterpretationVariantEvidenceReview);

