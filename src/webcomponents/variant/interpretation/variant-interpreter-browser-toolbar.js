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
import LitUtils from "../../commons/utils/lit-utils.js";


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
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            state: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
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

    renderVariant(variant, icon) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));
        const iconHtml = icon ? html`<span style="float: right; cursor: pointer"><i class="${icon}"></i></span>` : "";

        return html`
            <div style="border-left: 2px solid #0c2f4c; margin: 15px 0px">
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
            <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin: 0px 5px 20px 0px">
                <div class="pull-right" role="group">
                    <div class="btn-group" style="margin-right: 2px">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false" title="Show saved variants">
                            <i class="fas fa-eye icon-padding" aria-hidden="true"></i>
                            <strong>View</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
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
                                aria-expanded="false" title="Remove not saved variants">
                            <i class="fas fa-eraser icon-padding" aria-hidden="true"></i>
                            <strong>Reset</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Added Variants</span>
                                </div>
                                <div>
                                    ${this.state.addedVariants?.length > 0 ? html`
                                        ${this.state.addedVariants.map(variant => this.renderVariant(variant, "fas fa-times"))}
                                    ` : html`
                                        <div style="margin: 5px 5px">No new variants selected</div>
                                    `}
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Removed Variants</span>
                                </div>
                                <div>
                                    ${this.state.removedVariants?.length > 0 ? html`
                                        ${this.state.removedVariants.map(variant => this.renderVariant(variant, "fas fa-times"))}
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
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Save variants in the server">
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
                                <div style="margin: 5px 0px">
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
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Add new comment</span>
                                </div>
                                <div style="margin: 5px 0px">
                                    <text-field-filter
                                        placeholder="Add comment..." .rows=${3} @filterChange="${e => this.onSaveFieldsChange("message", e)}"></text-field-filter>
                                </div>
                                <div style="margin: 5px 0px">
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
        return {};
    }

}

customElements.define("variant-interpreter-browser-toolbar", VariantInterpreterBrowserToolbar);
