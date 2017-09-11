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
        subject: {
            id: 10,
            name: "NA0001",
            version: 1,
            sex: "MALE",
            karyotypicSex: "XY",
            dateOfBirth: "14/02/1994",
            lifeStatus: "ALIVE",
            parentalConsanguinity: false,
            ontologyTerms: [
                {id: "HP:0000478", name: "Abnormality of the eye", source: "HPO"}
            ],
            samples: [
                {
                    id: 113,
                    name: "sample123",
                    somatic: false,
                    ontologyTerms: [
                        {id: "HP:0000478", name: "Abnormality of the eye", source: "HPO"}
                    ]
                }
            ],
        },
        family: {
            id: 1213,
            name: "Family Name",
            status: "READY",
            creationDate: "8/10/2014",
            description: "Family description",
            diseases: [
                {id: "HP:0000478", name: "Abnormality of the eye", source: "HPO"},
                {id: "HP:0000007", name: "Autosomal recessive inheritance", source: "HPO"}
            ],
            members: [
                {
                    id: 10,
                    name: "NA0001",
                    version: 1,
                    sex: "MALE",
                    karyotypicSex: "XY",
                    dateOfBirth: "14/02/1994",
                    lifeStatus: "ALIVE",
                    parentalConsaguinity: false,

                    father: {"id": 11, "name": "pepe", "version": 1, "samples": [{"id": 111, "name": "s1"}]},
                    mother: {"id": 12, "name": "mari", "version": 1, "samples": [{"id": 112, "name": "s2"}]},
                    samples: [{"id": 113, "name": "s3"}],
                    multiples: {type: "mellizo", siblings: ["pepe"]},

                    diseases: ["HP:001233"],
                    carrier: ["OMIM:056789"],
                }
            ],
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
            id: "3:10361687:T:G",
            name: "rs123456",
            chromosome: "22",
            start: 3333,
            end: 3335,
            type: "INDEL",
            studies: [
                {
                    id: "",
                    files: [],
                    samplesData: {},
                    stats: {}
                }
            ],
            annotation: {
                source: "cellbase",
                version: "4.5",
                populationFrequencies: [],
                consequenceTypes: []
            },

            calledGenotypes: [{
                sampleId: 21,
                individualId: 5,
                genotype: "0/0",
                zigosity: "heterogenious",
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
            comments: [{author: "", type: "", comment: "", date: ""}],
            additionalNumericVariantAnnotations: []
        },
        {
            id: "14:22221:A:T",
            name: "rs666",
            annotation: {
                source: "cellbase",
                version: "4.5",
                genes: []
            },
            calledGenotypes: [{
                sampleId: 21,
                individualId: 5,
                genotype: "1/0",
                zigosity: "heterogenious",
                phaseSet: "phaseSet",
                depthReference: 2,
                depthAlternate: 3,
                copyNumber: 2
            }
            ],
            genotypes: [],
            comments: [{author: "", type: "", comment: "", date: ""},{author: "", type: "", comment: "", date: ""}],
            additionalNumericVariantAnnotations: []
        },
        {
            id: "14:22221:A:T",
            name: "rs666",
            annotation: {
                source: "cellbase",
                version: "4.5",
                genes: []
            },
            calledGenotypes: [{
                sampleId: 21,
                individualId: 5,
                genotype: "1/0",
                zigosity: "heterogenious",
                phaseSet: "phaseSet",
                depthReference: 2,
                depthAlternate: 3,
                copyNumber: 2
            }
            ],
            genotypes: [],
            comments: [{author: "", type: "", comment: "", date: ""},{author: "", type: "", comment: "", date: ""}],
            additionalNumericVariantAnnotations: []
        },
        {
            id: "14:22221:A:T",
            name: "rs666",
            annotation: {
                source: "cellbase",
                version: "4.5",
                genes: []
            },
            calledGenotypes: [{
                sampleId: 21,
                individualId: 5,
                genotype: "1/0",
                zigosity: "heterogenious",
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
