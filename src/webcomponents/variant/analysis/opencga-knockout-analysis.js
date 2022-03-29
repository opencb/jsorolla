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

import {html} from "lit";
import AnalysisConfig from "./analysis-config.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

// this class will be in config folder
/**
 * @deprecated
 */
class OpencgaKnockoutAnalysisConfig {

    static get() {
        return {
            id: "knockout",
            title: "Knockout Analysis",
            icon: "",
            requires: "2.0.0",
            description: "Returns individuals with bialleic variants in a given gene, in either homozygous or compound heterozygous conformation. These patterns of variation often increase the risk of recessive disorders.”",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Sample+Stats",
                    icon: ""
                }
            ],
            form: {
                sections: [
                    {
                        title: "Select Gene",
                        collapsed: false,
                        parameters: [
                            /* {
                                id: "sample",
                                title: "Select samples",
                                type: "SAMPLE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },*/
                            {
                                id: "gene",
                                title: "Select gene",
                                type: "GENE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            }
                            /* {
                                id: "panel",
                                title: "Select disease panel",
                                type: "DISEASE_PANEL_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            }*/
                        ]
                    },
                    {
                        title: "Variant Filters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "cohortStatsAlt",
                                title: "Alternate Allele Frequency",
                                type: "COHORT_FREQUENCY_FILTER"
                            },
                            {
                                id: "populationFrequencyAlt",
                                title: "",
                                type: "POPULATION_FREQUENCY_FILTER"
                            },
                            {
                                id: "type",
                                title: "Variant types",
                                type: "VARIANT_TYPE_FILTER",
                                types: ["SNV", "INDEL", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                                // layout: "horizontal"
                            },
                            {
                                id: "consequenceType",
                                title: "Consequence type",
                                type: "CONSEQUENCE_TYPE_FILTER",
                                tooltip: tooltips.consequenceTypeSelect,
                                value: CONSEQUENCE_TYPES.lof
                            },
                            {
                                id: "clinicalSignificance",
                                title: "Clinical Significance",
                                type: "CLINVAR_ACCESSION_FILTER"
                            }
                        ]
                    },
                    {
                        title: "Sample filters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "FAMILY_MEMBER_SELECTOR",
                                title: "Include families with",
                                type: "checkbox",
                                defaultValue: "1,2",
                                allowedValues:
                                    [{id: 0, name: "No parents"}, {id: 1, name: "One Parents"}, {id: 2, name: "Two Parents"}]

                            },
                            {
                                id: "PROBAND_ONLY",
                                title: "Affected individuals (proband) only",
                                type: "boolean",
                                defaultValue: "no",
                                tooltip: "other info here"
                                // allowedValues: ["father", "mother"]
                            }
                        ]
                    }
                    /* {
                        title: "Configuration Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "biotype",
                                title: "Select biotype",
                                type: "category",
                                defaultValue: "protein_coding",
                                allowedValues: ["3prime_overlapping_ncrna", "IG_C_gene", "IG_C_pseudogene", "IG_D_gene", "IG_J_gene",
                                    "IG_J_pseudogene", "IG_V_gene", "IG_V_pseudogene", "Mt_rRNA", "Mt_tRNA", "TR_C_gene", "TR_D_gene",
                                    "TR_J_gene", "TR_J_pseudogene", "TR_V_gene", "TR_V_pseudogene", "antisense", "lincRNA", "miRNA",
                                    "misc_RNA", "non_stop_decay", "nonsense_mediated_decay", "polymorphic_pseudogene", "processed_pseudogene",
                                    "processed_transcript", "protein_coding", "pseudogene", "rRNA", "retained_intron", "sense_intronic",
                                    "sense_overlapping", "snRNA", "snoRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene",
                                    "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"
                                ]
                            },
                            {
                                id: "filter",
                                title: "Select filter",
                                type: "text"
                            }
                            // {
                            //     id: "qual",
                            //     title: "Select quality",
                            //     type: "number"
                            // }
                        ]
                    }*/
                ],
                job: {
                    title: "Job Info",
                    id: "knockout-$DATE",
                    tags: "",
                    visible: false,
                    description: "",
                    button: "Run",
                    validate: function (params) {
                        alert("test:" + params);
                    }
                }
            }
        };
    }

}


export default class OpencgaKnockoutAnalysis { // extends LitElement

    constructor(config) {
        this._config = {...AnalysisConfig.opencgaKnockout(), ...config};
    }

    get config() {
        return this._config;
    }

    check() {

    }

    execute(e, opencgaSession) {
        const {data, params} = e.detail;
        const body = {};
        // data.sample ? body.sample = data.sample.join(",") : null;
        data.sample ? body.sample = data.sample : null;
        data.gene ? body.gene = data.gene.join(",") : null;
        data.biotype ? body.biotype = data.biotype.join(",") : null;
        data.consequenceType ? body.consequenceType = data.consequenceType.join(",") : null;
        data.filter ? body.filter = data.filter.join(",") : null;
        opencgaSession.opencgaClient.variants().runKnockout(body, params)
            .then(response => {
                // ??
            })
            .catch(e => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            });
    }

    form(opencgaSession, cellbaseClient) {
        return html`
            <opencga-analysis-tool
                .opencgaSession="${opencgaSession}"
                .cellbaseClient="${cellbaseClient}"
                .config="${this.config}"
                @execute="${e => this.execute(e, opencgaSession)}">
            </opencga-analysis-tool>
        `;
    }

    result(job, opencgaSession, cellbaseClient) {
        // this.check(job);
        return html`
            <opencga-knockout-analysis-result
                .jobId=${job?.id}
                .opencgaSession="${opencgaSession}"
                .cellbaseClient="${cellbaseClient}">
            </opencga-knockout-analysis-result>`;
    }

    // render() {
    //     if () {
    //         return this.form();
    //     } else {
    //         return this.result();
    //     }
    // }

}
