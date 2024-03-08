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

import {html, LitElement} from "lit";
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
            sampleData: {
                type: String
            },
            opencgaSession: {
                type: Object
            }
        };
    }

    _init() {
        this.sampleData = "";
        this._sampleData = {};

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("sampleData")) {
            this.sampleDataObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.depthIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
            .find(field => field.key === "DP" && field.source === "SAMPLE");
        this.afIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
            .find(field => field.key === "AF" && field.source === "SAMPLE");
        this.extVafIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
            .find(field => field.key === "EXT_VAF" && field.source === "SAMPLE");
        this._config = this.getDefaultConfig();
    }

    sampleDataObserver() {
        if (this.sampleData) {
            const sampleDataFilters = this.sampleData.split(";");

            const depth = sampleDataFilters.find(filter => filter.startsWith("DP"))?.replace("DP", "");
            depth ? this._sampleData.DP = depth : delete this._sampleData.DP;
            this.depthIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                .find(field => field.key === "DP" && field.source === "SAMPLE");

            const af = sampleDataFilters.find(filter => filter.startsWith("AF"))?.replace("AF", "");
            af ? this._sampleData.AF = af : delete this._sampleData.AF;
            this.afIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                .find(field => field.key === "AF" && field.source === "SAMPLE");

            const extVaf = sampleDataFilters.find(filter => filter.startsWith("EXT_VAF"))?.replace("EXT_VAF", "");
            extVaf ? this._sampleData.EXT_VAF = extVaf : delete this._sampleData.EXT_VAF;
            this.extVafIndex = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                .find(field => field.key === "EXT_VAF" && field.source === "SAMPLE");

            this._config = this.getDefaultConfig();
        } else {
            this._sampleData = {};
        }
    }

    filterChange(e) {
        if (e.detail.value) {
            this._sampleData[e.detail.param] = e.detail.value;
        } else {
            delete this._sampleData[e.detail.param];
        }

        const query = Object.keys(this._sampleData)
            .map(key => key + this._sampleData[key])
            .join(";");
        LitUtils.dispatchCustomEvent(this, "filterChange", query);
    }

    render() {
        return html`
            <data-form
                .data=${this._sampleData}
                .config="${this._config}"
                @fieldChange="${this.filterChange}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "",
                defaultLayout: "vertical"
            },
            sections: [
                {
                    title: "",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 0"
                    },
                    elements: [
                        {
                            name: "Depth",
                            field: "DP",
                            type: "input-number",
                            comparators: this.depthIndex?.type === "RANGE_LT" ? "<,>=" : "<=,>",
                            allowedValues: this.depthIndex?.thresholds,
                            display: {
                                defaultValue: "",
                                visible: () => this.depthIndex?.thresholds?.length > 0,
                            }
                        },
                        {
                            name: "AF",
                            field: "AF",
                            type: "input-number",
                            comparators: this.afIndex?.type === "RANGE_LT" ? "<,>=" : "<=,>",
                            allowedValues: this.afIndex?.thresholds,
                            display: {
                                defaultValue: "",
                                visible: () => this.afIndex?.thresholds?.length > 0,
                            }
                        },
                        {
                            name: "VAF",
                            field: "EXT_VAF",
                            type: "input-number",
                            comparators: this.extVafIndex?.type === "RANGE_LT" ? "<,>=" : "<=,>",
                            allowedValues: this.extVafIndex?.thresholds,
                            display: {
                                defaultValue: "",
                                visible: () => this.extVafIndex?.thresholds?.length > 0,
                            }
                        }
                    ]
                }
            ],
        };
    }

}

customElements.define("variant-file-format-filter", VariantFileFormatFilter);
