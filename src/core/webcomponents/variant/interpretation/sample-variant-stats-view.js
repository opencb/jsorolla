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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../simple-plot.js";

class SampleVariantStatsView extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            sampleId: {
                type: Object
            },
            sampleVariantStats: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
        //this.types = ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

    }

    firstUpdated(_changedProperties) {

        this.sample = {"id":"ISDBM322015","variantCount":172618,"chromosomeCount":{"1":15814,"2":12636,"3":9349,"4":8176,"5":8052,"6":9712,"7":8812,"8":6821,"9":7318,"10":8451,"11":9511,"12":8233,"13":4339,"14":5891,"15":5804,"16":6749,"17":8074,"18":3711,"19":8629,"20":4502,"21":2657,"22":4095,"X":2377,"Y":437,"MT":26},"typeCount":{"INSERTION":1,"SNV":165398,"DELETION":1,"INDEL":7218},"genotypeCount":{"0/1":56550,"1/1":115739,"1/2":324,"1/3":5},"indelLengthCount":{"lt5":7114,"lt10":63,"lt15":17,"lt20":15,"gte20":11},"filterCount":{"PASS":153588},"tiTvRatio":2.184589,"qualityAvg":805.0968,"qualityStdDev":1507.8727,"heterozygosityRate":0.32950792,"mendelianErrorCount":{"1":649},"consequenceTypeCount":{"intergenic_variant":28802,"frameshift_variant":175,"3_prime_UTR_variant":7978,"2KB_downstream_variant":30855,"splice_acceptor_variant":95,"intron_variant":105346,"splice_region_variant":2905,"upstream_gene_variant":28712,"5_prime_UTR_variant":3311,"non_coding_transcript_exon_variant":27805,"stop_gained":114,"non_coding_transcript_variant":57030,"2KB_upstream_variant":27239,"start_lost":30,"splice_donor_variant":84,"NMD_transcript_variant":31871,"synonymous_variant":11338,"missense_variant":10527,"mature_miRNA_variant":6,"feature_truncation":1,"stop_lost":45,"regulatory_region_variant":142317,"downstream_gene_variant":32859,"stop_retained_variant":26,"TF_binding_site_variant":20588,"coding_sequence_variant":11,"inframe_deletion":87,"inframe_insertion":64,"incomplete_terminal_codon_variant":6},"biotypeCount":{"IG_V_pseudogene":471,"TR_J_pseudogene":8,"nonsense_mediated_decay":38790,"snRNA":1289,"IG_V_gene":536,"unitary_pseudogene":294,"TR_V_gene":261,"non_stop_decay":252,"processed_pseudogene":13581,"sense_overlapping":554,"lincRNA":10046,"misc_RNA":1455,"miRNA":3205,"IG_C_pseudogene":51,"IG_J_pseudogene":7,"protein_coding":117967,"rRNA":431,"TR_V_pseudogene":52,"IG_D_gene":72,"Mt_rRNA":10,"retained_intron":43383,"3prime_overlapping_ncrna":66,"Mt_tRNA":26,"snoRNA":1301,"transcribed_processed_pseudogene":785,"pseudogene":577,"transcribed_unprocessed_pseudogene":2866,"IG_J_gene":29,"IG_C_gene":137,"sense_intronic":795,"TR_C_gene":49,"unprocessed_pseudogene":5287,"translated_processed_pseudogene":1,"TR_J_gene":77,"processed_transcript":51934,"antisense":13692,"polymorphic_pseudogene":437}}

        // order by the custom order defined in the constant "types"
        this.sample.typeCount = Object.assign({}, ...Object.entries(this.sample.typeCount).sort( (a, b) => types.indexOf(a[0]) - types.indexOf(b[0])).map( ([k, v]) => ({[k]: v})))

    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("sampleVariantStats")) {
            this.sampleVariantStatsObserver();
        }
    }

    sampleIdObserver() {
        console.log("sampleIdObserver")
        // TODO ISDBM322015 is hardcoded as is the only one available yet
        if(1 || this.sampleId) {
            this.opencgaSession.opencgaClient.variants().infoSampleStats("ISDBM322015", {study: this.opencgaSession.study.fqn})
                .then( response => {
                    console.log("response SAMPLE", response)
                    this.sample = response.getResult(0);
                }).catch( response => {
                    console.error(response)
                    this.sample = null;
                }).finally( () => this.requestUpdate());
        }

    }

    sampleVariantStatsObserver() {
        console.log("sampleVariantStatsObserver");
    }

    getDefaultConfig() {
        return {
            //plotPerRow: 2
        }
    }

    render() {
        return html`
            <style>
                .plot-wrapper {
                    margin: 25px 0
                }
            </style>
            <div>
                <h3>Sample Variant Stats</h3>
                <!-- <span>We must use the new component opencga-sample-variant-stats for 
                <a href="https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantMetadata.avdl#L122" target="_blank">https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantMetadata.avdl#L122</a></span> -->
                ${this.sample ? html`
                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-horizontal">
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Id</label>
                                    <span class="col-md-9">${this.sample.id}</span>
                                </div>
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Number of variants</label>
                                    <span class="col-md-9">${this.sample.variantCount}</span>
                                </div>
                                <div class="form-group">
                                    <label class="col-md-3 label-title">TiTvRatio</label>
                                    <span class="col-md-9">${this.sample.tiTvRatio}</span>
                                </div>
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Quality Avg (Quality Standard dev.)</label>
                                    <span class="col-md-9">${this.sample.qualityAvg} (${this.sample.qualityStdDev})</span>
                                </div>
                                
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Heterozygosity Rate</label>
                                    <span class="col-md-9">${this.sample.heterozygosityRate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        ${!$.isEmptyObject(this.sample.chromosomeCount) ? html`
                            <div class="col-md-6">
                                <div class="shadow plot-wrapper">
                                    <simple-plot .active="${true}" type="column" title="Chromosomes" .data="${this.sample.chromosomeCount}"></simple-plot>
                                </div>  
                            </div>
                        ` : null}
                        ${!$.isEmptyObject(this.sample.chromosomeCount) && !$.isEmptyObject(this.sample.chromosomeCount) ? html`
                            <div class="col-md-6">
                                <div class="shadow plot-wrapper">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <simple-plot .active="${true}" type="pie" title="Genotypes" .data="${this.sample.genotypeCount}"></simple-plot>
                                        </div>
                                        <div class="col-md-6">
                                            <simple-plot .active="${true}" type="pie" title="Filters" .data="${this.sample.filterCount}"></simple-plot>
                                        </div>  
                                    </div>
                                </div>
                            </div>
                        ` : null}
                        ${!$.isEmptyObject(this.sample.typeCount) ? html`
                            <div class="col-md-6">
                                <div class="shadow plot-wrapper">
                                    <simple-plot .active="${true}" type="column" title="Type" .data="${this.sample.typeCount}"></simple-plot>
                                </div>  
                            </div>
                        ` : null}
                        ${!$.isEmptyObject(this.sample.indelLengthCount) ? html`
                            <div class="col-md-6">
                                <div class="shadow plot-wrapper">
                                    <simple-plot .active="${true}" type="column" title="INDEL Length" .data="${this.sample.indelLengthCount}"></simple-plot>
                                </div>  
                            </div>
                        ` : null}
                        ${!$.isEmptyObject(this.sample.consequenceTypeCount) ? html`
                            <div class="col-md-12">
                                <div class="shadow plot-wrapper">
                                    <simple-plot .active="${true}" type="column" title="Consequence type" .data="${this.sample.consequenceTypeCount}"></simple-plot>
                                </div>  
                            </div>
                        ` : null}
                        ${!$.isEmptyObject(this.sample.biotypeCount) ? html`
                            <div class="col-md-12">
                                <div class="shadow plot-wrapper">
                                    <simple-plot .active="${true}" type="column" title="Biotype" .data="${this.sample.biotypeCount}"></simple-plot>
                                </div>  
                            </div>
                        ` : null}
                    </div>
                    
                    <!-- TODO check this.sample.cancer -->
                    
                ` : html`No Stats available.`}
            </div>
        `;

    }

}

customElements.define("sample-variant-stats-view", SampleVariantStatsView);
