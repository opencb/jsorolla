
/*
 * Copyright 2015-2024 OpenCB
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


import "../../../webcomponents/commons/forms/data-form.js";
import VariantTableFormatter from "../../../webcomponents/variant/variant-table-formatter";
import UtilsNew from "../../../core/utils-new";


class DataFormTableTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            testVariantFile: {
                type: String,
            },
            testDataVersion: {
                type: String,
            },
            config: {
                type: Object,
            }
        };
    }

    #init() {
        this._dataFormConfig = this.getDefaultConfig();
        this.variants = [];
        this.gridTypes = {
            snv: "variantInterpreterCancerSNV",
            cnv: "variantInterpreterCancerCNV",
            rearrangements: "variantInterpreterRearrangement",
        };
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

    onSubmit(e) {
        console.log("Data test", this.variants);
        console.log("Data form Data", e);
        console.log("test input", e);
    }

    render() {
        return html`
            <data-form
                .data="${{variants: this.variants.slice(0, 10)}}"
                .config="${this._dataFormConfig}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const gridConfig = {
            ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.rearrangements]?.grid || {}),
            somatic: false,
            geneSet: {
                ensembl: true,
                refseq: false,
            },
            consequenceType: {
                maneTranscript: true,
                gencodeBasicTranscript: true,
                ensemblCanonicalTranscript: true,
                refseqTranscript: true,
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,

                showNegativeConsequenceTypes: true
            },
            populationFrequenciesConfig: {
                displayMode: "FREQUENCY_BOX"
            },
            variantTypes: ["SNV"],
        };

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
                                defaultLayout: "vertical",
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
                                    VariantTableFormatter.geneFormatter(),
                                    VariantTableFormatter.hgvsFormatter(gridConfig),
                                    VariantTableFormatter.typeFormatter(),
                                    VariantTableFormatter.consequenceTypeFormatter("", gridConfig),
                                    {
                                        title: "Deleteriousness",
                                        display: {
                                            columns: [
                                                VariantTableFormatter.siftFormatter(),
                                                VariantTableFormatter.polyphenFormatter(),
                                                VariantTableFormatter.revelFormatter(),
                                                VariantTableFormatter.caddScaledFormatter(),
                                                VariantTableFormatter.spliceAIFormatter(),
                                            ]
                                        }
                                    },
                                    {
                                        title: "Conservation",
                                        display: {
                                            columns: [
                                                VariantTableFormatter.conservationFormatter("PhyloP"),
                                                VariantTableFormatter.conservationFormatter("PhastCons"),
                                                VariantTableFormatter.conservationFormatter("GERP"),
                                            ]
                                        }
                                    },
                                    // VariantTableFormatter.populationFrequencyFormatter(),
                                    {
                                        title: "Clinical",
                                        display: {
                                            columns: [
                                                VariantTableFormatter.clinvarFormatter(),
                                                VariantTableFormatter.cosmicFormatter(),
                                            ]
                                        }
                                    }
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }


}

customElements.define("data-form-table-test", DataFormTableTest);
