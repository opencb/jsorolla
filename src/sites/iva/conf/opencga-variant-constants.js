/**
 * Copyright 2015-2019 OpenCB
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


// export const biotypes = VARIANT_CONSTANTS.biotypes;
const CHROMOSOMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"];

const BIOTYPES = [
    "3prime_overlapping_ncrna", "IG_C_gene", "IG_C_pseudogene", "IG_D_gene", "IG_J_gene", "IG_J_pseudogene",
    "IG_V_gene", "IG_V_pseudogene", "Mt_rRNA", "Mt_tRNA", "TR_C_gene", "TR_D_gene", "TR_J_gene", "TR_J_pseudogene",
    "TR_V_gene", "TR_V_pseudogene", "antisense", "lincRNA", "miRNA", "misc_RNA", "non_stop_decay",
    "nonsense_mediated_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript",
    "protein_coding", "pseudogene", "rRNA", "retained_intron", "sense_intronic", "sense_overlapping", "snRNA",
    "snoRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene",
    "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"
];

const VARIANT_TYPES = ["SNV", "INDEL", "COPY_NUMBER", "INSERTION", "DELETION", "DUPLICATION", "MNV", "SV"];

const CLINICAL_SIGNIFICANCE = [
    {
        id: "benign", name: "Benign"
    },
    {
        id: "likely_benign", name: "Likely benign"
    },
    {
        id: "uncertain_significance", name: "Uncertain significance"
    },
    {
        id: "likely_pathogenic", name: "Likely pathogenic"
    },
    {
        id: "pathogenic", name: "Pathogenic"
    }
];

const MODE_OF_INHERITANCE = ["AUTOSOMAL_DOMINANT", "AUTOSOMAL_RECESSIVE", "X_LINKED_DOMINANT", "X_LINKED_RECESSIVE", "Y_LINKED", "MITOCHONDRIAL"];

const ROLE_IN_CANCER = ["ONCOGENE", "TUMOR_SUPPRESSOR_GENE", "FUSION"];

const DISEASE_PANEL_CONFIDENCE = ["HIGH", "MEDIUM", "LOW", "REJECTED"];

const CONSEQUENCE_TYPES = {
    style: {
        // This is the impact color. It allows to customise both the impact categories and desired colors
        high: "red",
        moderate: "darkorange",
        low: "blue",
        modifier: "green"
    },

    // Loss-of-function SO terms
    lof: ["frameshift_variant", "incomplete_terminal_codon_variant", "start_lost", "stop_gained", "stop_lost", "splice_acceptor_variant",
        "splice_donor_variant", "feature_truncation", "transcript_ablation"],

    pa: ["frameshift_variant", "incomplete_terminal_codon_variant", "start_lost", "stop_gained", "stop_lost", "splice_acceptor_variant",
        "splice_donor_variant", "feature_truncation", "transcript_ablation", "inframe_deletion", "inframe_insertion", "missense_variant"],

    // This is filled below from the 'categories' array
    impact: {},

    // 'Title' is optional. if there is not title provided then 'name' will be used.
    //  There are two more optional properties - 'checked' and 'impact'. They can be set to display them default in web application.
    //  Similarly 'description' is optional as well.
    categories: [
        {
            title: "Intergenic",
            terms: [
                {
                    id: "SO:0001631",
                    name: "upstream_gene_variant",
                    description: "A sequence variant located 5' of a gene",
                    impact: "modifier"
                },
                {
                    id: "SO:0001636",
                    name: "2KB_upstream_variant",
                    description: "A sequence variant located within 2KB 5' of a gene",
                    impact: "modifier"
                },
                {
                    id: "SO:0001632",
                    name: "downstream_gene_variant",
                    description: "A sequence variant located 3' of a gene",
                    impact: "modifier"
                },
                {
                    id: "SO:0002083",
                    name: "2KB_downstream_variant",
                    description: "A sequence variant located within 2KB 3' of a gene",
                    impact: "modifier"
                },
                {
                    id: "SO:0001628",
                    name: "intergenic_variant",
                    description: "A sequence variant located in the intergenic region, between genes",
                    impact: "modifier"
                }
            ]
        },
        {
            title: "Regulatory",
            terms: [
                {
                    id: "SO:0001620",
                    name: "mature_miRNA_variant",
                    description: "A transcript variant located with the sequence of the mature miRNA",
                    impact: "modifier"
                },
                // {
                //     id: "SO:0001894",
                //     name: "regulatory_region_ablation",
                //     description: "A feature ablation whereby the deleted region includes a regulatory region",
                //     impact: "moderate",
                // },
                // {
                //     id: "SO:0001891",
                //     name: "regulatory_region_amplification",
                //     description: "A feature amplification of a region containing a regulatory region",
                //     impact: "modifier",
                // },
                {
                    id: "SO:0001566",
                    name: "regulatory_region_variant",
                    description: "A sequence variant located within a regulatory region",
                    impact: "modifier"
                },
                {
                    id: "SO:0001782",
                    name: "TF_binding_site_variant",
                    description: "A sequence variant located within a transcription factor binding site",
                    impact: "modifier"
                }
                // {
                //     id: "SO:0001895",
                //     name: "TFBS_ablation",
                //     description: "A feature ablation whereby the deleted region includes a transcription factor binding site",
                //     impact: "modifier",
                // },
                // {
                //     id: "SO:0001892",
                //     name: "TFBS_amplification",
                //     description: "A feature amplification of a region containing a transcription factor binding site",
                //     impact: "modifier",
                // },
            ]
        },
        {
            title: "Coding",
            terms: [
                {
                    id: "SO:0001580",
                    name: "coding_sequence_variant",
                    description: "A sequence variant that changes the coding sequence",
                    impact: "modifier"
                },
                // {
                //     id: "SO:0001907",
                //     name: "feature_elongation",
                //     description: "A sequence variant that causes the extension of a genomic feature, with regard to the reference sequence",
                //     impact: "modifier",
                // },
                {
                    id: "SO:0001906",
                    name: "feature_truncation",
                    description: "A sequence variant that causes the reduction of a genomic feature, with regard to the reference sequence",
                    impact: "modifier"
                },
                {
                    id: "SO:0001589",
                    name: "frameshift_variant",
                    description: "A sequence variant which causes a disruption of the translational reading frame, because the number of nucleotides inserted or deleted is not a multiple of three",
                    impact: "high"
                },
                {
                    id: "SO:0001626",
                    name: "incomplete_terminal_codon_variant",
                    description: "A sequence variant where at least one base of the final codon of an incompletely annotated transcript is changed",
                    impact: "low"
                },
                {
                    id: "SO:0001822",
                    name: "inframe_deletion",
                    description: "An inframe non synonymous variant that deletes bases from the coding sequence",
                    impact: "high"
                },
                {
                    id: "SO:0001821",
                    name: "inframe_insertion",
                    description: "An inframe non synonymous variant that inserts bases into in the coding sequence",
                    impact: "high"
                },
                {
                    id: "SO:0001650",
                    name: "inframe_variant",
                    description: "A sequence variant which does not cause a disruption of the translational reading frame",
                    impact: "low"
                },
                {
                    id: "SO:0001582",
                    name: "initiator_codon_variant",
                    description: "A codon variant that changes at least one base of the first codon of a transcript",
                    impact: "moderate"
                },
                {
                    id: "SO:0001583",
                    name: "missense_variant",
                    description: "A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved",
                    impact: "moderate"
                },
                {
                    id: "SO:0001621",
                    name: "NMD_transcript_variant",
                    description: "A variant in a transcript that is the target of NMD",
                    impact: "modifier"
                },
                // {
                //     id: "SO:0001818",
                //     name: "protein_altering_variant",
                //     description: "A sequence_variant which is predicted to change the protein encoded in the coding sequence",
                //     impact: "moderate",
                // },
                {
                    id: "SO:0001819",
                    name: "synonymous_variant",
                    description: "A sequence variant where there is no resulting change to the encoded amino acid",
                    impact: "low"
                },
                {
                    id: "SO:0002012",
                    name: "start_lost",
                    description: "A codon variant that changes at least one base of the canonical start codon",
                    impact: "high"
                },
                {
                    id: "SO:0001587",
                    name: "stop_gained",
                    description: "A sequence variant whereby at least one base of a codon is changed, resulting in a premature stop codon, leading to a shortened transcript",
                    impact: "high"
                },
                {
                    id: "SO:0001578",
                    name: "stop_lost",
                    description: "A sequence variant where at least one base of the terminator codon (stop) is changed, resulting in an elongated transcript",
                    impact: "high"
                },
                {
                    id: "SO:0001567",
                    name: "stop_retained_variant",
                    description: "A sequence variant where at least one base in the terminator codon is changed, but the terminator remains",
                    impact: "low"
                },
                {
                    id: "SO:0001590",
                    name: "terminator_codon_variant",
                    description: "A sequence variant whereby at least one of the bases in the terminator codon is changed",
                    impact: "low"
                }
            ]
        },
        {
            title: "Non-coding",
            terms: [
                {
                    id: "SO:0001624",
                    name: "3_prime_UTR_variant",
                    description: "A UTR variant of the 3' UTR",
                    impact: "modifier"
                },
                {
                    id: "SO:0001623",
                    name: "5_prime_UTR_variant",
                    description: "A UTR variant of the 5' UTR",
                    impact: "modifier"
                },
                {
                    id: "SO:0001627",
                    name: "intron_variant",
                    description: "A transcript variant occurring within an intron",
                    impact: "modifier"
                },
                {
                    id: "SO:0001792",
                    name: "non_coding_transcript_exon_variant",
                    description: "A sequence variant that changes non-coding exon sequence in a non-coding transcript",
                    impact: "modifier"
                },
                {
                    id: "SO:0001619",
                    name: "non_coding_transcript_variant",
                    description: "A transcript variant of a non coding RNA gene",
                    impact: "modifier"
                }
            ]
        },
        {
            title: "Splice",
            terms: [
                {
                    id: "SO:0001574",
                    name: "splice_acceptor_variant",
                    description: "A splice variant that changes the 2 base region at the 3' end of an intron",
                    impact: "high"
                },
                {
                    id: "SO:0001575",
                    name: "splice_donor_variant",
                    description: "A splice variant that changes the 2 base pair region at the 5' end of an intron",
                    impact: "high"
                },
                {
                    id: "SO:0001630",
                    name: "splice_region_variant",
                    description: "A sequence variant in which a change has occurred within the region of the splice site, either " +
                        "within 1-3 bases of the exon or 3-8 bases of the intron",
                    impact: "low"
                }
            ]
        },
        {
            id: "SO:0001893",
            name: "transcript_ablation",
            description: "A feature ablation whereby the deleted region includes a transcript feature",
            impact: "high"
        },
        {
            id: "SO:0001889",
            name: "transcript_amplification",
            description: "A feature amplification of a region containing a transcript",
            impact: "high"
        }
    ]
};

// Fill 'consequenceTypes.impact' from the consequenceTypes.categories
for (const category of CONSEQUENCE_TYPES.categories) {
    if (category.terms) {
        category.terms.forEach(term => CONSEQUENCE_TYPES.impact[term.name] = term.impact);
    } else {
        CONSEQUENCE_TYPES.impact[category.name] = category.impact;
    }
}

const populationFrequencies = {
    style: {
        // This is based on this figure:
        // http://www.dialogues-cns.com/wp-content/uploads/2015/03/DialoguesClinNeurosci-17-69-g001.jpg
        veryRare: "#ff0000",
        rare: "#ff8080",
        average: "#8080ff",
        common: "#0000ff",
        unobserved: "black"
    },
    studies: [
        {
            id: "1kG_phase3",
            title: "1000 Genomes",
            // tooltip: "Only considers variants whose observed allelic frequency in the 1000 genomes phase 3 database is below (or above) " +
            //     "the defined value. Genome-wide allelic frequencies were obtained from more than 2.500 genomes.",
            populations: [
                {
                    id: "ALL", title: "All populations [ALL]"
                },
                {
                    id: "AFR", title: "African [AFR]"
                },
                {
                    id: "AMR", title: "American [AMR]"
                },
                {
                    id: "EAS", title: "East Asian [EAS]"
                },
                {
                    id: "EUR", title: "European [EUR]"
                },
                {
                    id: "SAS", title: "South Asian [SAS]"
                }
            ]
        },
        {
            id: "GNOMAD_GENOMES",
            title: "gnomAD Genomes",
            // tooltip: "Only considers variants whose observed allelic frequency in the gnomAD Genomes database is below (or above) the " +
            //     "defined value. Frequencies were calculated from about 15,000 unrelated individuals.",
            populations: [
                {
                    id: "ALL", title: "gnomAD [ALL]"
                },
                {
                    id: "AFR", title: "African/African American [AFR]"
                },
                {
                    id: "AMR", title: "American [AMR]"
                },
                {
                    id: "EAS", title: "East Asian [EAS]"
                },
                {
                    id: "FIN", title: "Finnish[FIN]"
                },
                {
                    id: "NFE", title: "Non-Finnish European [NFE]"
                }
                // {
                //     id: "SAS", title: "South Asian [SAS]"
                // }
            ]
        }
    ]
};

const tooltips = {
    conservation: "<strong>PhyloP</strong> scores measure evolutionary conservation at individual alignment sites. The scores " +
        "are interpreted as follows compared to the evolution expected under neutral drift: positive scores (max 3.0) mean " +
        "conserved positions and negative scores (min -14.0) indicate positive selection. PhyloP scores are useful to " +
        "evaluate signatures of selection at particular nucleotides or classes of nucleotides (e.g., third codon positions, " +
        "or first positions of miRNA target sites).<br>" +
        "<strong>PhastCons</strong> estimates the probability that each nucleotide belongs to a conserved element, based on " +
        "the multiple alignment. The phastCons scores represent probabilities of negative selection and range between 0 " +
        "(non-conserved) and 1 (highly conserved).<br>" +
        "<strong>Genomic Evolutionary Rate Profiling (GERP)</strong> score estimate the level of conservation of positions." +
        " Scores ≥ 2 indicate evolutionary constraint to and ≥ 3 indicate purifying selection.",
    populationFrequencies: `<strong>1000 Genomes</strong> Only considers variants whose observed allelic frequency in the 1000 genomes phase 3 database 
                is below (or above) the defined value. Genome-wide allelic frequencies were obtained from more than 2.500 genomes.<br><br>
              <strong>gnomAD Genomes</strong> Only considers variants whose observed allelic frequency in the gnomAD Genomes database is 
                below (or above) the defined value. Frequencies were calculated from about 15,000 unrelated individuals`,
    proteinSubstitutionScore: "<strong>SIFT score:</strong> Choose either a Tolerated/Deleterious qualitative score or provide below a " +
            "quantitative impact value. SIFT scores <0.05 are considered deleterious. " +
            "<strong>Polyphen:</strong> Choose, either a Benign/probably damaging qualitative score or provide below a " +
            "quantitative impact value. Polyphen scores can be Benign (<0.15), Possibly damaging (0.15-0.85) or Damaging (>0.85)",
    study: "Only considers variants from the selected studies",
    region: "Filter out variants falling outside the genomic interval(s) defined",
    feature: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    diseasePanels: "Filter out variants falling outside the genomic intervals (typically genes) defined by the panel(s) chosen",
    biotype: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    type: "Only considers variants of the selected type",
    consequenceTypeSelect: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    go: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    hpo: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    clinvar: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    fullTextSearch: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
    cadd: "Raw values have relative meaning, with higher values indicating that a variant is more likely to be " +
        "simulated (or not observed) and therefore more likely to have deleterious effects. If discovering causal variants " +
        "within an individual, or small groups, of exomes or genomes te use of the scaled CADD score is recommended",
    cohort: "Filter variants by the cohort alternate allele frequency",
    sample: "Filter variants by sample genotypes or mode of inheritance (Compounf Het., de Novo, ...)"
};

const beacon = {
    hosts: [
        "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience",
        "ucsc", "lovd", "hgmd", "icgc", "sahgp"
    ]
};

const PROTEIN_SUBSTITUTION_SCORE = {
    style: {
        // This is to show the predictions in respective colors
        sift: {
            deleterious: "red",
            tolerated: "green"
        },
        polyphen: {
            "probably damaging": "red",
            "possibly damaging": "darkorange",
            "benign": "green",
            "unknown": "black"
        }
    }
};

