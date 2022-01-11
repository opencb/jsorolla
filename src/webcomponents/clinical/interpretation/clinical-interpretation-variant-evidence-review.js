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
            variantEvidence: {
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
        this.variantEvidence = {};
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
        this.variantEvidence = this.variantEvidence || {}; // Prevent undefined variant review
        this._variantEvidence = JSON.parse(JSON.stringify(this.variantEvidence));
    }

    onSaveFieldChange(e) {
        switch (e.detail.param) {
            case "tier":
            case "clinicalSignificance":
            case "discussion":
                this.updateParams = FormUtils
                    .updateObject(this._variantEvidence, this.variantEvidence, this.updateParams, e.detail.param, e.detail.value);
                break;
        }

        LitUtils.dispatchCustomEvent(this, "variantEvidenceChange", null, {
            value: this.variantEvidence,
            update: this.updateParams,
        });
    }

    render() {
        if (!this.variantEvidence) {
            return null; // Noting to render
        }

        return html`
            <data-form
                .data="${this.variantEvidence}"
                .config="${this.config}"
                @fieldChange="${e => this.onSaveFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const sections = [
            {
                elements: [
                    {
                        title: "Clinical Significance",
                        field: "classification.clinicalSignificance",
                        type: "input-text",
                        display: {
                            rows: 1,
                        },
                    },
                    {
                        title: "ACMG",
                        type: "input-text",
                        display: {
                            rows: 1,
                        },
                    },
                    {
                        title: "Tier",
                        field: "classification.tier",
                        type: "input-text",
                        display: {
                            rows: 1,
                        },
                    },
                    {
                        title: "Discussion",
                        field: "classification.discussion",
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

