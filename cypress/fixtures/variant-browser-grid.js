export default {
    grid: {
        population: {
            id: "popfreq",
            text: "Population Frequencies",
            subColumnsIndex: 13,
            subColumnsItems: [
                {id: "1000G", text: "1000 Genomes"},
                {id: "GNOMAD_GENOMES", text: "gnomAD Genomes"},
                {id: "GNOMAD_EXOMES", text: "gnomAD Exomes"},
            ],
            metadata: {
                populations: ["ALL", "AFR", "AMR", "EAS", "EUR", "SAS"],
            },
        },
    },
    variants: [
        {
            id: "22:11829222:C:G",
            populations: [
                {
                    id: "1000G",
                    frequencyBoxMode: {
                        colors: ["#ff0000", "#ff8080", "#000000", "#000000", "#000000", "#000000"],
                        tooltip: {
                            altFreqText: ["0.0003123 / 2 (0.03123%)", "0.001120 / 2 (0.1120%)", "Not Observed", "Not Observed", "Not Observed", "Not Observed"],
                            genotypeHomAltFreqText: ["Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed"],
                        },
                    },
                },
                {
                    id: "GNOMAD_GENOMES",
                    frequencyBoxMode: {
                        colors: ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                        tooltip: {
                            altFreqText: ["Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed"],
                            genotypeHomAltFreqText: ["Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed"],
                        },
                    },
                },
                {
                    id: "GNOMAD_EXOMES",
                    frequencyBoxMode: {
                        colors: ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                        tooltip: {
                            altFreqText: ["Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed"],
                            genotypeHomAltFreqText: ["Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed", "Not Observed"],
                        },
                    },
                },
            ],
        }
    ],
};

