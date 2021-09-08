const opencgaGeneViewSettings = {
    // set to true if the server on which IVA is running is exposed to Internet (for genomemaps.org, ensembl.org).
    externalLinks: true,
    // from conf/tools.js
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
    }
};
