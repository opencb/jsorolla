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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";

export default class VariantFileFormatFilter extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            depth: {
                type: String
            },
            vaf: {
                type: String
            },
            opencgaSession: {
                type: Object
            }
        };
    }

    _init() {
        this.depth = null;
        this.vaf = null;
        this.depthChecked = false;
        this.vafChecked = false;

        this.sampleData = {};
    }

    update(changedProperties) {
        if (changedProperties.has("depth")) {
            this.depthObserver();
        }
        if (changedProperties.has("vaf")) {
            this.vafObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.depthObserver();
            this.vafObserver();
        }
        super.update(changedProperties);
    }

    depthObserver() {
        this.depthChecked = !!this.depth;
        if (this.opencgaSession?.study?.internal?.configuration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields?.length > 0) {
            this.depthIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                .find(field => field.key === "DP");
            this.depthValues = this.depthIndex?.thresholds;
        }
    }

    vafObserver() {
        this.vafChecked = !!this.vaf;
        if (this.opencgaSession?.study?.internal?.configuration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields?.length > 0) {
            this.extVafIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                .find(field => field.key === "EXT_VAF");
            this.vafValues = this.extVafIndex?.thresholds;
        }
    }

    filterChange(e, field) {
        e.stopPropagation();

        switch (field.toUpperCase()) {
            case "DP_CHECKBOX":
                this.depthChecked = e.target.checked;
                if (this.depthChecked && this.depth) {
                    this.sampleData.DP = ">=" + this.depth;
                } else {
                    delete this.sampleData.DP;
                }
                this.requestUpdate();
                break;
            case "DP":
                this.depth = e.detail.value;
                if (this.depthChecked && this.depth) {
                    this.sampleData.DP = ">=" + this.depth;
                } else {
                    delete this.sampleData.DP;
                }
                break;
            case "VAF_CHECKBOX":
                this.vafChecked = e.target.checked;
                if (this.vafChecked && this.vaf) {
                    this.sampleData.EXT_VAF = ">=" + this.vaf;
                } else {
                    delete this.sampleData.EXT_VAF;
                }
                this.requestUpdate();
                break;
            case "VAF":
                this.vaf = e.detail.value;
                if (this.vafChecked && this.vaf) {
                    this.sampleData.EXT_VAF = ">=" + this.vaf;
                } else {
                    delete this.sampleData.EXT_VAF;
                }
                break;
        }
        this.notifyFilterChange();
    }

    notifyFilterChange() {
        const query = Object.keys(this.sampleData)
            .map(key => key + this.sampleData[key])
            .join(";");
        LitUtils.dispatchCustomEvent(this, "filterChange", query);
    }

    getDefaultConfig() {
        return {};
    }

    render() {
        return html`
            ${this.depthValues ? html`
                <form class="form-horizontal subsection-content">
                    <div class="subsection-content form-group">
                        <div class="col-md-7" style="padding-right: 5px">
                            <input type="checkbox"
                                   .checked="${this.depthChecked}"
                                   style="margin-right: 5px"
                                   @change="${e => this.filterChange(e, "DP_CHECKBOX")}"
                                   data-cy="filter-depth">
                            <span>Select <span style="font-weight: bold;">DEPTH =></span></span>
                        </div>
                        <div class="col-md-5" style="padding-left: 5px">
                            <select-field-filter
                                .value="${this.depth}"
                                .data="${this.depthValues}"
                                .disabled="${!this.depthChecked}"
                                data-cy="filter-pass-value"
                                @filterChange="${e => this.filterChange(e, "DP")}">
                            </select-field-filter>
                        </div>
                    </div>
                </form>` : null
            }

            ${this.vafValues ? html`
                <form class="form-horizontal subsection-content">
                    <div class="subsection-content form-group">
                        <div class="col-md-7" style="padding-right: 5px">
                            <input type="checkbox"
                                   .checked="${this.vafChecked}"
                                   style="margin-right: 5px"
                                   @change="${e => this.filterChange(e, "VAF_CHECKBOX")}"
                                   data-cy="filter-extvaf">
                            <span>Select <span style="font-weight: bold;">VAF =></span></span>
                        </div>
                        <div class="col-md-5" style="padding-left: 5px">
                            <select-field-filter
                                .value="${this.vaf}"
                                .data="${this.vafValues}"
                                .disabled="${!this.vafChecked}"
                                data-cy="filter-pass-value"
                                @filterChange="${e => this.filterChange(e, "VAF")}">
                            </select-field-filter>
                        </div>
                    </div>
                </form>` : null
            }
        `;
    }

}

customElements.define("variant-file-format-filter", VariantFileFormatFilter);
