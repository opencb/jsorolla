// Global constants for GenomeBrowser
export default class GenomeBrowserConstants {

    // CellBase constants
    static CELLBASE_HOST = "https://ws.zettagenomics.com/cellbase";
    static CELLBASE_VERSION = "v5";

    // OpenCGA Constants
    static OPENCGA_HOST = "https://ws.opencb.org/opencga-test";
    static OPENCGA_VERSION = "v2";

    // Cytobands
    static CYTOBANDS_COLORS = {
        gneg: "white",
        stalk: "#666666",
        gvar: "#CCCCCC",
        gpos25: "silver",
        gpos33: "lightgrey",
        gpos50: "gray",
        gpos66: "dimgray",
        gpos75: "darkgray",
        gpos100: "black",
        gpos: "gray",
        acen: "blue",
    };

    // Sequence colors
    static SEQUENCE_COLORS = {
        A: "#009900",
        C: "#0000FF",
        G: "#857A00",
        T: "#aa0000",
        N: "#555555",
    };

    // Gene biotype colors
    static GENE_BIOTYPE_COLORS = {
        "3prime_overlapping_ncrna": "Orange",
        "ambiguous_orf": "SlateBlue",
        "antisense": "SteelBlue",
        "disrupted_domain": "YellowGreen",
        "IG_C_gene": "#FF7F50",
        "IG_D_gene": "#FF7F50",
        "IG_J_gene": "#FF7F50",
        "IG_V_gene": "#FF7F50",
        "lincRNA": "#8b668b",
        "miRNA": "#8b668b",
        "misc_RNA": "#8b668b",
        "Mt_rRNA": "#8b668b",
        "Mt_tRNA": "#8b668b",
        "ncrna_host": "Fuchsia",
        "nonsense_mediated_decay": "seagreen",
        "non_coding": "orangered",
        "non_stop_decay": "aqua",
        "polymorphic_pseudogene": "#666666",
        "processed_pseudogene": "#666666",
        "processed_transcript": "#0000ff",
        "protein_coding": "#a00000",
        "pseudogene": "#666666",
        "retained_intron": "goldenrod",
        "retrotransposed": "lightsalmon",
        "rRNA": "indianred",
        "sense_intronic": "#20B2AA",
        "sense_overlapping": "#20B2AA",
        "snoRNA": "#8b668b",
        "snRNA": "#8b668b",
        "transcribed_processed_pseudogene": "#666666",
        "transcribed_unprocessed_pseudogene": "#666666",
        "unitary_pseudogene": "#666666",
        "unprocessed_pseudogene": "#666666",
        // "": "orangered",
        "other": "#000000"
    };

    // Codon configuration
    static CODON_CONFIG = {
        "": {text: "", color: "transparent"},
        "R": {text: "Arg", color: "#BBBFE0"},
        "H": {text: "His", color: "#BBBFE0"},
        "K": {text: "Lys", color: "#BBBFE0"},

        "D": {text: "Asp", color: "#F8B7D3"},
        "E": {text: "Glu", color: "#F8B7D3"},

        "F": {text: "Phe", color: "#FFE75F"},
        "L": {text: "Leu", color: "#FFE75F"},
        "I": {text: "Ile", color: "#FFE75F"},
        "M": {text: "Met", color: "#FFE75F"},
        "V": {text: "Val", color: "#FFE75F"},
        "P": {text: "Pro", color: "#FFE75F"},
        "A": {text: "Ala", color: "#FFE75F"},
        "W": {text: "Trp", color: "#FFE75F"},
        "G": {text: "Gly", color: "#FFE75F"},

        "T": {text: "Thr", color: "#B3DEC0"},
        "S": {text: "Ser", color: "#B3DEC0"},
        "Y": {text: "Tyr", color: "#B3DEC0"},
        "Q": {text: "Gln", color: "#B3DEC0"},
        "N": {text: "Asn", color: "#B3DEC0"},
        "C": {text: "Cys", color: "#B3DEC0"},

        "X": {text: " X ", color: "#f0f0f0"},
        "*": {text: " * ", color: "#DDDDDD"}
    };

}
