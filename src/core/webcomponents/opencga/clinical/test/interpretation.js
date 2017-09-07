const interpretationJson = {
    "id": "24",
    "name": "INT-500",
    "description": "Description",

    "clinicalAnalysis": {
        "id": 23,
        "subject": {
            "id": "Subject-2212",
            "name": "Subject name",
            "sex": "male",
            "hpo": [],
            "dateOfBirth": "14/02/1994"
        },
        "family": {
            "id": "Family-1213",
            "name": "Family-name",
            "status": {"name": "family-status"},
            "creationDate": "8/10/2014"
        }     // Esto es la familia
    },

    "software": {
        "name": "vaast",
        "version": "1.2",
        "commit": "aadef1bcd14232a2aa",
        "website": "http://...",
        "params": {}
    },

    "interpreter": {
        "author": "florido",
        "email": "",
        "company": ""
    },

    "versions": [
        {"id": "cellbase", "name": "CellBase", "type": "DDBB", "version": "4.5"}
    ],

    "filters": {
        "region": "3,4:555-66666",
        "gene": "BRCA2",
        "conservation": "gerp<0.2"
    },

    "creationDate": "24/08/2017",
    "comments": [{"author": "", "type": "", "comment": "", "date": ""}],
    "attributes": {},

    "reportedVariants": [
        {
            "id": "3:10361687:T:G",
            "name": "rs123456",
            "chromosome": "22",
            "start": 3333,
            "end": 3335,
            "type": "INDEL",
            "studies": [
                {
                    "id": "",
                    "files": [],
                    "samplesData": {},
                    "stats": {}
                }
            ],
            "annotation": {
                "source": "cellbase",
                "version": "4.5",
                "populationFrequencies": [],
                "consequenceTypes": []
            },

            "calledGenotypes": [{
                "sampleId": 21,
                "individualId": 5,
                "genotype": "0/0",
                "zigosity": "heterogenious",
                "phaseSet": "phaseSet",
                "depthReference": 2,
                "depthAlternate": 3,
                "copyNumber": 2
            }
            ],
            "reportEvents": [
                {
                    "prediction": "pathogenic",
                    "score": 0.76,
                    "relatedTo": [
                        {"id": "rs1234", "type": "compound"}
                    ]
                }
            ],
            "comments": [{"author": "", "type": "", "comment": "", "date": ""}],
            "additionalNumericVariantAnnotations": []
        },
        {
            "id": "14:22221:A:T",
            "name": "rs666",
            "annotation": {
                "source": "cellbase",
                "version": "4.5",
                "genes": []
            },
            "calledGenotypes": [{
                "sampleId": 21,
                "individualId": 5,
                "genotype": "1/0",
                "zigosity": "heterogenious",
                "phaseSet": "phaseSet",
                "depthReference": 2,
                "depthAlternate": 3,
                "copyNumber": 2
            }
            ],
            "genotypes": [],
            "comments": [{"author": "", "type": "", "comment": "", "date": ""},{"author": "", "type": "", "comment": "", "date": ""}],
            "additionalNumericVariantAnnotations": []
        }
    ]
}