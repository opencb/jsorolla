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
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

export default class VariantInterpreterGridConfig extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            // FIXME Temporary object used to check CellBase version and hide RefSeq filter
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "genotype.type":
                this.config.genotype.type = e.detail.value;
                break;
            case "showHgvs":
                this.config.showHgvs = e.detail.value;
                break;
            case "geneSet.ensembl":
            case "geneSet.refseq":
            case "consequenceType.all":
            case "consequenceType.maneTranscript":
            case "consequenceType.ensemblCanonicalTranscript":
            case "consequenceType.gencodeBasicTranscript":
            case "consequenceType.ccdsTranscript":
            case "consequenceType.lrgTranscript":
            case "consequenceType.ensemblTslTranscript":
            case "consequenceType.illuminaTSO500Transcript":
            case "consequenceType.eglhHaemoncTranscript":
            case "consequenceType.proteinCodingTranscript":
            case "consequenceType.highImpactConsequenceTypeTranscript":
            case "consequenceType.showNegativeConsequenceTypes":
                const fields = e.detail.param.split(".");
                if (!this.config[fields[0]]) {
                    this.config[fields[0]] = {};
                }
                this.config[fields[0]][fields[1]] = e.detail.value;

                if (e.detail.param === "consequenceType.all") {
                    // we need to refresh the form to display disabled checkboxes
                    this.requestUpdate();
                }
                break;
            case "activeHighlights":
                this.config.activeHighlights = (e.detail.value || "").split(",").filter(v => v.length > 0);
                break;
        }

        LitUtils.dispatchCustomEvent(this, "configChange", this.config);
    }

    render() {
        return html`
            <data-form
                .data="${this.config}"
                .config="${this.getConfigForm()}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getConfigForm() {
        return {
            id: "interpreter-grid-config",
            title: "",
            icon: "fas fa-user-md",
            type: "pills",
            validation: {
                validate: data => {
                    return data.geneSet?.ensembl || data.geneSet?.refseq;
                }
            },
            display: {
                width: 10,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                defaultLayout: "vertical",
                buttonsVisible: false
            },
            sections: [
                {
                    id: "gt",
                    title: "General Settings",
                    description: "Select some general options",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px",
                        visible: () => !!this.config?.genotype?.type
                    },
                    elements: [
                        {
                            title: "Select how genotypes are displayed",
                            field: "genotype.type",
                            type: "select",
                            allowedValues: ["ALLELES", "VCF_CALL", "ZYGOSITY", "VAF", "ALLELE_FREQUENCY", "ALLELE_FREQUENCY_BAR", "CIRCLE"],
                            display: {
                                width: 6,
                            }
                        },
                        {
                            title: "Show HGVS column",
                            field: "showHgvs",
                            type: "checkbox",
                            text: "Show HGVS",
                            display: {
                                width: 6,
                            }
                        }
                    ]
                },
                {
                    title: "Transcript Filter",
                    // description: "Select which transcripts and consequence types are displayed in the variant grid",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px"
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select the Gene Set to be displayed",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px",
                                visible: () => this.opencgaSession?.project?.cellbase?.version.startsWith("v5")
                            }
                        },
                        {
                            field: "geneSet.ensembl",
                            type: "checkbox",
                            text: "Ensembl",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                visible: () => this.opencgaSession?.project?.cellbase?.version.startsWith("v5")
                            }
                        },
                        {
                            field: "geneSet.refseq",
                            type: "checkbox",
                            text: "RefSeq",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                visible: () => this.opencgaSession?.project?.cellbase?.version.startsWith("v5")
                            }
                        },
                        {
                            type: "text",
                            text: "Select which transcripts and consequence types are displayed in the variant grid",
                            display: {
                                containerStyle: "margin: 20px 5px 5px 0px"
                            }
                        },
                        {
                            field: "consequenceType.all",
                            type: "checkbox",
                            text: "Include All Transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                            }
                        },
                        {
                            type: "separator",
                            display: {
                                style: "margin: 5px 20px"
                            }
                        },
                        {
                            field: "consequenceType.maneTranscript",
                            type: "checkbox",
                            text: "Include MANE Select and Plus Clinical transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.ensemblCanonicalTranscript",
                            type: "checkbox",
                            text: "Include Ensembl Canonical transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.gencodeBasicTranscript",
                            type: "checkbox",
                            text: "Include GENCODE Basic transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.ccdsTranscript",
                            type: "checkbox",
                            text: "Include CCDS transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.lrgTranscript",
                            type: "checkbox",
                            text: "Include LRG transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.ensemblTslTranscript",
                            type: "checkbox",
                            text: "Include Ensembl TSL:1 transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.illuminaTSO500Transcript",
                            type: "checkbox",
                            text: "Include Illumina TSO500 transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.eglhHaemoncTranscript",
                            type: "checkbox",
                            text: "Include EGLH HaemOnc transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.proteinCodingTranscript",
                            type: "checkbox",
                            text: "Include protein coding transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.highImpactConsequenceTypeTranscript",
                            type: "checkbox",
                            text: "Include transcripts with high impact consequence types",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        }
                    ]
                },
                {
                    title: "Variant Highlight",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                    },
                    elements: [
                        {
                            title: "Configure the highlight to apply to displayed variant rows",
                            field: "activeHighlights",
                            type: "select",
                            multiple: true,
                            allowedValues: this.config?.highlights?.map(highlight => highlight.id) || [],
                            display: {
                                visible: () => (this.config?.highlights || []).length > 0,
                            },
                        },
                        {
                            type: "notification",
                            text: "No highlight conditions defined.",
                            display: {
                                notificationType: "warning",
                                visible: () => (this.config?.highlights || []).length === 0,
                            },
                        },
                    ],
                },
            ]
        };
    }

}

customElements.define("variant-interpreter-grid-config", VariantInterpreterGridConfig);
