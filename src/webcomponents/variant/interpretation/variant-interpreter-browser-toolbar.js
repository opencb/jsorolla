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
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
    }

    onFilterPharmacogenomicsVariants() {
        LitUtils.dispatchCustomEvent(this, "filterPharmacogenomicsVariants", null);
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
                <div style="margin: 5px 10px; display: flex; align-items: center; justify-content: space-between;">${inclusionHtml} ${iconHtml}</div>
                ${
                    inclusion.variants?.length > 0 ? inclusion.variants.map(variant => {
                        const GT = variant.studies[0]?.samples[0]?.data[0] || "No GT found";
                        const FILTER = variant.studies[0]?.files[0]?.data.FILTER || "NA";
                        return html`
                            <div class="help-block" style="display: flex; flex-direction: column; overflow-wrap: break-word;">
                                <span style="margin: 0 20px">${variant.id}</span>
                                <span style="margin: 0 20px;float: right">Genotype: ${GT} (${FILTER})</span>
                            </div>
                        `;
                    }) : html `<div class="help-block"><span style="margin: 0 20px">No variants found.</span></div>`
                }
            </div>
        `;
    }

    renderVariant(variant, icon) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));
        const iconHtml = icon ? html`<span style="cursor: pointer"><i class="${icon}"></i></span>` : "";

        return html`
            <div class="break-word" style="border-left: 2px solid #0c2f4c; margin: 15px 0;">
                <div style="margin: 5px 10px">${variant.id} (${variant.type}) ${iconHtml}</div>
                <div style="margin: 5px 10px">${variant.annotation.displayConsequenceType}</div>
                <div style="margin: 5px 10px">${geneNames.join(", ")}</div>
            </div>
        `;
    }

    render() {
        const primaryFindings = this.clinicalAnalysis.interpretation?.primaryFindings;
        const hasVariantsToSave = this.state.addedVariants?.length || this.state.removedVariants?.length || this.state.updatedVariants?.length;

        return html`
            <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin: 0 5px 20px 0">
                <div class="pull-right" role="group">
                    ${this._config?.showPharmacogenomicsFilter ? html`
                        <div class="btn-group" style="margin-right: 2px">
                            <button type="button" class="btn btn-primary" @click="${this.onFilterPharmacogenomicsVariants}">
                                <i class="fas fa-pills icon-padding" aria-hidden="true"></i>
                                <strong>Pharmacogenomics Variants</strong>
                            </button>
                        </div>
                    ` : nothing}

                    <div class="btn-group" style="margin-right: 2px">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Show inclusion list of variants">
                            <i class="fas fa-tasks icon-padding" aria-hidden="true"></i>
                            <strong>Inclusion Variants</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 420px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0">
                                    <span style="font-weight: bold">Variants Included</span>
                                </div>
                                <div>
                                    ${this.variantInclusionState?.length > 0 ? html`
                                        ${this.variantInclusionState.map(inclusion => this.renderInclusionVariant(inclusion))}

                                        <li role="separator" class="divider"></li>
                                        <li style="margin: 5px 10px">
                                            <div style="float: right">
                                                <button
                                                    type="button"
                                                    class="btn btn-primary"
                                                    @click="${this.onFilterInclusionVariants}" style="margin: 5px">Filter
                                                </button>
                                            </div>
                                        </li>
                                    ` : html`
                                        <div style="margin: 5px 5px">Variant Inclusion list not def</div>
                                    `}
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group" style="margin-right: 2px">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Show saved variants">
                            <i class="fas fa-eye icon-padding" aria-hidden="true"></i>
                            <strong>View</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0">
                                    <span style="font-weight: bold">Primary Findings</span>
                                </div>
                                <div>
                                    ${primaryFindings?.length > 0 ? html`
                                        ${primaryFindings.map(variant => this.renderVariant(variant))}
                                    ` : html`
                                        <div style="margin: 5px 5px">No primary findings found</div>
                                    `}
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="float: right">
                                    <button type="button" ?disabled="${!this.clinicalAnalysis.interpretation?.primaryFindings?.length}"
                                            class="btn btn-primary ${this.clinicalAnalysis.interpretation?.primaryFindings?.length ? "" : "disabled"}"
                                            @click="${this.onFilterPrimaryFindingVariants}" style="margin: 5px">Filter
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group" style="margin-right: 2px">
                        <button type="button" id="${this._prefix}ResetMenu" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Remove not saved variants" ?disabled="${!this.write}">
                            <i class="fas fa-eraser icon-padding" aria-hidden="true"></i>
                            <strong>Reset</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0">
                                    <span style="font-weight: bold">Added Variants</span>
                                </div>
                                <div>
                                    ${this.state.addedVariants?.length > 0 ? html`
                                        ${this.state.addedVariants.map(variant => this.renderVariant(variant, ""))}
                                    ` : html`
                                        <div style="margin: 5px 5px">No new variants selected</div>
                                    `}
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0">
                                    <span style="font-weight: bold">Removed Variants</span>
                                </div>
                                <div>
                                    ${this.state.removedVariants?.length > 0 ? html`
                                        ${this.state.removedVariants.map(variant => this.renderVariant(variant, ""))}
                                    ` : html`
                                        <div style="margin: 5px 5px">No variants to remove</div>
                                    `}
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="float: right">
                                    <button type="button" ?disabled="${!(this.state.addedVariants?.length || this.state.removedVariants?.length)}"
                                            class="btn btn-primary ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}"
                                            @click="${this.onFilterModifiedVariants}" style="margin: 5px">Filter
                                    </button>
                                    <button type="button" ?disabled="${!(this.state.addedVariants?.length || this.state.removedVariants?.length)}"
                                            class="btn btn-primary ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}"
                                            @click="${this.onResetModifiedVariants}" style="margin: 5px">Reset
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group">
                        <button type="button" id="${this._prefix}SaveMenu" class="btn ${hasVariantsToSave ? "btn-danger" : "btn-primary"} dropdown-toggle"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Save variants in the server" ?disabled="${!this.write}">
                            <i class="fas fa-save icon-padding" aria-hidden="true"></i>
                            <strong>Save</strong>
                            ${hasVariantsToSave ? html`
                                <span class="badge" style="margin-left: 5px">
                                    ${this.state.addedVariants.length + this.state.removedVariants.length + this.state.updatedVariants.length}
                                </span>
                            ` : null}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}SaveMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0">
                                    <span style="font-weight: bold">Change summary</span>
                                </div>
                                <div style="margin: 5px 10px">
                                    <div>
                                        <label style="font-weight: normal; width: 180px">New selected variants</label>
                                        <span style="color: darkgreen;font-weight: bold">${this.state.addedVariants?.length}</span>
                                    </div>
                                    <div>
                                        <label style="font-weight: normal; width: 180px">Removed variants</label>
                                        <span style="color: darkred;font-weight: bold">${this.state.removedVariants?.length}</span>
                                    </div>
                                    <div>
                                        <label style="font-weight: normal; width: 180px">Updated variants</label>
                                        <span style="color: darkblue;font-weight: bold">${this.state.updatedVariants?.length}</span>
                                    </div>
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0">
                                    <span style="font-weight: bold">Add new comment</span>
                                </div>
                                <div style="margin: 5px 0">
                                    <text-field-filter
                                        placeholder="Add comment..." .rows=${3} @filterChange="${e => this.onSaveFieldsChange("message", e)}"></text-field-filter>
                                </div>
                                <div style="margin: 5px 0">
                                    <text-field-filter
                                        placeholder="Add tags..."
                                        .rows=${1}
                                        @filterChange="${e => this.onSaveFieldsChange(e)}">
                                    </text-field-filter>
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="float: right">
                                    <button type="button" ?disabled="${!hasVariantsToSave}" class="btn btn-primary ${hasVariantsToSave ? "" : "disabled"}"
                                            @click="${this.onSaveInterpretation}" style="margin: 5px">Save
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showPharmacogenomicsFilter: false,
        };
    }

}

customElements.define("variant-interpreter-browser-toolbar", VariantInterpreterBrowserToolbar);
