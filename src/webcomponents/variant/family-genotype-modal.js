/**
 * Copyright 2015-2019 OpenCB
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
import {portal} from "../../core/directives/portal.js";
import UtilsNew from "../../core/utils-new.js";
import "./family-genotype-filter.js";

export default class FamilyGenotypeModal extends LitElement {

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
            genotype: {
                type: Object
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
        this._errorState = false;
        this._config = this.getDefaultConfig();
    }

    firstUpdated() {
        // Note: this is a workaround to show/hide the modal-backdrop when the modal is shown/hidden
        // this is needed when this modal is rendered inside an offcanvas
        document.querySelector("#" + this._prefix + "SampleGenotypeFilterModal").addEventListener("show.bs.modal", () => {
            document.querySelector("#" + this._prefix + "SampleGenotypeFilterModalBackdrop").style.display = "block";
        });
        document.querySelector("#" + this._prefix + "SampleGenotypeFilterModal").addEventListener("hide.bs.modal", () => {
            document.querySelector("#" + this._prefix + "SampleGenotypeFilterModalBackdrop").style.display = "none";
        });
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

    showModal() {
        const sampleGenotypeFilterModal = new bootstrap.Modal("#" + this._prefix + "SampleGenotypeFilterModal");
        sampleGenotypeFilterModal.show();
    }

    // handle error state
    onFilterChange(e) {
        this._errorState = e.detail.errorState;
        this.requestUpdate();
    }

    render() {
        // Check Project exists
        if (!this.clinicalAnalysis || !this.opencgaSession) {
            return nothing;
        }

        return html`
            <div>
                ${this._config.text ? html`
                    <div class="mb-2">${this._config.text}</div>
                ` : nothing}
                <div class="d-grid">
                    <button type="button" class="btn btn-light multi-line" @click="${this.showModal}">
                        Customize
                    </button>
                </div>
            </div>
            ${portal(document.body, html`
                <div class="modal-backdrop show" id="${this._prefix}SampleGenotypeFilterModalBackdrop" style="display:none;"></div>
                <div class="modal fade" id="${this._prefix}SampleGenotypeFilterModal" tabindex="-1" style="overflow-y:visible;" data-bs-backdrop="false">
                    <div class="modal-dialog" style="min-width: 1280px;max-width: 1280px;">
                        <div class="modal-content">
                            <div class="modal-header my-2 mx-1">
                                <h3>Family Genotype Filter</h3>
                            </div>
                            <div class="modal-body">
                                <family-genotype-filter
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .genotype="${this.genotype}"
                                    @filterChange="${this.onFilterChange}">
                                </family-genotype-filter>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal" .disabled=${!!this._errorState}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            `)}
        `;
    }

    getDefaultConfig() {
        return {
            text: "Select sample genotype filter (e.g recessive, compound heterozygous, ...):"
        };
    }

}

customElements.define("family-genotype-modal", FamilyGenotypeModal);
