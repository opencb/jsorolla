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

/**
 * Created by imedina on 05/06/17.
 */

const cohortFileMenu = {
    id: "cohort",
    title: "Cohort Alternate Allele Stats",
    cohorts: { // organised in projects and studies
        reference_grch37: {
            "1kG_phase3": [
                {id: "ALL", name: "All"}, {id: "MXL", name: "Mexican"}
            ],
            "EXAC": [
                {id: "ALL", name: "All"}
            ]
        },
        GRCH37: {
            platinum: [
                {id: "ALL", name: "ALL"}
            ]
        },
        exomes_grch37: {
            corpasome: [
                {id: "ALL", name: "ALL"}
            ]
        }
    },
    tooltip: "Filter variants by cohort Alternate allele frequency"
};

/* MOVED in variant-browser config (TODO copy in interpretation portal) */
const filterMenu = {
    searchButtonText: "Search",
    tooltip: {
        classes: "qtip-rounded qtip-shadow qtip-custom-class"
        // classes: "qtip-dark qtip-rounded qtip-shadow"
    },
    skipSubsections: [], // controls which subsections are disabled and should not be displayed
    sections: [ // sections and subsections, structure and order is respected
        {
            title: "Study and Cohorts",
            collapsed: false,
            fields: [
                {
                    id: "study",
                    title: "Studies Filter",
                    tooltip: "Only considers variants from the selected studies"
                },
                cohortFileMenu
            ]
        },
        {
            title: "Genomic",
            collapsed: true,
            fields: [
                {
                    id: "region",
                    title: "Chromosomal Location",
                    tooltip: "Filter out variants falling outside the genomic interval(s) defined"
                },
                {
                    id: "feature",
                    title: "Feature IDs (gene, SNPs, ...)",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                },
                {
                    id: "diseasePanels",
                    title: "Disease Panels",
                    tooltip: "Filter out variants falling outside the genomic intervals (typically genes) defined by the panel(s) chosen"
                },
                {
                    id: "biotype",
                    title: "Gene Biotype",
                    biotypes: [
                        "3prime_overlapping_ncrna", "IG_C_gene", "IG_C_pseudogene", "IG_D_gene", "IG_J_gene", "IG_J_pseudogene",
                        "IG_V_gene", "IG_V_pseudogene", "Mt_rRNA", "Mt_tRNA", "TR_C_gene", "TR_D_gene", "TR_J_gene", "TR_J_pseudogene",
                        "TR_V_gene", "TR_V_pseudogene", "antisense", "lincRNA", "miRNA", "misc_RNA", "non_stop_decay",
                        "nonsense_mediated_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript",
                        "protein_coding", "pseudogene", "rRNA", "retained_intron", "sense_intronic", "sense_overlapping", "snRNA",
                        "snoRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene",
                        "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"
                    ],
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                },
                {
                    id: "type",
                    title: "Variant Type",
                    types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"],
                    tooltip: "Only considers variants of the selected type"
                }
            ]
        },
        {
            title: "Population Frequency",
            collapsed: true,
            fields: [
                {
                    id: "populationFrequency",
                    title: "Select Population Frequency",
                    tooltip: populationFrequencies.tooltip,
                    showSetAll: true
                }
            ]
        },
        {
            title: "Consequence Type",
            collapsed: true,
            fields: [
                {
                    id: "consequenceType",
                    title: "Select SO terms",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                }
            ]
        },
        {
            title: "Deleteriousness",
            collapsed: true,
            fields: [
                {
                    id: "proteinSubstitutionScore",
                    title: "Protein Substitution Score",
                    tooltip: "<strong>SIFT score:</strong> Choose either a Tolerated/Deleterious qualitative score or provide below a " +
                        "quantitative impact value. SIFT scores <0.05 are considered deleterious. " +
                        "<strong>Polyphen:</strong> Choose, either a Benign/probably damaging qualitative score or provide below a " +
                        "quantitative impact value. Polyphen scores can be Benign (<0.15), Possibly damaging (0.15-0.85) or Damaging (>0.85)"
                },
                {
                    id: "cadd",
                    title: "CADD",
                    tooltip: "Raw values have relative meaning, with higher values indicating that a variant is more likely to be " +
                        "simulated (or not observed) and therefore more likely to have deleterious effects. If discovering causal variants " +
                        "within an individual, or small groups, of exomes or genomes te use of the scaled CADD score is recommended"
                }
            ]
        },
        {
            title: "Conservation",
            collapsed: true,
            fields: [
                {
                    id: "conservation",
                    title: "Conservation Score",
                    tooltip: "<strong>PhyloP</strong> scores measure evolutionary conservation at individual alignment sites. The scores " +
                        "are interpreted as follows compared to the evolution expected under neutral drift: positive scores (max 3.0) mean " +
                        "conserved positions and negative scores (min -14.0) indicate positive selection. PhyloP scores are useful to " +
                        "evaluate signatures of selection at particular nucleotides or classes of nucleotides (e.g., third codon positions, " +
                        "or first positions of miRNA target sites).<br>" +
                        "<strong>PhastCons</strong> estimates the probability that each nucleotide belongs to a conserved element, based on " +
                        "the multiple alignment. The phastCons scores represent probabilities of negative selection and range between 0 " +
                        "(non-conserved) and 1 (highly conserved).<br>" +
                        "<strong>Genomic Evolutionary Rate Profiling (GERP)</strong> score estimate the level of conservation of positions." +
                        " Scores ≥ 2 indicate evolutionary constraint to and ≥ 3 indicate purifying selection."
                }
            ]
        },
        {
            title: "Gene Ontology",
            collapsed: true,
            fields: [
                {
                    id: "go",
                    title: "GO Accessions (max. 100 terms)",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                }
            ]
        },
        {
            title: "Phenotype-Disease",
            collapsed: true,
            fields: [
                {
                    id: "hpo",
                    title: "HPO Accessions",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                },
                {
                    id: "clinvar",
                    title: "ClinVar Accessions",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                },
                {
                    id: "fullTextSearch",
                    title: "Full-text search on HPO, ClinVar, protein domains or keywords. Some OMIM and Orphanet IDs are also supported",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                }
            ]
        }
    ]
};


// Clone menu for interpretation and add clinical section
/*const clinical = {
    title: "Sample and File",
    collapsed: false,
    fields: [
        {
            id: "sample",
            title: "Sample Genotype",
            showApproximateCount: true,
            showSelectSamples: true,
            inheritanceModes: [
                {key: "none", text: "Select..."},
                {key: "autoDominant", text: "Autosomal Dominant"},
                {key: "autoRecessive", text: "Autosomal Recessive"},
                {key: "xLinked", text: "X linked"},
                {key: "yLinked", text: "Y linked"}
            ],
            tooltip: "Filter by sample genotype and mode of inheritance"
        },
        {
            id: "file-qual",
            title: "File QUAL Attribute",
            tooltip: "Filter by file attribute QUAL"
        },
        {
            id: "file-pass",
            title: "File PASS Attribute",
            tooltip: "Filter by file attribute PASS"
        }
    ]
};

const interpreterMenu = JSON.parse(JSON.stringify(filterMenu));
const interpreterSections = interpreterMenu.sections.slice(1); // remove first section "Study and Cohorts"
interpreterSections.unshift(clinical); // insert "Clinical" section
// interpreterSections[1].subsections.splice(2,1);                 // remove "Disease Panels" subsection from "Genomic" section
interpreterMenu.sections = interpreterSections;*/


const tools = {
    /*browser: {
        title: "Variant Browser",
        active: false,
        showSummary: true,
        showGenomeBrowser: false,
        filter: {
            menu: filterMenu,
            examples: [
                {
                    name: "Example BRCA2",
                    active: false,
                    query: {
                        gene: "BRCA2",
                        conservation: "phylop<0.001"
                    }
                },
                {
                    name: "Example OR11",
                    query: {
                        gene: "OR11H1",
                        conservation: "phylop<=0.001"
                    }
                },
                {
                    name: "Full Example",
                    query: {
                        "studies": "exomes_grch37:corpasome;opencga@exomes_grch37:ceph_trio",
                        "region": "3:444-555",
                        "xref": "BRCA1,DDEF",
                        "panel": "Albinism_or_congenital_nystagmus-PanelAppId-511,Amyloidosis-PanelAppId-502",
                        "biotype": "IG_C_gene,IG_C_pseudogene",
                        "type": "INDEL",
                        "ct": "frameshift_variant,incomplete_terminal_codon_variant,inframe_deletion,inframe_insertion,3_prime_UTR_variant,5_prime_UTR_variant,intron_variant,non_coding_transcript_exon_variant,non_coding_transcript_variant",
                        "populationFrequencyAlt": "1kG_phase3:ALL<1;1kG_phase3:AFR<1;1kG_phase3:AMR<1;1kG_phase3:EAS<1;1kG_phase3:EUR<1;1kG_phase3:SAS<1;GNOMAD_GENOMES:ALL<1;GNOMAD_GENOMES:AFR<1;GNOMAD_GENOMES:AMR<1;GNOMAD_GENOMES:EAS<1;GNOMAD_GENOMES:FIN<1;GNOMAD_GENOMES:NFE<1;GNOMAD_GENOMES:SAS<1",
                        "protein_substitution": "sift>5,polyphen>4",
                        "annot-functional-score": "cadd_raw>2,cadd_scaled<4",
                        "conservation": "phylop>1;phastCons>2;gerp<=3"
                    }
                }
            ]
        },
        grid: {
            showSelectCheckbox: false,
            nucleotideGenotype: false,
            includeMissing: true,
            queryParams: {
                useSearchIndex: "auto",
                approximateCount: true,
                approximateCountSamplingSize: 5000,
                skipCount: false,
                timeout: 30000
            }
        },
        detail: [
            {
                id: "annotation",
                // component: "cellbase-variantannotation-view",
                title: "Advanced Annotation",
                active: true
            },
            {
                id: "cohortStats",
                // component: "opencga-variant-cohort-stats",
                title: "Cohort Stats"
            },
            {
                id: "sample",
                // component: "opencga-variant-sample",
                title: "Samples"
            },
            {
                id: "beacon",
                // component: "variant-beacon-network",
                title: "Beacon"
                // Uncomment and edit Beacon hosts to change default hosts
                // hosts: [
                //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                //     "lovd", "hgmd", "icgc", "sahgp"
                // ]
            },
            {
                id: "network",
                // component: "reactome-variant-network",
                title: "Reactome Pathways"
            }
            // {
            //     id: "template",
            //     component: "opencga-variant-detail-template",
            //     title: "Template"
            // }
        ]
    },*/
    /*"rd-interpreter": {
        title: "Variant RD Interpreter",
        disableSaveInterpretation: false,
        active: false,
        showOtherTools: true,
        filter: {
            ...interpreterMenu,
            lof: ["transcript_ablation", "splice_acceptor_variant", "splice_donor_variant", "stop_gained", "frameshift_variant",
                "stop_lost", "start_lost", "transcript_amplification", "inframe_insertion", "inframe_deletion"],
            examples: [
                {
                    name: "Default (protein and missense)",
                    active: false,
                    query: {
                        // region: "22",
                        biotype: "protein_coding",
                        // alternate_frequency: "1kG_phase3:ALL<0.001;GNOMAD_GENOMES:ALL<0.001",
                        ct: "transcript_ablation,splice_acceptor_variant,splice_donor_variant,stop_gained," +
                            "frameshift_variant,stop_lost,start_lost,transcript_amplification,inframe_insertion,inframe_deletion," +
                            "missense_variant"
                    }
                },
                {
                    name: "Tiering (AR)",
                    active: false,
                    query: {
                        biotype: "protein_coding,IG_C_gene,IG_D_gene,IG_J_gene,IG_V_gene,IG_V_gene,nonsense_mediated_decay," +
                            "non_stop_decay,TR_C_gene,TR_D_gene,TR_J_gene,TR_V_gene",
                        alternate_frequency: "1kG_phase3:AFR<0.01;1kG_phase3:AMR<0.01;1kG_phase3:EAS<0.01;1kG_phase3:EUR<0.01;" +
                            "1kG_phase3:SAS<0.01;GNOMAD_EXOMES:AFR<0.01;GNOMAD_EXOMES:AMR<0.01;GNOMAD_EXOMES:EAS<0.01;" +
                            "GNOMAD_EXOMES:FIN<0.01;GNOMAD_EXOMES:NFE<0.01;GNOMAD_EXOMES:ASJ<0.01;GNOMAD_EXOMES:OTH<0.01",
                        ct: "SO:0001893,SO:0001574,SO:0001575,SO:0001587,SO:0001589,SO:0001578,SO:0001582,SO:0001889," +
                            "SO:0001821,SO:0001822,SO:0001583,SO:0001630,SO:0001626"
                    }
                },
                {
                    name: "Tiering (AD)",
                    active: false,
                    query: {
                        biotype: "protein_coding,IG_C_gene,IG_D_gene,IG_J_gene,IG_V_gene,IG_V_gene,nonsense_mediated_decay," +
                            "non_stop_decay,TR_C_gene,TR_D_gene,TR_J_gene,TR_V_gene",
                        alternate_frequency: "1kG_phase3:AFR<0.002;1kG_phase3:AMR<0.002;1kG_phase3:EAS<0.002;1kG_phase3:EUR<0.002;" +
                            "1kG_phase3:SAS<0.002;GNOMAD_EXOMES:AFR<0.001;GNOMAD_EXOMES:AMR<0.001;GNOMAD_EXOMES:EAS<0.001;" +
                            "GNOMAD_EXOMES:FIN<0.001;GNOMAD_EXOMES:NFE<0.001;GNOMAD_EXOMES:ASJ<0.001;GNOMAD_EXOMES:OTH<0.002",
                        ct: "SO:0001893,SO:0001574,SO:0001575,SO:0001587,SO:0001589,SO:0001578,SO:0001582,SO:0001889," +
                            "SO:0001821,SO:0001822,SO:0001583,SO:0001630,SO:0001626"
                    }
                },
                {
                    name: "Stickler syndrome",
                    query: {
                        gene: "COL11A1,COL11A2,COL2A1,COL9A1,COL9A2,COL9A3,LOXL3",
                        biotype: "protein_coding",
                        alternate_frequency: "1kG_phase3:ALL<0.001;GNOMAD_GENOMES:ALL<0.001"
                    }
                }
            ]
        },
        grid: {
            // showSelect: true,
            showSelectCheckbox: false,
            nucleotideGenotype: true,
            interpretation: true,
            includeMissing: true,
            // alias: {
            //     DP: "NR"
            // },
            queryParams: {
                useSearchIndex: "yes",
                skipCount: false,
                approximateCount: true,
                approximateCountSamplingSize: 500,
                timeout: 30000
            }
        },
        detail: [
            {
                id: "annotation",
                component: "cellbase-variantannotation-view",
                title: "Advanced Annotation",
                active: true
            },
            {
                id: "fileMetrics",
                component: "opencga-variant-file-metrics",
                title: "File Metrics"
            },
            {
                id: "beacon",
                component: "variant-beacon-network",
                title: "Beacon"
                // Uncomment and edit Beacon hosts to change default hosts
                // hosts: [
                //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                //     "lovd", "hgmd", "icgc", "sahgp"
                // ]
            }
        ],
        css: {
            style: "font-size: 12px"
        }
    },*/
    /*    clinicalPortal: {
        title: "Case Portal",
        reviewCases: {
            grid: {
                columns: {
                    hidden: []
                }
            }
        }
    },*/

    /*panel: {
        active: false
    },
    individual: {
        active: false
    },
    family: {
        active: false
    },*/
    gene: {
        protein: {
            color: {
                synonymous_variant: "blue",
                coding_sequence_variant: "blue",
                missense_variant: "orange",
                protein_altering_variant: "orange",
                start_lost: "red",
                stop_gained: "red",
                stop_lost: "red",
                stop_retained_variant: "red"
            }
        },
        active: false
    }
    /*beacon: {
        active: false,
        hosts: [
            "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc", "lovd", "hgmd", "icgc", "sahgp"
        ]
    },*/
    /*clinical: {
        icd10: ICD_10,
        upload: {
            visible: true
        },
        analysis: {
            visible: true
        },
        interpretation: {
            visible: true,
            algorithms: [
                {id: "interactive", title: "Interactive (based on TEAM paper)"},
                {id: "automatic", title: "Automatic", checked: true}
            ],

            // Interpretation standard config
            title: "Interpretation",
            filter: {
                // This disables two subsections in the filter menu Prioritization
                menu: Object.assign({}, filterMenu, {skipSubsections: ["cohort", "study"]}),
                examples: []
            },
            grid: {
                showSelect: true,
                nucleotideGenotype: true,
                includeMissing: true,
                queryParams: {
                    useSearchIndex: "yes",
                    approximateCount: true,
                    skipCount: false,
                    approximateCountSamplingSize: 5000,
                    timeout: 30000
                }
            }
        },
        report: {
            visible: true
        },


        queryParams: {
            useSearchIndex: "yes",
            approximateCount: true,
            approximateCountSamplingSize: 5000,
            timeout: 30000
        },
        variableSet: {
            name: "clinical_vs",
            exclude: [
                {
                    webComponent: "variant-sample-filter",
                    variables: ["HPO", "diagnosis"]
                }
            ]
        },
        kariotypicSex: ["XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER", "UNKNOWN"],
        ethnicity: [
            {
                id: "white_mediterranean", title: "white mediterranean"
            },
            {
                id: "white_caucasian", title: "white caucasian"
            },
            {
                id: "black", title: "black"
            },
            {
                id: "asiatic", title: "asiatic"
            },
            {
                id: "amerindian", title: "amerindian"
            },
            {
                id: "gipsy", title: "gipsy"
            },
            {
                id: "arabic", title: "arabic"
            },
            {
                id: "hindu", title: "hindu"
            },
            {
                id: "australian_native", title: "australian native"
            },
            {
                id: "askenazi_jew", title: "askenazi jew"
            },
            {
                id: "sefardi_jew", title: "sefardi jew"
            },
            {
                id: "ne", title: "NE/Unkonwn"
            }
        ],
        countries: ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France",
            "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland",
            "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "United Kingdom", "United States", "Other"],
        province: ["Albacete", "Alicante", "Almeria", "Álava", "Asturias", "Ávila", "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres",
            "Cádiz", "Cantabria", "Castellón", "Ceuta", "Ciudad Real", "Cordoba", "Coruña, La", "Cuenca", "Gerona", "Granada",
            "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Jaén", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Melilla", "Murcia",
            "Navarra", "Orense", "Palencia", "Palmas, Las", "Pontevedra", "Rioja, La", "Salamanca", "Santa Cruz de Tenerife", "Segovia",
            "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"],
        status: [
            {
                id: "AFFECTED", title: "Affected"
            },
            {
                id: "UNAFFECTED", title: "Unaffected"
            },
            {
                id: "CONTROL", title: "Control"
            },
            {
                id: "UNKNOWN", title: "Unknown"
            }
        ],
        life_status: [
            {
                id: "ALIVE", title: "Alive"
            },
            {
                id: "ABORTED", title: "Aborted"
            },
            {
                id: "DECEASED", title: "Deceased"
            },
            {
                id: "UNBORN", title: "Unborn"
            },
            {
                id: "STILLBORN", title: "Still-born"
            },
            {
                id: "MISCARRIAGE", title: "Miscarriage"
            },
            {
                id: "UNKNOWN", title: "Unknown"
            }
        ],
        sample_type: [
            {
                id: "blood", title: "blood"
            },
            {
                id: "amniotic_fluid", title: "amniotic fluid"
            },
            {
                id: "chorionic_villi", title: "chorionic villi"
            },
            {
                id: "circulating_fetal", title: "circulating fetal"
            },
            {
                id: "circulating_tumor", title: "circulating tumor"
            },
            {
                id: "tissue_fresh", title: "tissue (fresh)"
            },
            {
                id: "other_fluids", title: "other fluids"
            },
            {
                id: "ne", title: "ne/unknown"
            }
        ],
        cell_line: [
            {
                id: "germline",
                title: "constitutive (germline)",
                checked: true
            },
            {
                id: "somatic",
                title: "somatic",
                checked: false
            }
        ],
        active: false,
        filter: filterMenu,
        grid: {
            showSelect: true,
            nucleotideGenotype: true,
            downloadQcSample: false
        }
    },*/
    /*genomeBrowser: {
        active: false
    }*/
};
