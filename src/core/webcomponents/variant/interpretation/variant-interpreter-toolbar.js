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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";


class VariantInterpreterToolbar extends LitElement {

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
            clinicalAnalysisManager: {
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
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            // this.requestUpdate();
        }
        if (changedProperties.has("clinicalAnalysisManager")) {
            this.requestUpdate();
        }
    }

    // onViewVariants(e) {
    //     this.dispatchEvent(new CustomEvent("viewInterpretation", {
    //         detail: {
    //             comment: this.comment
    //         },
    //         bubbles: true,
    //         composed: true
    //     }));
    // }

    onResetVariants(e) {
        this.clinicalAnalysisManager.reset();
        this.clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
    }

    onSaveInterpretation(e) {
        this.dispatchEvent(new CustomEvent("saveInterpretation", {
            detail: {
                comment: this.comment
            },
            bubbles: true,
            composed: true
        }));
        this.comment = {};
    }

    onFilterChange(type, e) {
        this.comment = this.comment ? this.comment : {};
        switch (type) {
            case "message":
                this.comment.message = e.detail.value
                break;
            case "tags":
                this.comment.tags = e.detail.value
                break;
        }
    }

    getDefaultConfig() {
        return {

        };
    }

    render() {
        return html`
            <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin-bottom: 20px">
                <div class="pull-right" role="group">
                    <!--
                    <div class="btn-group">
                        ${this.state.addedVariants?.length || this.state.removedVariants?.length 
                            ? html`
                                <label>Variants modified: </label>
                                <span>${this.state.addedVariants.length}</span>
                            ` 
                            : null
                        }                  
                    </div>
                    -->
                    
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" 
                                    aria-expanded="false" title="Show saved variants">
                            <i class="fas fa-eye icon-padding" aria-hidden="true"></i> View
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Added Variants</span>
                                </div>
                                <div>
                                    ${this.state.addedVariants?.length > 0
                                        ? this.state.addedVariants.map(variant => html`
                                            <div style="background-color: rgb(245, 245, 245); margin: 5px 5px">
                                                <label style="font-weight: normal; width: 300px; margin: 5px">${variant.id} (${variant.type})</label>
                                            </div>
                                        `)
                                        : html`<div style="margin: 5px 5px">No new variants selected</div>`
                                    }
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Removed Variants</span>
                                </div>
                                <div>
                                    ${this.state.removedVariants?.length > 0
                                        ? this.state.removedVariants.map(variant => html`
                                            <div style="background-color: rgb(245, 245, 245); margin: 5px 5px">
                                                <label style="font-weight: normal; width: 300px; margin: 5px">${variant.id} (${variant.type})</label>
                                            </div>
                                        `)
                                        : html`<div style="margin: 5px 5px">No variants to remove</div>`
                                    }
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="float: right">
                                    <button type="button" class="btn btn-primary ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}" 
                                        @click="${this.onResetVariants}">Filter
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="btn-group">
                        <button type="button" id="${this._prefix}ResetMenu" class="btn btn-primary dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" 
                                    aria-expanded="false" title="Remove not saved variants">
                            <i class="fas fa-eraser icon-padding" aria-hidden="true"></i> Reset
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Added Variants</span>
                                </div>
                                <div>
                                    ${this.state.addedVariants?.length > 0
                                        ? this.state.addedVariants.map(variant => html`
                                                                                <div style="background-color: rgb(245, 245, 245); margin: 5px 5px">
                                                                                    <label style="font-weight: normal; width: 300px; margin: 5px">${variant.id} (${variant.type})</label>
                                                                                    <span style="cursor: pointer"><i class="fas fa-times"></i></span>
                                                                                </div>
                                                                            `)
                                        : html`<div style="margin: 5px 5px">No new variants selected</div>`
                                    }
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Removed Variants</span>
                                </div>
                                <div>
                                    ${this.state.removedVariants?.length > 0
                                        ? this.state.removedVariants.map(variant => html`
                                            <div style="background-color: rgb(245, 245, 245); margin: 5px 5px">
                                                <label style="font-weight: normal; width: 300px; margin: 5px">${variant.id} (${variant.type})</label>
                                                <span style="cursor: pointer"><i class="fas fa-times"></i></span>
                                            </div>
                                        `)
                                        : html`<div style="margin: 5px 5px">No variants to remove</div>`
                                    }
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="float: right">
                                    <button type="button" class="btn btn-primary ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}" 
                                        @click="${this.onResetVariants}">Reset
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                            
                    <div class="btn-group">
                        <button type="button" id="${this._prefix}SaveMenu" class="btn btn-primary dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" 
                                    aria-expanded="false" title="Save variants in the server">
                            <i class="fas fa-save icon-padding" aria-hidden="true"></i> Save 
                            ${this.state.addedVariants?.length || this.state.removedVariants?.length
                                ? html`
                                    <span class="badge" style="margin-left: 5px">
                                        ${this.state.addedVariants.length + this.state.removedVariants.length}
                                    </span>`
                                : null
                            }
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
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="margin: 5px 0px">
                                    <span style="font-weight: bold">Add new comment</span>
                                </div>
                                <div style="margin: 5px 0px">
                                    <text-field-filter placeholder="Add comment..." .rows=${3} @filterChange="${e => this.onFilterChange("message", e)}"></text-field-filter>
                                </div>
                                <div style="margin: 5px 0px">
                                    <text-field-filter placeholder="Add tags..." .rows=${1} @filterChange="${e => this.onFilterChange(e)}"></text-field-filter>
                                </div>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li style="margin: 5px 10px">
                                <div style="float: right">
                                    <button type="button" class="btn btn-primary ${this.state.addedVariants?.length || this.state.removedVariants?.length ? "" : "disabled"}" 
                                        @click="${this.onSaveInterpretation}">Save
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("variant-interpreter-toolbar", VariantInterpreterToolbar);
