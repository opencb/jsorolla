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
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variant-interpreter-browser-save.js";

class VariantInterpreterBrowserToolbar extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            state: {
                type: Object
            },
            variantInclusionState: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
            write: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.write = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    onFilterInclusionVariants() {
        const variants = [];
        this.variantInclusionState.map(inclusion => variants.push(...inclusion.variants));
        LitUtils.dispatchCustomEvent(this, "filterVariants", null, {
            variants: variants
        });
    }

    onFilterPrimaryFindingVariants() {
        LitUtils.dispatchCustomEvent(this, "filterVariants", null, {
            variants: this.clinicalAnalysis.interpretation.primaryFindings,
        });
    }

    onFilterModifiedVariants() {
        LitUtils.dispatchCustomEvent(this, "filterVariants", null, {
            variants: [
                ...this.state.addedVariants,
                ...this.state.removedVariants,
            ],
        });
    }

    onResetModifiedVariants() {
        LitUtils.dispatchCustomEvent(this, "resetVariants", null);
    }

    onSaveInterpretation() {
        LitUtils.dispatchCustomEvent(this, "saveInterpretation", null, {
            comment: this.comment
        });
        this.comment = {};
    }

    onSaveFieldsChange(type, e) {
        this.comment = this.comment ? this.comment : {};
        switch (type) {
            case "message":
                this.comment.message = e.detail.value;
                break;
            case "tags":
                this.comment.tags = e.detail.value;
                break;
        }
    }

    // onInterpretationChangesModalShow() {
    //     ModalUtils.show();
    // }

    // renderInterpretationChangesSaveModal() {
    //     return ModalUtils.create(this, `${this._prefix}InterpretationChangesSaveModal`, {
    //         display: {
    //             modalTitle: "Review and Save Interpretation Changes",
    //             modalDraggable: false,
    //             modalSize: "modal-lg"
    //         },
    //         render: () => html`
    //             <variant-interpreter-save
    //                 .clinicalAnalysis="${this.clinicalAnalysis}"
    //                 .state="${this.state}">
    //             </variant-interpreter-save>
    //         `,
    //     });
    // }

    renderInclusionVariant(inclusion) {
        const iconHtml = html`
            <div
                title="${Object.entries(inclusion.query).map(([k, v]) => `${k} = ${v}`).join("\n")}"
                style="cursor: pointer;">
                <i class="fas fa-eye"></i>
            </div>`;

        const inclusionHtml = html`
            <div
                style="width: 80%;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 10px;">
                ${inclusion.id}
            </div>
        `;

        return html`
            <div style="border-left: 2px solid #0c2f4c; margin: 15px 0">
                <div class="d-flex align-items-center justify-content-between my-1 mx-2">${inclusionHtml} ${iconHtml}</div>
                ${
                    inclusion.variants?.length > 0 ? inclusion.variants.map(variant => {
                        const GT = variant.studies[0]?.samples[0]?.data[0] || "No GT found";
                        const FILTER = variant.studies[0]?.files[0]?.data.FILTER || "NA";
                        return html`
                            <div class="text-body-secondary d-flex flex-column" style="overflow-wrap: break-word;">
                                <span class="my-0 mx-3">${variant.id}</span>
                                <span class="my-0 mx-3" class="float-end">Genotype: ${GT} (${FILTER})</span>
                            </div>
                        `;
                    }) : html `<div class="text-body-secondary"><span class="my-0 mx-3">No variants found.</span></div>`
                }
            </div>
        `;
    }

    renderVariant(variant, icon) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));
        const iconHtml = icon ? html`<span style="cursor: pointer"><i class="${icon}"></i></span>` : "";

        return html`
            <div class="text-break" style="border-left: 2px solid #0c2f4c; margin: 15px 0;">
                <div class="my-1 mx-2">${variant.id} (${variant.type}) ${iconHtml}</div>
                <div class="my-1 mx-2">${variant.annotation.displayConsequenceType}</div>
                <div class="my-1 mx-2">${geneNames.join(", ")}</div>
            </div>
        `;
    }

    render() {
        const primaryFindings = this.clinicalAnalysis.interpretation?.primaryFindings;
        const hasVariantsToSave = this.state.addedVariants?.length || this.state.removedVariants?.length || this.state.updatedVariants?.length;

        return html`
            <div class="d-flex justify-content-end mb-3">
                <div class="btn-toolbar gap-1"  role="toolbar" aria-label="toolbar"  >
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Show inclusion list of variants">
                            <i class="fas fa-tasks pe-1" aria-hidden="true"></i>
                            <strong>Inclusion Variants</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${this._prefix}ResetMenu" style="width: 420px">
                            <li class="my-1 mx-2">
                                <div class="my-1 mx-0">
                                    <span class="fw-bold">Variants Included</span>
                                </div>
                                <div>
                                    ${this.variantInclusionState?.length > 0 ? html`
                                        ${this.variantInclusionState.map(inclusion => this.renderInclusionVariant(inclusion))}

                                        <li><hr class="dropdown-divider"></li>
                                        <li class="my-1 mx-2">
                                            <div class="float-end">
                                                <button
                                                    type="button"
                                                    class="btn btn-primary m-1"
                                                    @click="${this.onFilterInclusionVariants}">Filter
                                                </button>
                                            </div>
                                        </li>
                                    ` : html`
                                        <div class="m-1">Variant Inclusion list not def</div>
                                    `}
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Show saved variants">
                            <i class="fas fa-eye pe-1" aria-hidden="true"></i>
                            <strong>View</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li class="my-1 mx-2">
                                <div class="my-1 mx-0">
                                    <span class="fw-bold">Primary Findings</span>
                                </div>
                                <div>
                                    ${primaryFindings?.length > 0 ? html`
                                        ${primaryFindings.map(variant => this.renderVariant(variant))}
                                    ` : html`
                                        <div class="m-1">No primary findings found</div>
                                    `}
                                </div>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="my-1 mx-2">
                                <div class="float-end">
                                    <button type="button" ?disabled="${!this.clinicalAnalysis.interpretation?.primaryFindings?.length}"
                                            class="btn btn-primary m-1 ${this.clinicalAnalysis.interpretation?.primaryFindings?.length ? "" : "disabled"}"
                                            @click="${this.onFilterPrimaryFindingVariants}">Filter
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group">
                        <button type="button" id="${this._prefix}ResetMenu" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Remove not saved variants" ?disabled="${!this.write}">
                            <i class="fas fa-eraser pe-1" aria-hidden="true"></i>
                            <strong>Reset</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li class="dropdown-item">
                                <div class="my-1 mx-0">
                                    <span class="fw-bold">Added Variants</span>
                                </div>
                                <div>
                                    ${this.state.addedVariants?.length > 0 ? html`
                                        ${this.state.addedVariants.map(variant => this.renderVariant(variant, ""))}
                                    ` : html`
                                        <div class="m-1">No new variants selected</div>
                                    `}
                                </div>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="dropdown-item">
                                <div class="my-1 mx-0">
                                    <span class="fw-bold">Removed Variants</span>
                                </div>
                                <div>
                                    ${this.state.removedVariants?.length > 0 ? html`
                                        ${this.state.removedVariants.map(variant => this.renderVariant(variant, ""))}
                                    ` : html`
                                        <div class="m-1">No variants to remove</div>
                                    `}
                                </div>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="dropdown-item">
                                <div class="float-end">
                                    <button type="button" ?disabled="${!(this.state.addedVariants?.length || this.state.removedVariants?.length)}"
                                            class="btn btn-primary m-1 ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}"
                                            @click="${this.onFilterModifiedVariants}">Filter
                                    </button>
                                    <button type="button" ?disabled="${!(this.state.addedVariants?.length || this.state.removedVariants?.length)}"
                                            class="btn btn-primary m-1 ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}"
                                            @click="${this.onResetModifiedVariants}">Reset
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group">
                        <button type="button" id="${this._prefix}SaveMenu" class="btn ${hasVariantsToSave ? "btn-danger" : "btn-primary"} dropdown-toggle"
                                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Save variants in the server" ?disabled="${!this.write}">
                            <i class="fas fa-save pe-1" aria-hidden="true"></i>
                            <strong>Save</strong>
                            ${hasVariantsToSave ? html`
                                <span class="badge bg-white text-danger rounded-pill ms-1">
                                    ${this.state.addedVariants.length + this.state.removedVariants.length + this.state.updatedVariants.length}
                                </span>
                            ` : null}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${this._prefix}SaveMenu" style="width: 360px">
                            <li class="my-1 mx-2">
                                <variant-interpreter-browser-save
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .state="${this.state}">
                                </variant-interpreter-browser-save>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("variant-interpreter-browser-toolbar", VariantInterpreterBrowserToolbar);
