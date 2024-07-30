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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-field-filter.js";

export default class AcmgFilter extends LitElement {

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
            acmg: {
                type: Array,
            },
            multiple: {
                type: Boolean,
            },
        };
    }

    _init() {
        this.config = this.getDefaultConfig();
    }

    filterChange(e) {
        const value = (e.detail.value || "").split(",").filter(v => !!v);
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    render() {
        return html`
            <select-field-filter
                .data="${this.config.data}"
                .value=${this.acmg || []}
                .config="${{
                    multiple: this.multiple ?? this.config.multiple,
                    liveSearch: this.config.liveSearch
                }}"
                @filterChange="${this.filterChange}">
            </select-field-filter>
        `;
    }

    getDefaultConfig() {
        return {
            multiple: true,
            liveSearch: false,
            data: [
                {
                    id: "PVS - Very strong evidence of pathogenicity",
                    name: "Very strong evidence of pathogenicity",
                    fields: [
                        {
                            id: "PVS1",
                            description: "Null variant (nonsense, frameshift, canonical +/−1 or 2 splice sites, initiation codon, " +
                                "or multi-exon deletion) in a gene where loss of function (LOF) is a known mechanism of disease"
                        }
                    ]
                },
                {
                    id: "PS - Strong evidence of pathogenicity",
                    name: "Strong evidence of pathogenicity",
                    fields: [
                        {
                            id: "PS1",
                            description: "Same amino acid change as a previously established pathogenic variant regardless of nucleotide change"
                        },
                        {
                            id: "PS2",
                            description: "De novo (both maternity and paternity confirmed) in a patient with the disease and no family history"
                        },
                        {
                            id: "PS3",
                            description: "Well-established in vitro or in vivo functional studies supportive of a damaging effect on the gene or gene product"
                        },
                        {
                            id: "PS4",
                            description: "The prevalence of the variant in affected individuals is significantly increased compared with the prevalence in controls"
                        }
                    ]
                },
                {
                    id: "PM - Moderate evidence of pathogenecity",
                    name: "Moderate evidence of pathogenecity",
                    fields: [
                        {
                            id: "PM1",
                            description: "Located in a mutational hot spot and/or critical and well-established functional domain (e.g., active site of an enzyme) without benign variation"
                        },
                        {
                            id: "PM2",
                            description: "Absent from controls (or at extremely low frequency if recessive) in Exome Sequencing Project, 1000 Genomes Project, or Exome Aggregation Consortium"
                        },
                        {
                            id: "PM3",
                            description: "For recessive disorders, detected in trans with a pathogenic variant Note: This requires testing of parents (or offspring) to determine phase."
                        },
                        {
                            id: "PM4",
                            description: "Protein length changes as a result of in-frame deletions/insertions in a nonrepeat region or stop-loss variants"
                        },
                        {
                            id: "PM5",
                            description: "Novel missense change at an amino acid residue where a different missense change determined to be pathogenic has been seen before"
                        },
                        {
                            id: "PM6",
                            description: "Assumed de novo, but without confirmation of paternity and maternity"
                        }
                    ]
                },
                {
                    id: "PP - Supporting evidence of pathogenicity",
                    name: "Supporting evidence of pathogenicity",
                    fields: [
                        {
                            id: "PP1",
                            description: "Cosegregation with disease in multiple affected family members in a gene definitively known to cause the disease"
                        },
                        {
                            id: "PP2",
                            description: "Missense variant in a gene that has a low rate of benign missense variation and in which missense variants are a common mechanism of disease"
                        },
                        {
                            id: "PP3",
                            description: "Multiple lines of computational evidence support a deleterious effect on the gene or gene product (conservation, evolutionary, splicing impact, etc.)"
                        },
                        {
                            id: "PP4",
                            description: "Patient’s phenotype or family history is highly specific for a disease with a single genetic etiology"
                        },
                        {
                            id: "PP5",
                            description: "Reputable source recently reports variant as pathogenic, but the evidence is not available to the laboratory to perform an independent evaluation"
                        }
                    ]
                },
                {
                    id: "BA - Stand-alone evidence for benign variants",
                    name: "Stand-alone evidence for benign variants",
                    fields: [
                        {
                            id: "BA1",
                            description: "Allele frequency is >5% in Exome Sequencing Project, 1000 Genomes Project, or Exome Aggregation Consortium"
                        }
                    ]
                },
                {
                    id: "BS - Strong evidence for benign variants",
                    name: "Strong evidence for benign variants",
                    fields: [
                        {
                            id: "BS1",
                            description: "Allele frequency is greater than expected for disorder"
                        },
                        {
                            id: "BS2",
                            description: "Observed in a healthy adult individual for a recessive (homozygous), dominant (heterozygous), or X-linked (hemizygous) disorder, with full penetrance expected at an early age"
                        },
                        {
                            id: "BS3",
                            description: "Well-established in vitro or in vivo functional studies show no damaging effect on protein function or splicing"
                        },
                        {
                            id: "BS4",
                            description: "Lack of segregation in affected members of a family"
                        }
                    ]
                },
                {
                    id: "BP - Supporting evidence for benign variants",
                    name: "Supporting evidence for benign variants",
                    fields: [
                        {
                            id: "BP1",
                            description: "Missense variant in a gene for which primarily truncating variants are known to cause disease"
                        },
                        {
                            id: "BP2",
                            description: "Observed in trans with a pathogenic variant for a fully penetrant dominant gene/disorder or observed in cis with a pathogenic variant in any inheritance pattern"
                        },
                        {
                            id: "BP3",
                            description: "In-frame deletions/insertions in a repetitive region without a known function"
                        },
                        {
                            id: "BP4",
                            description: "Multiple lines of computational evidence suggest no impact on gene or gene product (conservation, evolutionary, splicing impact, etc.)"
                        },
                        {
                            id: "BP5",
                            description: "Variant found in a case with an alternate molecular basis for disease"
                        },
                        {
                            id: "BP6",
                            description: "Reputable source recently reports variant as benign, but the evidence is not available to the laboratory to perform an independent evaluation"
                        },
                        {
                            id: "BP7",
                            description: "A synonymous (silent) variant for which splicing prediction algorithms predict no impact " +
                                "to the splice consensus sequence nor the creation of a new splice site AND the nucleotide is not highly conserved"
                        }
                    ]
                }
            ],
        };
    }

}

customElements.define("acmg-filter", AcmgFilter);
