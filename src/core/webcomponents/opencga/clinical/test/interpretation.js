const interpretationJson = {
    id: "24",
    name: "INT-500",
    description: "Description of this interpretation",

    clinicalAnalysis: {
        id: 23,
        name: "Clinical Analysis name",
        description: "Clinical Analysis description",
        type: "TRIO",
        creationDate: "8/10/2014",

        // Files
        germline: {
            name: "NA0001.vcf.gz",
            path: "/data/vcf",
            assembly: "GRCh38",
            stats: {}
        },
        somatic: {
            name: "NA0001.vcf.gz",
            path: "/data/vcf",
            assembly: "GRCh38",
            stats: {}
        },

        subjects: [
            {
                id: 10,
                name: "NA0001",
                version: 1,
                sex: "MALE",
                affectationStatus:"AFFECTED",
                ethnicity:"black",
                karyotypicSex: "XY",
                dateOfBirth: "14/02/1994",
                lifeStatus: "ALIVE",
                parentalConsanguinity: false,
                population: {
                    name: "Italy"
                },
                ontologyTerms: [
                    {id: "HP:0000478", name: "Abnormality of the eye", source: "HPO"}, {
                        "id": "H00-H59",
                        "name": "VII. Diseases of the eye and adnexa ",
                        "source": "ICD10"
                    },
                    {
                        id: "HP:001233",
                        name: "Aaaa",
                        source: "HPO"
                    }
                ],
                samples: [
                    {
                        id: 113,
                        name: "NA0001",
                        somatic: false,
                        type: "blood",
                        ontologyTerms: [
                            {id: "HP:0000478", name: "Abnormality of the eye", source: "HPO"},  {
                                id: "HP:001233",
                                name: "Aaaa",
                                source: "HPO"
                            },  {
                                "id": "H00-H59",
                                "name": "VII. Diseases of the eye and adnexa ",
                                "source": "ICD10"
                            }
                        ],
                        annotationSets: [
                            {
                                "name":"annotation_sample_son_affected_test","variableSetId":4,
                                "annotations":[{"name":"testYear","value":"2017"},{"name":"physician","value":"Dr Florido"},{"name":"hospital","value":"HUVR"},{"name":"testAge","value":"34"},{"name":"technicalData","value":"Illumina"}],
                                "creationDate":"20170719152516"
                            }
                        ],
                        description: "Sample description"
                    }
                ],
                description: "Subject description"
            }
        ],
        family: {
            id: 23,
            name: "Martinez Pujalte",
            description: "",
            release: 1,
            version: 2,
            diseases: [
                {
                    id: "HP:001233",
                    name: "Aaaa",
                    source: "HPO"
                },
                {
                    id: "OMIM:056789",
                    name: "Cccc",
                    source: "OMIM"
                },
                {
                    id: "ddddd",
                    name: "Ddddd",
                    source: "HPO"
                },
                {
                    "id": "H00-H59",
                    "name": "VII. Diseases of the eye and adnexa ",
                    "source": "ICD10"
                }
            ],
            members: [
                {
                    "id": 10, "version": 1, "name": "NA0001", sex: "male",
                    father: "NA0003",
                    mother: "NA0004",
                    diseases: [ {
                        id: "OMIM:056789",
                        name: "Cccc",
                        source: "OMIM"
                    }, {
                        id: "HP:001233",
                        name: "Aaaa",
                        source: "HPO"
                    }],
                    carrier: ["OMIM:056789"],
                    parentalConsanguinity: true,
                    multiples: {"type": "mellizo", "siblings": ["pepe"]}
                },
                {
                    "id": 13, "version": 1, "name": "NA0002", sex: "female",
                    father: "NA0003",
                    mother: "NA0004",
                    diseases: [],
                    carrier: [{
                        id: "OMIM:056789",
                        name: "Cccc",
                        source: "OMIM"
                    }],
                    parentalConsanguinity: true,
                    multiples: {"type": "mellizo", "siblings": ["pepe"]}
                },
                {
                    "id": 11, "version": 1, "name": "NA0003", sex: "male", lifeStatus: "deceased",
                    // father: {"id": -1, "version": 1},
                    // mother: {"id": -1, "version": 1},
                    diseases: [ {
                        id: "HP:001233",
                        name: "Aaaa",
                        source: "HPO"
                    }],
                    carrier: ["OMIM:056789"],
                    parentalConsaguinity: false,
                    multiples: {"type": "mellizo", "siblings": ["luis"]}
                },
                {
                    "id": 12, "version": 1, "name": "NA0004", sex: "female",
                    // father: {"id": -1, "version": 1},
                    // mother: {"id": -1, "version": 1},
                    diseases: [  {
                        "id": "H00-H59",
                        "name": "VII. Diseases of the eye and adnexa ",
                        "source": "ICD10"
                    }],
                    carrier: ["OMIM:056789"],
                    parentalConsaguinity: false,
                    multiples: {"type": "mellizo", "siblings": ["luis"]}
                }
            ],

            annotation: [],
            creationDate: "",
            attributes: {}
        },
        interpretations: []
    },

    software: {
        name: "TEAM",
        version: "2.0",
        website: "https://www.ncbi.nlm.nih.gov/pubmed/24861626",
        repository: "https://github.com/opencb/opencga",
        commit: "f43372aa",
        params: {}
    },

    analyst: {
        name: "Javier Florido",
        email: "florido@sas.com",
        company: "SAS"
    },

    versions: [
        {id: "cellbase", name: "CellBase", type: "DDBB", version: "4.5.0"}
    ],

    filters: {
        biotype: "protein_coding",
        conservation: "gerp<0.2"
    },

    creationDate: "24/08/2017",
    comments: [{author: "", type: "", comment: "", date: ""}],
    attributes: {},

    reportedVariants: [
        {
            id: "19:45411941:T:C",
            names: ["rs429358"],
            chromosome: "19",
            start: 3333,
            end: 3335,
            type: "SNV",
            studies: [
                {
                    "stats":{

                    },
                    files: [
                        {
                            "fileId":"14437",
                            "call":"10352:T:TA:0",
                            "attributes":{
                                "AC":"1",
                                "HRun":"1",
                                "MQRankSum":"2.042",
                                "set":"FilteredInAll",
                                "FILTER": "TruthSensitivity99.90to100.00",
                                "MQ":"22",
                                "AF":"0.5",
                                "HaplotypeScore":"1250.1991",
                                "BaseQRankSum":"-1.824",
                                "QUAL":"2380.17",
                                "DP":"224",
                                "ReadPosRankSum":"0.538",
                                "AN":"2",
                                "FS":"8.408",
                                "MQ0":"40",
                                "SB":"-398.55",
                                "culprit":"DP",
                                "QD":"10.63",
                                "VQSLOD":"-2.281"
                            }
                        },
                        {
                            "fileId":"14439",
                            "call":"",
                            "attributes":{
                                "AC":"1",
                                "HRun":"1",
                                "MQRankSum":"-1.385",
                                "set":"FilteredInAll",
                                "FILTER":"LowQD;TruthSensitivityTranche99.90to100.00",
                                "MQ":"22",
                                "AF":"0.5",
                                "Dels":"0.04",
                                "HaplotypeScore":"297.9985",
                                "BaseQRankSum":"-0.425",
                                "QUAL":"121.23999999999998",
                                "DP":"250",
                                "ReadPosRankSum":"-4.178",
                                "AN":"2",
                                "FS":"2.958",
                                "MQ0":"35",
                                "DS":"true",
                                "SB":"-67.03",
                                "culprit":"DP",
                                "QD":"0.48",
                                "VQSLOD":"-95.9661"
                            }
                        },
                        {
                            "fileId":"14441",
                            "call":"",
                            "attributes":{
                                "AC":"1",
                                "HRun":"1",
                                "MQRankSum":"0.73",
                                "set":"FilteredInAll",
                                "FILTER":"LowGQX;LowQD;TruthSensitivityTranche99.90to100.00",
                                "MQ":"22",
                                "AF":"0.5",
                                "Dels":"0.02",
                                "HaplotypeScore":"286.454",
                                "BaseQRankSum":"0.73",
                                "QUAL":"24.93",
                                "DP":"241",
                                "ReadPosRankSum":"-0.869",
                                "AN":"2",
                                "FS":"0.0",
                                "MQ0":"36",
                                "SB":"-16.01",
                                "culprit":"DP",
                                "QD":"0.1",
                                "VQSLOD":"-51.6337"
                            }
                        },
                        {
                            "fileId":"14441",
                            "call":"",
                            "attributes":{
                                "AC":"2",
                                "HRun":"1",
                                "MQRankSum":"0.73",
                                "set":"FilteredInAll",
                                "FILTER":"LowGQX;LowQD;TruthSensitivityTranche99.90to100.00",
                                "MQ":"22",
                                "AF":"0.4",
                                "Dels":"0.02",
                                "HaplotypeScore":"286.454",
                                "BaseQRankSum":"0.73",
                                "QUAL":"14.93",
                                "DP":"241",
                                "ReadPosRankSum":"-0.869",
                                "AN":"2",
                                "FS":"0.0",
                                "MQ0":"36",
                                "SB":"-16.01",
                                "culprit":"DP",
                                "QD":"0.1",
                                "VQSLOD":"-51.6337"
                            }
                        }
                    ],
                    "studyId": "hgvauser@platinum:illumina_platinum",
                    "samplesData":[
                        [
                            "1/1"
                        ],
                        [
                            "0/0"
                        ],
                        [
                            "0/1"
                        ],
                        [
                            "0/1"
                        ]
                    ],
                    "secondaryAlternates":[
                        {
                            "chromosome":"1",
                            "start":10353,
                            "end":10352,
                            "reference":"",
                            "alternate":"A",
                            "type":"INDEL"
                        }
                    ],
                    "format":[
                        "GT"
                    ]
                }
            ],
            annotation: {
                chromosome: "19",
                start: 45411941,
                reference: "T",
                alternate: "C",
                id: "rs429358",
                hgvs: [
                    "ENST00000252486(ENSG00000130203):c.388T>C",
                    "ENST00000446996(ENSG00000130203):c.388T>C",
                    "ENST00000434152(ENSG00000130203):c.466T>C",
                    "ENST00000425718(ENSG00000130203):c.388T>C"
                ],
                cytoband: [
                    {
                        name: "q13.32"
                    }
                ],
                "displayConsequenceType":"missense_variant",
                "consequenceTypes":[
                    {
                        "geneName":"TOMM40",
                        "ensemblGeneId":"ENSG00000130204",
                        "ensemblTranscriptId":"ENST00000252487",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "transcriptAnnotationFlags":[
                            "CCDS",
                            "basic"
                        ],
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001632",
                                "name":"downstream_variant"
                            }
                        ]
                    },
                    {
                        "geneName":"TOMM40",
                        "ensemblGeneId":"ENSG00000130204",
                        "ensemblTranscriptId":"ENST00000592434",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "transcriptAnnotationFlags":[
                            "basic"
                        ],
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001632",
                                "name":"downstream_variant"
                            }
                        ]
                    },
                    {
                        "geneName":"APOE",
                        "ensemblGeneId":"ENSG00000130203",
                        "ensemblTranscriptId":"ENST00000252486",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "exonOverlap":[
                            {
                                "number":"4/4",
                                "percentage":0.11614402
                            }
                        ],
                        "transcriptAnnotationFlags":[
                            "CCDS",
                            "basic"
                        ],
                        "cdnaPosition":499,
                        "cdsPosition":388,
                        "codon":"Tgc/Cgc",
                        "proteinVariantAnnotation":{
                            "uniprotAccession":"P02649",
                            "position":130,
                            "reference":"CYS",
                            "alternate":"ARG",
                            "uniprotVariantId":"VAR_000652",
                            "functionalDescription":"In HLPP3; form E3**, form E4, form E4/3 and some forms E5-type; only form E3** is disease-linked; dbSNP:rs429358.",
                            "substitutionScores":[
                                {
                                    "score":1.0,
                                    "source":"sift",
                                    "description":"tolerated"
                                },
                                {
                                    "score":0.0,
                                    "source":"polyphen",
                                    "description":"benign"
                                }
                            ],
                            "keywords":[
                                "3D-structure",
                                "Alzheimer disease",
                                "Amyloidosis",
                                "Cholesterol metabolism",
                                "Chylomicron",
                                "Complete proteome",
                                "Direct protein sequencing",
                                "Disease mutation",
                                "Glycation",
                                "Glycoprotein",
                                "HDL",
                                "Heparin-binding",
                                "Hyperlipidemia",
                                "Lipid metabolism",
                                "Lipid transport",
                                "Neurodegeneration",
                                "Oxidation",
                                "Phosphoprotein",
                                "Polymorphism",
                                "Reference proteome",
                                "Repeat",
                                "Secreted",
                                "Signal",
                                "Steroid metabolism",
                                "Sterol metabolism",
                                "Transport",
                                "VLDL"
                            ],
                            "features":[
                                {
                                    "start":106,
                                    "end":141,
                                    "type":"helix"
                                },
                                {
                                    "id":"IPR000074",
                                    "start":81,
                                    "end":292,
                                    "description":"Apolipoprotein A/E"
                                },
                                {
                                    "id":"PRO_0000001987",
                                    "start":19,
                                    "end":317,
                                    "type":"chain",
                                    "description":"Apolipoprotein E"
                                },
                                {
                                    "start":124,
                                    "end":145,
                                    "type":"repeat",
                                    "description":"3"
                                },
                                {
                                    "start":80,
                                    "end":255,
                                    "type":"region of interest",
                                    "description":"8 X 22 AA approximate tandem repeats"
                                }
                            ]
                        },
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001583",
                                "name":"missense_variant"
                            }
                        ]
                    },
                    {
                        "geneName":"APOE",
                        "ensemblGeneId":"ENSG00000130203",
                        "ensemblTranscriptId":"ENST00000446996",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "exonOverlap":[
                            {
                                "number":"4/4",
                                "percentage":0.24271844
                            }
                        ],
                        "transcriptAnnotationFlags":[
                            "mRNA_end_NF",
                            "cds_end_NF"
                        ],
                        "cdnaPosition":477,
                        "cdsPosition":388,
                        "codon":"Tgc/Cgc",
                        "proteinVariantAnnotation":{
                            "position":130,
                            "reference":"CYS",
                            "alternate":"ARG",
                            "substitutionScores":[
                                {
                                    "score":1.0,
                                    "source":"sift",
                                    "description":"tolerated"
                                },
                                {
                                    "score":0.0,
                                    "source":"polyphen",
                                    "description":"benign"
                                }
                            ]
                        },
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001583",
                                "name":"missense_variant"
                            },
                            {
                                "accession":"SO:0001580",
                                "name":"splice_site"
                            }
                        ]
                    },
                    {
                        "geneName":"APOE",
                        "ensemblGeneId":"ENSG00000130203",
                        "ensemblTranscriptId":"ENST00000485628",
                        "strand":"+",
                        "biotype":"retained_intron",
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0002083",
                                "name":"2KB_downstream_variant"
                            }
                        ]
                    },
                    {
                        "geneName":"APOE",
                        "ensemblGeneId":"ENSG00000130203",
                        "ensemblTranscriptId":"ENST00000434152",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "exonOverlap":[
                            {
                                "number":"4/4",
                                "percentage":0.20283976
                            }
                        ],
                        "transcriptAnnotationFlags":[
                            "mRNA_end_NF",
                            "cds_end_NF"
                        ],
                        "cdnaPosition":523,
                        "cdsPosition":466,
                        "codon":"Tgc/Cgc",
                        "proteinVariantAnnotation":{
                            "position":156,
                            "reference":"CYS",
                            "alternate":"ARG",
                            "substitutionScores":[
                                {
                                    "score":0.91,
                                    "source":"sift",
                                    "description":"tolerated"
                                },
                                {
                                    "score":0.0,
                                    "source":"polyphen",
                                    "description":"benign"
                                }
                            ]
                        },
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001583",
                                "name":"missense_variant"
                            }
                        ]
                    },
                    {
                        "geneName":"APOE",
                        "ensemblGeneId":"ENSG00000130203",
                        "ensemblTranscriptId":"ENST00000425718",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "exonOverlap":[
                            {
                                "number":"3/3",
                                "percentage":0.23696682
                            }
                        ],
                        "transcriptAnnotationFlags":[
                            "mRNA_end_NF",
                            "cds_end_NF"
                        ],
                        "cdnaPosition":653,
                        "cdsPosition":388,
                        "codon":"Tgc/Cgc",
                        "proteinVariantAnnotation":{
                            "position":130,
                            "reference":"CYS",
                            "alternate":"ARG",
                            "substitutionScores":[
                                {
                                    "score":1.0,
                                    "source":"sift",
                                    "description":"tolerated"
                                },
                                {
                                    "score":0.0,
                                    "source":"polyphen",
                                    "description":"benign"
                                }
                            ]
                        },
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001583",
                                "name":"missense_variant"
                            }
                        ]
                    },
                    {
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001566",
                                "name":"regulatory_region_variant"
                            }
                        ]
                    }
                ],
                "populationFrequencies":[
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.86164606,
                        "altAlleleFreq":0.13835394,
                        "refHomGenotypeFreq":0.7428665,
                        "hetGenotypeFreq":0.23755904,
                        "altHomGenotypeFreq":0.019574426
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"OTH",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8729389,
                        "altAlleleFreq":0.1270611,
                        "refHomGenotypeFreq":0.7594568,
                        "hetGenotypeFreq":0.22696412,
                        "altHomGenotypeFreq":0.013579049
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"EAS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9130086,
                        "altAlleleFreq":0.08699144,
                        "refHomGenotypeFreq":0.83297646,
                        "hetGenotypeFreq":0.16006424,
                        "altHomGenotypeFreq":0.006959315
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"AMR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.89662445,
                        "altAlleleFreq":0.103375524,
                        "refHomGenotypeFreq":0.8039965,
                        "hetGenotypeFreq":0.18525594,
                        "altHomGenotypeFreq":0.010747552
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"ASJ",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8845232,
                        "altAlleleFreq":0.11547676,
                        "refHomGenotypeFreq":0.7800671,
                        "hetGenotypeFreq":0.20891231,
                        "altHomGenotypeFreq":0.011020604
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"FIN",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.79147565,
                        "altAlleleFreq":0.20852435,
                        "refHomGenotypeFreq":0.6279271,
                        "hetGenotypeFreq":0.32709703,
                        "altHomGenotypeFreq":0.04497584
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"NFE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.84970874,
                        "altAlleleFreq":0.15029128,
                        "refHomGenotypeFreq":0.71927917,
                        "hetGenotypeFreq":0.26085907,
                        "altHomGenotypeFreq":0.019861752
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"AFR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7777113,
                        "altAlleleFreq":0.22228873,
                        "refHomGenotypeFreq":0.60090977,
                        "hetGenotypeFreq":0.35360307,
                        "altHomGenotypeFreq":0.04548719
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"MALE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8640703,
                        "altAlleleFreq":0.13592973,
                        "refHomGenotypeFreq":0.7469009,
                        "hetGenotypeFreq":0.23433875,
                        "altHomGenotypeFreq":0.018760357
                    },
                    {
                        "study":"GNOMAD_EXOMES",
                        "population":"FEMALE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8586724,
                        "altAlleleFreq":0.14132762,
                        "refHomGenotypeFreq":0.7379178,
                        "hetGenotypeFreq":0.24150923,
                        "altHomGenotypeFreq":0.020573009
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.83512056,
                        "altAlleleFreq":0.16487944,
                        "refHomGenotypeFreq":0.6976669,
                        "hetGenotypeFreq":0.27490738,
                        "altHomGenotypeFreq":0.02742575
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"OTH",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.838809,
                        "altAlleleFreq":0.16119097,
                        "refHomGenotypeFreq":0.69609857,
                        "hetGenotypeFreq":0.28542095,
                        "altHomGenotypeFreq":0.018480493
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"EAS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.900625,
                        "altAlleleFreq":0.099375,
                        "refHomGenotypeFreq":0.80875,
                        "hetGenotypeFreq":0.18375,
                        "altHomGenotypeFreq":0.0075
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"AMR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.875,
                        "altAlleleFreq":0.125,
                        "refHomGenotypeFreq":0.7644231,
                        "hetGenotypeFreq":0.22115384,
                        "altHomGenotypeFreq":0.014423077
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"ASJ",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8833333,
                        "altAlleleFreq":0.11666667,
                        "refHomGenotypeFreq":0.7733333,
                        "hetGenotypeFreq":0.22,
                        "altHomGenotypeFreq":0.006666667
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"FIN",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.81095815,
                        "altAlleleFreq":0.18904188,
                        "refHomGenotypeFreq":0.65404475,
                        "hetGenotypeFreq":0.31382674,
                        "altHomGenotypeFreq":0.032128513
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"NFE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.85714287,
                        "altAlleleFreq":0.14285715,
                        "refHomGenotypeFreq":0.7344064,
                        "hetGenotypeFreq":0.24547283,
                        "altHomGenotypeFreq":0.020120725
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"AFR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.788976,
                        "altAlleleFreq":0.21102399,
                        "refHomGenotypeFreq":0.6226937,
                        "hetGenotypeFreq":0.33256456,
                        "altHomGenotypeFreq":0.044741698
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"MALE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.83254886,
                        "altAlleleFreq":0.16745116,
                        "refHomGenotypeFreq":0.69404566,
                        "hetGenotypeFreq":0.27700636,
                        "altHomGenotypeFreq":0.028947989
                    },
                    {
                        "study":"GNOMAD_GENOMES",
                        "population":"FEMALE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.83829296,
                        "altAlleleFreq":0.16170707,
                        "refHomGenotypeFreq":0.70213383,
                        "hetGenotypeFreq":0.27231818,
                        "altHomGenotypeFreq":0.025547976
                    },
                    {
                        "study":"ESP6500",
                        "population":"AA",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.81068414,
                        "altAlleleFreq":0.18931584,
                        "refHomGenotypeFreq":0.66166824,
                        "hetGenotypeFreq":0.29803187,
                        "altHomGenotypeFreq":0.040299907
                    },
                    {
                        "study":"ESP6500",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.85836667,
                        "altAlleleFreq":0.1416333,
                        "refHomGenotypeFreq":0.74107283,
                        "hetGenotypeFreq":0.23458767,
                        "altHomGenotypeFreq":0.024339471
                    },
                    {
                        "study":"ESP6500",
                        "population":"EA",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.88311845,
                        "altAlleleFreq":0.116881534,
                        "refHomGenotypeFreq":0.7822914,
                        "hetGenotypeFreq":0.20165409,
                        "altHomGenotypeFreq":0.016054489
                    },
                    {
                        "study":"GONL",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8416834,
                        "altAlleleFreq":0.15831663
                    },
                    {
                        "study":"EXAC",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.81566757,
                        "altAlleleFreq":0.18433243,
                        "refHomGenotypeFreq":0.65346056,
                        "hetGenotypeFreq":0.324414,
                        "altHomGenotypeFreq":0.022125423
                    },
                    {
                        "study":"EXAC",
                        "population":"OTH",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8293651,
                        "altAlleleFreq":0.17063493,
                        "refHomGenotypeFreq":0.6666667,
                        "hetGenotypeFreq":0.32539684,
                        "altHomGenotypeFreq":0.007936508
                    },
                    {
                        "study":"EXAC",
                        "population":"SAS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8898131,
                        "altAlleleFreq":0.110186875,
                        "refHomGenotypeFreq":0.7932999,
                        "hetGenotypeFreq":0.19302644,
                        "altHomGenotypeFreq":0.013673656
                    },
                    {
                        "study":"EXAC",
                        "population":"EAS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8496169,
                        "altAlleleFreq":0.15038314,
                        "refHomGenotypeFreq":0.710728,
                        "hetGenotypeFreq":0.2777778,
                        "altHomGenotypeFreq":0.011494253
                    },
                    {
                        "study":"EXAC",
                        "population":"AMR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7854512,
                        "altAlleleFreq":0.2145488,
                        "refHomGenotypeFreq":0.5782689,
                        "hetGenotypeFreq":0.41436464,
                        "altHomGenotypeFreq":0.0073664826
                    },
                    {
                        "study":"EXAC",
                        "population":"FIN",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.6733746,
                        "altAlleleFreq":0.32662538,
                        "refHomGenotypeFreq":0.4148607,
                        "hetGenotypeFreq":0.51702785,
                        "altHomGenotypeFreq":0.06811146
                    },
                    {
                        "study":"EXAC",
                        "population":"NFE",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.79221934,
                        "altAlleleFreq":0.20778066,
                        "refHomGenotypeFreq":0.60645425,
                        "hetGenotypeFreq":0.37153015,
                        "altHomGenotypeFreq":0.022015588
                    },
                    {
                        "study":"EXAC",
                        "population":"AFR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.72676283,
                        "altAlleleFreq":0.27323717,
                        "refHomGenotypeFreq":0.50641024,
                        "hetGenotypeFreq":0.44070512,
                        "altHomGenotypeFreq":0.052884616
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"MXL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9140625,
                        "altAlleleFreq":0.0859375,
                        "refHomGenotypeFreq":0.828125,
                        "hetGenotypeFreq":0.171875,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8494409,
                        "altAlleleFreq":0.15055911,
                        "refHomGenotypeFreq":0.72723645,
                        "hetGenotypeFreq":0.24440894,
                        "altHomGenotypeFreq":0.028354632
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"SAS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.91308796,
                        "altAlleleFreq":0.086912066,
                        "refHomGenotypeFreq":0.8364008,
                        "hetGenotypeFreq":0.15337422,
                        "altHomGenotypeFreq":0.010224949
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"CLM",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.84574467,
                        "altAlleleFreq":0.15425532,
                        "refHomGenotypeFreq":0.71276593,
                        "hetGenotypeFreq":0.26595744,
                        "altHomGenotypeFreq":0.021276595
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"ITU",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9166667,
                        "altAlleleFreq":0.083333336,
                        "refHomGenotypeFreq":0.8333333,
                        "hetGenotypeFreq":0.16666667,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"AFR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7322239,
                        "altAlleleFreq":0.2677761,
                        "refHomGenotypeFreq":0.5385779,
                        "hetGenotypeFreq":0.38729197,
                        "altHomGenotypeFreq":0.0741301
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"CHS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.94285715,
                        "altAlleleFreq":0.057142857,
                        "refHomGenotypeFreq":0.8857143,
                        "hetGenotypeFreq":0.11428572,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"JPT",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9182692,
                        "altAlleleFreq":0.08173077,
                        "refHomGenotypeFreq":0.8557692,
                        "hetGenotypeFreq":0.125,
                        "altHomGenotypeFreq":0.01923077
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"YRI",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7638889,
                        "altAlleleFreq":0.2361111,
                        "refHomGenotypeFreq":0.5740741,
                        "hetGenotypeFreq":0.3796296,
                        "altHomGenotypeFreq":0.046296295
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"PJL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9166667,
                        "altAlleleFreq":0.083333336,
                        "refHomGenotypeFreq":0.84375,
                        "hetGenotypeFreq":0.14583334,
                        "altHomGenotypeFreq":0.010416667
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"GWD",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7256637,
                        "altAlleleFreq":0.27433628,
                        "refHomGenotypeFreq":0.53097343,
                        "hetGenotypeFreq":0.38938054,
                        "altHomGenotypeFreq":0.07964602
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"STU",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.86764705,
                        "altAlleleFreq":0.13235295,
                        "refHomGenotypeFreq":0.75490195,
                        "hetGenotypeFreq":0.22549021,
                        "altHomGenotypeFreq":0.019607844
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"GBR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.82417583,
                        "altAlleleFreq":0.17582418,
                        "refHomGenotypeFreq":0.6923077,
                        "hetGenotypeFreq":0.26373628,
                        "altHomGenotypeFreq":0.043956045
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"CDX",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.89784944,
                        "altAlleleFreq":0.10215054,
                        "refHomGenotypeFreq":0.79569894,
                        "hetGenotypeFreq":0.20430107,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"KHV",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.90909094,
                        "altAlleleFreq":0.09090909,
                        "refHomGenotypeFreq":0.83838385,
                        "hetGenotypeFreq":0.14141414,
                        "altHomGenotypeFreq":0.02020202
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"IBS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8598131,
                        "altAlleleFreq":0.14018692,
                        "refHomGenotypeFreq":0.72897196,
                        "hetGenotypeFreq":0.26168224,
                        "altHomGenotypeFreq":0.009345794
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"BEB",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9127907,
                        "altAlleleFreq":0.0872093,
                        "refHomGenotypeFreq":0.8372093,
                        "hetGenotypeFreq":0.15116279,
                        "altHomGenotypeFreq":0.011627907
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"ACB",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7447917,
                        "altAlleleFreq":0.25520834,
                        "refHomGenotypeFreq":0.5625,
                        "hetGenotypeFreq":0.36458334,
                        "altHomGenotypeFreq":0.072916664
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"ESN",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.75757575,
                        "altAlleleFreq":0.24242425,
                        "refHomGenotypeFreq":0.57575756,
                        "hetGenotypeFreq":0.36363637,
                        "altHomGenotypeFreq":0.060606062
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"LWK",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.6212121,
                        "altAlleleFreq":0.37878788,
                        "refHomGenotypeFreq":0.3939394,
                        "hetGenotypeFreq":0.45454544,
                        "altHomGenotypeFreq":0.15151516
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"EUR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8449304,
                        "altAlleleFreq":0.15506959,
                        "refHomGenotypeFreq":0.71172965,
                        "hetGenotypeFreq":0.2664016,
                        "altHomGenotypeFreq":0.021868788
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"ASW",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.795082,
                        "altAlleleFreq":0.20491803,
                        "refHomGenotypeFreq":0.6229508,
                        "hetGenotypeFreq":0.3442623,
                        "altHomGenotypeFreq":0.032786883
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"AMR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8962536,
                        "altAlleleFreq":0.1037464,
                        "refHomGenotypeFreq":0.7982709,
                        "hetGenotypeFreq":0.19596541,
                        "altHomGenotypeFreq":0.0057636886
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"MSL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.7411765,
                        "altAlleleFreq":0.25882354,
                        "refHomGenotypeFreq":0.5411765,
                        "hetGenotypeFreq":0.4,
                        "altHomGenotypeFreq":0.05882353
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"GIH",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9514563,
                        "altAlleleFreq":0.048543688,
                        "refHomGenotypeFreq":0.9126214,
                        "hetGenotypeFreq":0.0776699,
                        "altHomGenotypeFreq":0.009708738
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"FIN",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.81313133,
                        "altAlleleFreq":0.18686868,
                        "refHomGenotypeFreq":0.6666667,
                        "hetGenotypeFreq":0.2929293,
                        "altHomGenotypeFreq":0.04040404
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"TSI",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.89719623,
                        "altAlleleFreq":0.10280374,
                        "refHomGenotypeFreq":0.7943925,
                        "hetGenotypeFreq":0.20560747,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"PUR",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8942308,
                        "altAlleleFreq":0.10576923,
                        "refHomGenotypeFreq":0.78846157,
                        "hetGenotypeFreq":0.21153846,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"CEU",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.82323235,
                        "altAlleleFreq":0.17676768,
                        "refHomGenotypeFreq":0.6666667,
                        "hetGenotypeFreq":0.3131313,
                        "altHomGenotypeFreq":0.02020202
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"PEL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.9411765,
                        "altAlleleFreq":0.05882353,
                        "refHomGenotypeFreq":0.88235295,
                        "hetGenotypeFreq":0.11764707,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"EAS",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.91369045,
                        "altAlleleFreq":0.08630952,
                        "refHomGenotypeFreq":0.83531743,
                        "hetGenotypeFreq":0.15674603,
                        "altHomGenotypeFreq":0.007936508
                    },
                    {
                        "study":"1kG_phase3",
                        "population":"CHB",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.89805824,
                        "altAlleleFreq":0.10194175,
                        "refHomGenotypeFreq":0.79611653,
                        "hetGenotypeFreq":0.2038835,
                        "altHomGenotypeFreq":0.0
                    },
                    {
                        "study":"UK10K_TWINSUK",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.86030203,
                        "altAlleleFreq":0.13969795
                    },
                    {
                        "study":"UK10K_ALSPAC",
                        "population":"ALL",
                        "refAllele":"T",
                        "altAllele":"C",
                        "refAlleleFreq":0.8461339,
                        "altAlleleFreq":0.15386611
                    }
                ],
                "conservation":[
                    {
                        "score":3.0199999809265137,
                        "source":"gerp"
                    },
                    {
                        "score":0.10899999737739563,
                        "source":"phastCons"
                    },
                    {
                        "score":-0.2150000035762787,
                        "source":"phylop"
                    }
                ],
                "geneTraitAssociation":[
                    {
                        "id":"umls:C0002395",
                        "name":"Alzheimer Disease",
                        "score":0.03470698,
                        "numberOfPubmeds":21,
                        "associationTypes":[
                            "Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "BeFree",
                            "GAD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0007222",
                        "name":"Cardiovascular Diseases",
                        "score":0.004634135,
                        "numberOfPubmeds":2,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "GAD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0021368",
                        "name":"Inflammation",
                        "score":0.0023170675,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "GAD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0006142",
                        "name":"Malignant neoplasm breast",
                        "score":0.0023170675,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "GAD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0524620",
                        "name":"Metabolic Syndrome X",
                        "score":0.0023170675,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "GAD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0494463",
                        "name":"Alzheimer's disease with late onset",
                        "score":5.6700915E-4,
                        "numberOfPubmeds":2,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0033975",
                        "name":"Psychotic Disorders",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0751713",
                        "name":"Inclusion Body Myopathy, Sporadic",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0011581",
                        "name":"Depressive Disorder",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0349204",
                        "name":"psychosis",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0019196",
                        "name":"Hepatitis C",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0041696",
                        "name":"Unipolar Depression",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C2079538",
                        "name":"Charcot-Marie-Tooth disease, Type 2A",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0812393",
                        "name":"depression",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C1392786",
                        "name":"Alteration Of Cognitive Function",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0282513",
                        "name":"Aphasia, Primary Progressive",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C1269683",
                        "name":"Depressive Disorder, Major",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0338656",
                        "name":"Impaired cognition",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C1270972",
                        "name":"Mild Cognitive Impairment",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0011570",
                        "name":"Depression",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "GeneticVariation"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0338508",
                        "name":"Optic Atrophy, Autosomal Dominant",
                        "score":2.8350457E-4,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker"
                        ],
                        "sources":[
                            "BeFree"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"OMIM:104310",
                        "name":"Long-tract signs",
                        "hpo":"HP:0002423",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:104310",
                        "name":"Neurofibrillary tangles",
                        "hpo":"HP:0002185",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:104310",
                        "name":"Late onset",
                        "hpo":"HP:0003584",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:104310",
                        "name":"Dementia",
                        "hpo":"HP:0000726",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:104310",
                        "name":"Parkinsonism",
                        "hpo":"HP:0001300",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:104310",
                        "name":"Alzheimer disease",
                        "hpo":"HP:0002511",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Hypercholesterolemia",
                        "hpo":"HP:0003124",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Hypertriglyceridemia",
                        "hpo":"HP:0002155",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Angina pectoris",
                        "hpo":"HP:0001681",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Abnormal glucose tolerance",
                        "hpo":"HP:0001952",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Xanthomatosis",
                        "hpo":"HP:0000991",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Peripheral arterial disease",
                        "hpo":"HP:0004950",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Obesity",
                        "hpo":"HP:0001513",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:107741",
                        "name":"Alzheimer disease",
                        "hpo":"HP:0002511",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Irregular hyperpigmentation",
                        "hpo":"HP:0007400",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Blepharitis",
                        "hpo":"HP:0000498",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Edema",
                        "hpo":"HP:0000969",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Subcutaneous hemorrhage",
                        "hpo":"HP:0001933",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Abnormality of the eye",
                        "hpo":"HP:0000478",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Mediastinal lymphadenopathy",
                        "hpo":"HP:0100721",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Splenomegaly",
                        "hpo":"HP:0001744",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Absent axillary hair",
                        "hpo":"HP:0002221",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Hepatomegaly",
                        "hpo":"HP:0002240",
                        "source":"hpo"
                    },
                    {
                        "id":"OMIM:269600",
                        "name":"Pulmonary infiltrates",
                        "hpo":"HP:0002113",
                        "source":"hpo"
                    },
                    {
                        "id":"umls:C2673196",
                        "name":"Lipoprotein Glomerulopathy",
                        "score":0.6339898,
                        "numberOfPubmeds":33,
                        "associationTypes":[
                            "Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "BeFree",
                            "CLINVAR",
                            "CTD_human",
                            "GAD",
                            "UNIPROT"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0002395",
                        "name":"Alzheimer Disease",
                        "score":0.49,
                        "numberOfPubmeds":1132,
                        "associationTypes":[
                            "AlteredExpression, Biomarker, GeneticVariation, PostTranslationalModification"
                        ],
                        "sources":[
                            "BeFree",
                            "CTD_human",
                            "GAD",
                            "LHGDN",
                            "RGD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0027051",
                        "name":"Myocardial Infarction",
                        "score":0.48972946,
                        "numberOfPubmeds":55,
                        "associationTypes":[
                            "Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "BeFree",
                            "CLINVAR",
                            "CTD_human",
                            "GAD",
                            "LHGDN"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0020479",
                        "name":"Hyperlipoproteinemia Type III",
                        "score":0.44119617,
                        "numberOfPubmeds":67,
                        "associationTypes":[
                            "Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "BeFree",
                            "CLINVAR",
                            "CTD_human",
                            "GAD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0036489",
                        "name":"Sea-Blue Histiocyte Syndrome",
                        "score":0.41,
                        "numberOfPubmeds":1,
                        "associationTypes":[
                            "Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "CLINVAR",
                            "CTD_human"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0020473",
                        "name":"Hyperlipidemias",
                        "score":0.3919975,
                        "numberOfPubmeds":84,
                        "associationTypes":[
                            "AlteredExpression, Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "BeFree",
                            "CTD_human",
                            "GAD",
                            "LHGDN",
                            "RGD"
                        ],
                        "source":"disgenet"
                    },
                    {
                        "id":"umls:C0020538",
                        "name":"Hypertension",
                        "score":0.38134018,
                        "numberOfPubmeds":68,
                        "associationTypes":[
                            "Biomarker, GeneticVariation"
                        ],
                        "sources":[
                            "BeFree",
                            "CTD_human",
                            "GAD",
                            "RGD"
                        ],
                        "source":"disgenet"
                    }
                ],
                "geneDrugInteraction":[
                    {
                        "geneName":"TOMM40",
                        "drugName":"PA164712505",
                        "source":"dgidb",
                        "studyType":"PharmGKB",
                        "type":"n/a"
                    },
                    {
                        "geneName":"TOMM40",
                        "drugName":"PA451260",
                        "source":"dgidb",
                        "studyType":"PharmGKB",
                        "type":"n/a"
                    },
                    {
                        "geneName":"APOE",
                        "drugName":"DB00064",
                        "source":"dgidb",
                        "studyType":"DrugBank",
                        "type":"n/a"
                    },
                    {
                        "geneName":"APOE",
                        "drugName":"DB00062",
                        "source":"dgidb",
                        "studyType":"DrugBank",
                        "type":"n/a"
                    },
                    {
                        "geneName":"APOE",
                        "drugName":"PA451363",
                        "source":"dgidb",
                        "studyType":"PharmGKB",
                        "type":"n/a"
                    }
                ],
                "functionalScore":[
                    {
                        "score":-1.1800003051757812,
                        "source":"cadd_raw"
                    },
                    {
                        "score":0.0,
                        "source":"cadd_scaled"
                    }
                ],
                "cytoband":[
                    {
                        "stain":"gpos25",
                        "name":"q13.32",
                        "start":44700001,
                        "end":47500000
                    }
                ]
            },

            calledGenotypes: [{
                sampleId: 21,
                individualId: 5,
                genotype: "0/0",
                zigosity: "heterozygous",
                phaseSet: "phaseSet",
                depthReference: 2,
                depthAlternate: 3,
                copyNumber: 2
            }
            ],
            reportEvents: [
                {
                    prediction: "pathogenic",
                    score: 0.76,
                    relatedTo: [
                        {id: "rs1234", type: "compound"}
                    ]
                }
            ],
            comments: [
                {author: "imedina", type: "OBSERVATION", comment: "Comment 1", date: "15/090/2017"},
                {author: "imedina", type: "OBSERVATION", comment: "Comment 2", date: "15/090/2017"}
            ],
            additionalNumericVariantAnnotations: []
        },
        {
            id: "14:22221:A:T",
            name: "rs666",
            annotation: {
                source: "cellbase",
                version: "4.5",
                "displayConsequenceType": "upstream_variant",
                "consequenceTypes":[
                    {
                        "geneName":"TOMM40",
                        "ensemblGeneId":"ENSG00000130204",
                        "ensemblTranscriptId":"ENST00000252487",
                        "strand":"+",
                        "biotype":"protein_coding",
                        "transcriptAnnotationFlags":[
                            "CCDS",
                            "basic"
                        ],
                        "sequenceOntologyTerms":[
                            {
                                "accession":"SO:0001630",
                                "name":"upstream_variant"
                            }
                        ]
                    }
                ]
            },
            calledGenotypes: [{
                sampleId: 21,
                individualId: 5,
                genotype: "1/0",
                zigosity: "heterozygous",
                phaseSet: "phaseSet",
                depthReference: 2,
                depthAlternate: 3,
                copyNumber: 2
            }
            ],
            genotypes: [],
            comments: [{author: "", type: "", comment: "", date: ""},{author: "", type: "", comment: "", date: ""}],
            additionalNumericVariantAnnotations: []
        }
    ]
};
