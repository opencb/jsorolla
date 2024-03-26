/*
 * Copyright 2015-2024 OpenCB
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

// Global constants for GenomeBrowser
export default class GenomeBrowserConstants {

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

    // SNP Biotype colors configuration
    static SNP_BIOTYPE_COLORS = {
        "2KB_upstream_variant": "#a2b5cd",
        "5KB_upstream_variant": "#a2b5cd",
        "500B_downstream_variant": "#a2b5cd",
        "5KB_downstream_variant": "#a2b5cd",
        "3_prime_UTR_variant": "#7ac5cd",
        "5_prime_UTR_variant": "#7ac5cd",
        "coding_sequence_variant": "#458b00",
        "complex_change_in_transcript": "#00fa9a",
        "frameshift_variant": "#ff69b4",
        "incomplete_terminal_codon_variant": "#ff00ff",
        "inframe_codon_gain": "#ffd700",
        "inframe_codon_loss": "#ffd700",
        "initiator_codon_change": "#ffd700",
        "non_synonymous_codon": "#ffd700",
        "missense_variant": "#ffd700",
        "intergenic_variant": "#636363",
        "intron_variant": "#02599c",
        "mature_miRNA_variant": "#458b00",
        "nc_transcript_variant": "#32cd32",
        "splice_acceptor_variant": "#ff7f50",
        "splice_donor_variant": "#ff7f50",
        "splice_region_variant": "#ff7f50",
        "stop_gained": "#ff0000",
        "stop_lost": "#ff0000",
        "stop_retained_variant": "#76ee00",
        "synonymous_codon": "#76ee00",
        "other": "#000000"
    };

    // Genotypes colors
    static GENOTYPES_COLORS = {
        "heterozygous": "darkorange",
        "homozygous": "red",
        "reference": "gray",
        "others": "black",
    };

    // Alignments colors
    static ALIGNMENTS_COLORS = {
        "default": "#6c757d",
        "possible_deletion": "#dc3545",
        "possible_insertion": "#0d6efd",
        "translocation": "#fd7e14",
        "not_paired": "#140330", // "#2c0b0e",
    };

}
