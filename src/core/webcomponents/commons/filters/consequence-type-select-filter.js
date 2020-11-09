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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "./select-field-filter.js";

export default class ConsequenceTypeSelectFilter extends LitElement {

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
            ct: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._ct = [];  // this.ct is a comma separated list, this._ct is an array of the same data
        this.isChecked = {};
        this.options = [];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.options = this._config.categories.map( item => (
            item.title
                ?
                    {
                        id: item.title.toUpperCase(),
                        fields:  item.terms.map( term => ({id: term.name, name: `${term.name} (${term.id})`}))
                    }
                :
                    {
                        id: item.id,
                        name: `${item.name} ${item.id}`
                    }
        ));
    }

    updated(changedProperties) {
        if (changedProperties.has("ct")) {
            if (this.ct) {
                this._ct = this.ct.split(",");
                // this.LofEnabled = this._config.lof.every(v => this._ct.indexOf(v) > -1);
                for (let alias of this._config.alias) {
                    this.isChecked[alias.name] = alias.terms.every(v => this._ct.indexOf(v) > -1);
                }
            } else {
                this._ct = [];
                this.isChecked = {};
            }
            this.requestUpdate();
        }
    }

    onFilterChange(e) {
        this.notify(e.detail.value)
    }

    onPresetSelect(preset, e) {
        if (preset && this._config.alias) {
            let aliasSelect = this._config.alias.find(alias => alias.name === preset);

            if (aliasSelect) {
                if (e.currentTarget.checked) {
                    let ctSet = new Set(this._ct);
                    for (let term of aliasSelect.terms) {
                        ctSet.add(term)
                    }
                    this._ct = [...ctSet];
                } else {
                    this._ct = this._ct.filter(selected => !aliasSelect.terms.includes(selected));
                    for (let alias of this._config.alias) {
                        this.isChecked[alias.name] = alias.terms.every(v => this._ct.indexOf(v) > -1);
                    }
                }

                this.notify(this._ct.join(","));
                // this.requestUpdate();
            } else {
                console.error("Consequence type rpeset not found: ", preset)
            }
        }
    }

    notify(cts) {
        let event = new CustomEvent("filterChange", {
            detail: {
                value: cts
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            alias: [
                {
                    name: "LoF",
                    description: "LoF description",
                    terms: ["transcript_ablation", "splice_acceptor_variant", "splice_donor_variant", "stop_gained", "frameshift_variant",
                        "stop_lost", "start_lost", "transcript_amplification", "inframe_insertion", "inframe_deletion"]
                },
                {
                    name: "Nonsynonymous",
                    description: "Missense variant description",
                    terms: ["missense_variant"]
                },
                {
                    name: "Coding Sequence",
                    description: "LoF description",
                    terms: ["missense_variant", "synonymous_variant", "initiator_codon_variant", "terminator_codon_variant"]
                }
            ],

            // DEPRECATED Loss-of-function SO terms
            lof: ["transcript_ablation", "splice_acceptor_variant", "splice_donor_variant", "stop_gained", "frameshift_variant",
                "stop_lost", "start_lost", "transcript_amplification", "inframe_insertion", "inframe_deletion"],

            // 'Title' is optional. if there is not title provided then 'name' will be used.
            //  There are two more optional properties - 'checked' and 'impact'. They can be set to display them default in web application.
            //  Similarly 'description' is optional as well.
            categories: [
                {
                    title: "Intergenic",
                    terms: [
                        {
                            id: "SO:0001631",
                            name: "upstream_gene_variant",
                            description: "A sequence variant located 5' of a gene",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001636",
                            name: "2KB_upstream_variant",
                            description: "A sequence variant located within 2KB 5' of a gene",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001632",
                            name: "downstream_gene_variant",
                            description: "A sequence variant located 3' of a gene",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0002083",
                            name: "2KB_downstream_variant",
                            description: "A sequence variant located within 2KB 3' of a gene",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001628",
                            name: "intergenic_variant",
                            description: "A sequence variant located in the intergenic region, between genes",
                            impact: "modifier"
                        }
                    ]
                },
                {
                    title: "Regulatory",
                    terms: [
                        {
                            id: "SO:0001620",
                            name: "mature_miRNA_variant",
                            description: "A transcript variant located with the sequence of the mature miRNA",
                            impact: "modifier"
                        },
                        // {
                        //     id: "SO:0001894",
                        //     name: "regulatory_region_ablation",
                        //     description: "A feature ablation whereby the deleted region includes a regulatory region",
                        //     impact: "moderate",
                        // },
                        // {
                        //     id: "SO:0001891",
                        //     name: "regulatory_region_amplification",
                        //     description: "A feature amplification of a region containing a regulatory region",
                        //     impact: "modifier",
                        // },
                        {
                            id: "SO:0001566",
                            name: "regulatory_region_variant",
                            description: "A sequence variant located within a regulatory region",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001782",
                            name: "TF_binding_site_variant",
                            description: "A sequence variant located within a transcription factor binding site",
                            impact: "modifier"
                        }
                        // {
                        //     id: "SO:0001895",
                        //     name: "TFBS_ablation",
                        //     description: "A feature ablation whereby the deleted region includes a transcription factor binding site",
                        //     impact: "modifier",
                        // },
                        // {
                        //     id: "SO:0001892",
                        //     name: "TFBS_amplification",
                        //     description: "A feature amplification of a region containing a transcription factor binding site",
                        //     impact: "modifier",
                        // },
                    ]
                },
                {
                    title: "Coding",
                    terms: [
                        {
                            id: "SO:0001580",
                            name: "coding_sequence_variant",
                            description: "A sequence variant that changes the coding sequence",
                            impact: "modifier"
                        },
                        // {
                        //     id: "SO:0001907",
                        //     name: "feature_elongation",
                        //     description: "A sequence variant that causes the extension of a genomic feature, with regard to the reference sequence",
                        //     impact: "modifier",
                        // },
                        {
                            id: "SO:0001906",
                            name: "feature_truncation",
                            description: "A sequence variant that causes the reduction of a genomic feature, with regard to the reference sequence",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001589",
                            name: "frameshift_variant",
                            description: "A sequence variant which causes a disruption of the translational reading frame, because the number of nucleotides inserted or deleted is not a multiple of three",
                            impact: "high"
                        },
                        {
                            id: "SO:0001626",
                            name: "incomplete_terminal_codon_variant",
                            description: "A sequence variant where at least one base of the final codon of an incompletely annotated transcript is changed",
                            impact: "low"
                        },
                        {
                            id: "SO:0001822",
                            name: "inframe_deletion",
                            description: "An inframe non synonymous variant that deletes bases from the coding sequence",
                            impact: "high"
                        },
                        {
                            id: "SO:0001821",
                            name: "inframe_insertion",
                            description: "An inframe non synonymous variant that inserts bases into in the coding sequence",
                            impact: "high"
                        },
                        {
                            id: "SO:0001650",
                            name: "inframe_variant",
                            description: "A sequence variant which does not cause a disruption of the translational reading frame",
                            impact: "low"
                        },
                        {
                            id: "SO:0001582",
                            name: "initiator_codon_variant",
                            description: "A codon variant that changes at least one base of the first codon of a transcript",
                            impact: "moderate"
                        },
                        {
                            id: "SO:0001583",
                            name: "missense_variant",
                            description: "A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved",
                            impact: "moderate"
                        },
                        {
                            id: "SO:0001621",
                            name: "NMD_transcript_variant",
                            description: "A variant in a transcript that is the target of NMD",
                            impact: "modifier"
                        },
                        // {
                        //     id: "SO:0001818",
                        //     name: "protein_altering_variant",
                        //     description: "A sequence_variant which is predicted to change the protein encoded in the coding sequence",
                        //     impact: "moderate",
                        // },
                        {
                            id: "SO:0001819",
                            name: "synonymous_variant",
                            description: "A sequence variant where there is no resulting change to the encoded amino acid",
                            impact: "low"
                        },
                        {
                            id: "SO:0002012",
                            name: "start_lost",
                            description: "A codon variant that changes at least one base of the canonical start codon",
                            impact: "high"
                        },
                        {
                            id: "SO:0001587",
                            name: "stop_gained",
                            description: "A sequence variant whereby at least one base of a codon is changed, resulting in a premature stop codon, leading to a shortened transcript",
                            impact: "high"
                        },
                        {
                            id: "SO:0001578",
                            name: "stop_lost",
                            description: "A sequence variant where at least one base of the terminator codon (stop) is changed, resulting in an elongated transcript",
                            impact: "high"
                        },
                        {
                            id: "SO:0001567",
                            name: "stop_retained_variant",
                            description: "A sequence variant where at least one base in the terminator codon is changed, but the terminator remains",
                            impact: "low"
                        },
                        {
                            id: "SO:0001590",
                            name: "terminator_codon_variant",
                            description: "A sequence variant whereby at least one of the bases in the terminator codon is changed",
                            impact: "low"
                        },
                        {
                            id: "SO:0001893",
                            name: "transcript_ablation",
                            description: "A feature ablation whereby the deleted region includes a transcript feature",
                            impact: "high"
                        },
                        {
                            id: "SO:0001889",
                            name: "transcript_amplification",
                            description: "A feature amplification of a region containing a transcript",
                            impact: "high"
                        }
                    ]
                },
                {
                    title: "Non-coding",
                    terms: [
                        {
                            id: "SO:0001624",
                            name: "3_prime_UTR_variant",
                            description: "A UTR variant of the 3' UTR",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001623",
                            name: "5_prime_UTR_variant",
                            description: "A UTR variant of the 5' UTR",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001627",
                            name: "intron_variant",
                            description: "A transcript variant occurring within an intron",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001792",
                            name: "non_coding_transcript_exon_variant",
                            description: "A sequence variant that changes non-coding exon sequence in a non-coding transcript",
                            impact: "modifier"
                        },
                        {
                            id: "SO:0001619",
                            name: "non_coding_transcript_variant",
                            description: "A transcript variant of a non coding RNA gene",
                            impact: "modifier"
                        }
                    ]
                },
                {
                    title: "Splice",
                    terms: [
                        {
                            id: "SO:0001574",
                            name: "splice_acceptor_variant",
                            description: "A splice variant that changes the 2 base region at the 3' end of an intron",
                            impact: "high"
                        },
                        {
                            id: "SO:0001575",
                            name: "splice_donor_variant",
                            description: "A splice variant that changes the 2 base pair region at the 5' end of an intron",
                            impact: "high"
                        },
                        {
                            id: "SO:0001630",
                            name: "splice_region_variant",
                            description: "A sequence variant in which a change has occurred within the region of the splice site, either " +
                                "within 1-3 bases of the exon or 3-8 bases of the intron",
                            impact: "low"
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <!-- Render the different aliases configured -->
            <div class="form-group">
                ${this._config.alias && this._config.alias.length > 0 
                    ? html`
                        <div style="margin: 5px 0px">
                            <span>Select a preset configuration:</span>
                        </div>
                        ${this._config.alias.map(alias => html`
                            <div style="margin: 5px 0px">
                                <input type="checkbox" id="${this._prefix}${alias.name}" name="layout" value="${alias.name}" .checked="${this.isChecked[alias.name]}"
                                    @click="${e => this.onPresetSelect(alias.name, e)}">
                                <label class="text" for="${this._prefix}${alias.name}" style="font-weight: normal">
                                    <span style="margin: 0px 5px">${alias.name}</span> (<span title="${alias.terms.join(", ")}" style="color: #286090"> ${alias.terms?.length} terms </span>)
                                </label>                            
                            </div>
                        `)}
                    ` 
                    : null
                }    
            </div>

            <div class="form-group">
                <div style="margin: 5px 0px">
                    <span>Custom consequence types selection:</span>
                </div>
                <select-field-filter multiple liveSearch=${"true"} .data="${this.options}" .value=${this._ct} 
                    @filterChange="${this.onFilterChange}">
                </select-field-filter>            
            </div>
            
            <div class="form-group">
                <!-- TODO magic-checkbox doesnt work in variant-interpreter-browser-rd (but it works in Variant browser). CSS debug
                    <input class="" type="checkbox" name="layout" id="lof" value="lof" @click="${this.toggleLof}" .checked="${this.LofEnabled}" >
                    <label class="text" for="lof">
                        Loss of Functions
                    </label>
                -->
            </div>
        `;
    }
}

customElements.define("consequence-type-select-filter", ConsequenceTypeSelectFilter);
