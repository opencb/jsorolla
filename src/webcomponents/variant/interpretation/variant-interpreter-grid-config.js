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
            case "consequenceType.maneTranscript":
            case "consequenceType.ensemblCanonicalTranscript":
            case "consequenceType.refseqTranscript":
            case "consequenceType.gencodeBasicTranscript":
            case "consequenceType.ccdsTranscript":
            case "consequenceType.lrgTranscript":
            case "consequenceType.ensemblTslTranscript":
            case "consequenceType.illuminaTSO500Transcript":
            case "consequenceType.eglhHaemoncTranscript":
            case "consequenceType.proteinCodingTranscript":
            case "consequenceType.highImpactConsequenceTypeTranscript":
            case "consequenceType.showNegativeConsequenceTypes":
                const field = e.detail.param.split(".")[1];
                this.config.consequenceType[field] = e.detail.value;
                break;
            case "genotype.type":
                this.config.genotype.type = e.detail.value;
                break;
        }

        this.dispatchEvent(new CustomEvent("configChange", {
            detail: {
                value: this.config
            },
            bubbles: true,
            composed: true
        }));
    }

    getConfigForm() {
        return {
            id: "interpreter-grid-config",
            title: "",
            icon: "fas fa-user-md",
            type: "form",
            display: {
                width: "10",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "4",
                defaultLayout: "vertical"
            },
            sections: [
                {
                    id: "ct",
                    title: "Transcript Filter",
                    text: "Select which transcripts and consequence types are displayed in the variant grid",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        textClass: "help-block",
                        textStyle: "margin: 0px 10px"
                    },
                    elements: [
                        {
                            field: "consequenceType.maneTranscript",
                            type: "checkbox",
                            text: "Include MANE Select and Plus Clinical transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.ensemblCanonicalTranscript",
                            type: "checkbox",
                            text: "Include Ensembl Canonical transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.refseqTranscript",
                            type: "checkbox",
                            text: "Include RefSeq transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.gencodeBasicTranscript",
                            type: "checkbox",
                            text: "Include GENCODE Basic transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.ccdsTranscript",
                            type: "checkbox",
                            text: "Include CCDS transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.lrgTranscript",
                            type: "checkbox",
                            text: "Include LRG transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.ensemblTslTranscript",
                            type: "checkbox",
                            text: "Include Ensembl TSL:1 transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.illuminaTSO500Transcript",
                            type: "checkbox",
                            text: "Include Illumina TSO500 transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.eglhHaemoncTranscript",
                            type: "checkbox",
                            text: "Include EGLH HaemOnc transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.proteinCodingTranscript",
                            type: "checkbox",
                            text: "Include protein coding transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.highImpactConsequenceTypeTranscript",
                            type: "checkbox",
                            text: "Include transcripts with high impact consequence types",
                            display: {
                            }
                        }
                    ]
                },
                {
                    id: "gt",
                    title: "Sample Genotype",
                    text: "Select how genotypes are displayed",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 25px 5px 5px 5px",
                        textClass: "help-block",
                        textStyle: "margin: 0px 10px"
                    },
                    elements: [
                        {
                            name: "Select Render Mode",
                            field: "genotype.type",
                            type: "select",
                            allowedValues: ["ALLELES", "VCF_CALL", "ZYGOSITY", "VAF", "ALLELE_FREQUENCY", "CIRCLE"],
                            display: {
                                width: "6"
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form  .data="${this.config}"
                        .config="${this.getConfigForm()}"
                        @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

}

customElements.define("variant-interpreter-grid-config", VariantInterpreterGridConfig);
