
/**
 * Copyright 2015-2023 OpenCB
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


import {DATA_FORM_EXAMPLE} from "../conf/data-form.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../../webcomponents/commons/forms/data-form.js";
import "../../../webcomponents/loading-spinner.js";
import "../../../webcomponents/variant/variant-browser-grid.js";
import Types from "../../../webcomponents/commons/types";
import CatalogGridFormatter from "../../../webcomponents/commons/catalog-grid-formatter";
import VariantTableFormatter from "../../../webcomponents/variant/variant-table-formatter";


class VariantBrowserGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            testVariantFile: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-browser";
        this.isLoading = false;
        this.variants = [];
        this._dataFormConfig = DATA_FORM_EXAMPLE;

        this._config = {};
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("testVariantFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testVariantFile}.json`)
            .then(content => {
                this.variants = content;
                if (this.testVariantFile === "variant-browser-germline") {
                    this.germlineMutate();
                } else {
                    // this.cancerMutate();
                }
            })
            .catch(err => {
                // this.variants = [];
                console.log(err);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    germlineMutate() {
        // 1. no gene names in the CT array
        this.variants[10].annotation.consequenceTypes.forEach(ct => ct.geneName = null);

        // 2. SIFT with no description available
        // this.variants[10].annotation.consequenceTypes
        //     .filter(ct => ct.proteinVariantAnnotation)
        //     .forEach(ct => delete ct.proteinVariantAnnotation.substitutionScores[0].description);
        // Finally, we update variants mem address to force a rendering
        this.variants = [...this.variants];
    }


    changeView(id) {
        this.activeTab = id;
        // this.mutate();
    }

    onSettingsUpdate() {
        this._config = {
            ...this._config,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid
        };
        this.opencgaSessionObserver();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Variant Browser (${this.testVariantFile?.split("-")?.at(-1)})
            </h2>

            <data-form
                .data="${{variants: this.variants.slice(0, 10)}}"
                .config="${this.getDefaultConfig()}">
            </data-form>

            <variant-browser-grid
                .toolId="${this.COMPONENT_ID}"
                .variants="${this.variants}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                @settingsUpdate="${() => this.onSettingsUpdate()}"
                .populationFrequencies="${this.config.populationFrequencies}">
            </variant-browser-grid>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal",
                buttonsVisible: false,
            },
            sections: [
                {
                    title: "Variants",
                    display: {
                    },
                    elements: [
                        {
                            title: "List of Variants",
                            field: "variants",
                            type: "table",
                            display: {
                                className: "",
                                style: "",
                                headerClassName: "",
                                headerStyle: "",
                                headerVisible: true,
                                // filter: array => array.filter(item => item.somatic),
                                // transform: array => array.map(item => {
                                //     item.somatic = true;
                                //     return item;
                                // }),
                                defaultValue: "-",
                                columns: [
                                    VariantTableFormatter.variantIdFormatter(),
                                    VariantTableFormatter.geneFormatter()
                                    // {
                                    //     title: "Somatic",
                                    //     type: "custom",
                                    //     field: "somatic",
                                    //     // formatter: value => value ? "true" : "false",
                                    //     display: {
                                    //         render: somatic => somatic ? "true" : "false",
                                    //         style: {
                                    //             color: "red"
                                    //         }
                                    //     }
                                    // },
                                    // {
                                    //     title: "Phenotypes",
                                    //     field: "phenotypes",
                                    //     type: "list"
                                    //     // formatter: value => value?.length ? `${value.map(d => d.id).join(", ")}` : "-",
                                    // },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-browser-grid-test", VariantBrowserGridTest);
