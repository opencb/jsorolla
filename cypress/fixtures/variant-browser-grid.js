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
                    populationsColors: ["#ff0000", "#ff8080", "#000000", "#000000", "#000000", "#000000"],
                },
                {
                    id: "GNOMAD_GENOMES",
                    populationsColors: ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                },
                {
                    id: "GNOMAD_EXOMES",
                    populationsColors: ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                },
            ],
        }
    ],
};

