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

        this.#init();
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

    #init() {
        this.sampleData = "";
        this._sampleData = {};

        this.fields = [
            {
                id: "DP", name: "Depth"
            },
            {
                id: "AF", name: "AF"
            },
            {
                id: "EXT_VAF", name: "VAF"
            }
        ];
        this.indexedFields = {};

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
        // Parse custom fields and add them to the fields array
        for (const dataFilter of this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers[0]?.dataFilters) {
            if (dataFilter.source === "SAMPLE") {
                const indexPosition = this.fields.findIndex(f => f.id === dataFilter.id);
                if (indexPosition >= 0) {
                    this.fields[indexPosition] = {id: dataFilter.id, name: dataFilter.name};
                } else {
                    this.fields.push({id: dataFilter.id, name: dataFilter.name});
                }
            }
        }

        // Search for the indexed fields
        for (const field of this.fields) {
            this.indexedFields[field.id] = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                .find(f => f.key === field.id && f.source === "SAMPLE");
        }
        this._config = this.getDefaultConfig();
    }

    sampleDataObserver() {
        if (this.sampleData) {
            const sampleDataFilters = this.sampleData.split(";");

            for (const field of this.fields) {
                const filter = sampleDataFilters.find(filter => filter.startsWith(field.id))?.replace(field.id, "");
                filter ? this._sampleData[field.id] = filter : delete this._sampleData[field.id];
                this.indexedFields[field.id] = this.opencgaSession.study.internal.configuration.variantEngine.sampleIndex.fileIndexConfiguration.customFields
                    .find(f => f.key === field.id && f.source === "SAMPLE");
            }

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
                .data="${this._sampleData}"
                .config="${this._config}"
                @fieldChange="${this.filterChange}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const elements = [];
        for (const field of this.fields) {
            // Check if the field is actually indexed, only indexed fields can be used for filtering
            if (this.indexedFields[field.id]) {
                if (this.indexedFields[field.id]?.type?.startsWith("RANGE_")) {
                    elements.push({
                        name: field.name,
                        field: field.id,
                        type: "input-number",
                        comparators: this.indexedFields[field.id]?.type === "RANGE_LT" ? "<,>=" : "<=,>",
                        allowedValues: this.indexedFields[field.id]?.thresholds,
                        display: {
                            defaultValue: "",
                            visible: () => this.indexedFields[field.id]?.thresholds?.length > 0,
                        }
                    });
                } else {
                    // Categorical
                    elements.push({
                        name: field.name,
                        field: field.id,
                        type: "select",
                        allowedValues: this.indexedFields[field.id]?.values,
                        multiple: this.indexedFields[field.id]?.type === "CATEGORICAL_MULTI_VALUE",
                        display: {
                            defaultValue: "",
                        },
                    });
                }
            }
        }

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
                    elements: elements
                }
            ],
        };
    }

}

customElements.define("variant-file-format-filter", VariantFileFormatFilter);
