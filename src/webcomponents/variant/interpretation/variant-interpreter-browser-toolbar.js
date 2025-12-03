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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";

class VariantInterpreterBrowserToolbar extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            variantInclusionState: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    onFilterInclusionVariants() {
        const variants = [];
        this.variantInclusionState.map(inclusion => variants.push(...inclusion.variants));
        LitUtils.dispatchCustomEvent(this, "filterVariants", null, {
            variants: variants
        });
        // Josemi 20240701 NOTE: this is a terrible and temporal fix to force closing the Save Menu
        // when user clicks the 'Filter' button in the View menu (primary findings).
        this.querySelector(`div#${this._prefix}InclusionVariants div.dropdown-menu`)?.classList?.toggle?.("show");
    }

    onFilterPrimaryAndSecondaryFindingVariants() {
        LitUtils.dispatchCustomEvent(this, "filterVariants", null, {
            variants: [
                ...(this.clinicalAnalysis.interpretation.primaryFindings || []),
                ...(this.clinicalAnalysis.interpretation.secondaryFindings || []),
            ],
        });
        // Josemi 20240701 NOTE: this is a terrible and temporal fix to force closing the Save Menu
        // when user clicks the 'Filter' button in the View menu (primary findings).
        this.querySelector(`div#${this._prefix}View div.dropdown-menu`)?.classList?.toggle?.("show");
    }

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
                                <span class="my-0 mx-3 float-end">Genotype: ${GT} (${FILTER})</span>
                            </div>
                        `;
                    }) : html `<div class="text-body-secondary"><span class="my-0 mx-3">No variants found.</span></div>`
                }
            </div>
        `;
    }

    renderVariant(variant, isPrimary = true) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));

        return html`
            <div class="mb-1 border-start border-4 ${isPrimary ? "border-primary" : "border-secondary"}">
                <div class="my-1 mx-2"><b>${variant.id}</b> <i class="ps-3">${variant.annotation.displayConsequenceType || ""}</i></div>
                <div class="my-1 mx-2 small text-secondary">${geneNames.join(", ")}</div>
            </div>
        `;
    }

    render() {
        const findings = [
            {
                title: "Primary Findings",
                isPrimary: true,
                variants: this.clinicalAnalysis?.interpretation?.primaryFindings || [],
            },
            {
                title: "Secondary Findings",
                isPrimary: false,
                variants: this.clinicalAnalysis?.interpretation?.secondaryFindings || [],
            },
        ];

        return html`
            <div class="d-flex gap-1">
                <div class="dropdown d-flex" id="${this._prefix}InclusionVariants">
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        <i class="fas fa-tasks pe-1"></i>
                        <strong>Inclusion Variants</strong>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end shadow" style="width:400px">
                        <div class="my-1 mx-0">
                            <span class="fw-bold">Variants Included</span>
                        </div>
                        ${this.variantInclusionState?.length > 0 ? html`
                            ${this.variantInclusionState.map(inclusion => this.renderInclusionVariant(inclusion))}
                            <hr class="dropdown-divider">
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-primary" @click="${this.onFilterInclusionVariants}">
                                    <i class="fas fa-filter me-1"></i>
                                    <span>Filter Variants</span>
                                </button>
                            </div>
                        ` : html`
                            <div class="d-flex flex-column align-items-center py-4 px-4 bg-gray-100 rounded">
                                <div class="mb-2">
                                    <i class="fas fa-list fs-2"></i>
                                </div>
                                <div class="fw-bold lh-sm">Variant Inclusion list not defined.</div>
                            </div>
                        `}
                    </div>
                </div>
                <div class="dropdown d-flex" id="${this._prefix}View">
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        <i class="fas fa-eye pe-1"></i>
                        <strong>Selected Variants</strong>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end shadow" style="width:400px">
                        <div class="d-flex flex-column gap-1">
                            ${findings.map(finding => html`
                                <div class="">
                                    <div class="my-1 mx-0">
                                        <span class="fw-bold">${finding.title}</span>
                                    </div>
                                    ${finding.variants?.length > 0 ? html`
                                        <div class="overflow-y-auto m-1" style="max-height:350px;">
                                            ${finding.variants.map(variant => this.renderVariant(variant, finding.isPrimary))}
                                        </div>
                                    ` : html`
                                        <div class="d-flex flex-column align-items-center py-4 px-4 bg-gray-100 rounded">
                                            <div class="mb-2">
                                                <i class="fas fa-list fs-2"></i>
                                            </div>
                                            <div class="fw-bold lh-sm">No ${finding.title.toLowerCase()} saved.</div>
                                        </div>
                                    `}
                                </div>
                            `)}
                        </div>
                        ${(findings[0].variants?.length || findings[1].variants?.length) ? html`
                            <hr class="dropdown-divider">
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-primary" @click="${this.onFilterPrimaryAndSecondaryFindingVariants}">
                                    <i class="fas fa-filter me-1"></i>
                                    <span>Filter Variants</span>
                                </button>
                            </div>
                        ` : nothing}
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
