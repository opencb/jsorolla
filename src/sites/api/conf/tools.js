// eslint-disable-next-line max-len
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
 *
 * @deprecated
 */

const cohortFileMenu = {
    id: "cohort",
    title: "Cohort Alternate Allele Stats",
    cohorts: { // organised in projects and studies
        reference_grch37: {
            "1kG_phase3": [
                {id: "ALL", name: "All"}, {id: "MXL", name: "Mexican"},
            ],
            "EXAC": [
                {id: "ALL", name: "All"},
            ],
        },
        GRCH37: {
            platinum: [
                {id: "ALL", name: "ALL"},
            ],
        },
        exomes_grch37: {
            corpasome: [
                {id: "ALL", name: "ALL"},
            ],
        },
    },
    tooltip: "Filter variants by cohort Alternate allele frequency",
};

/* MOVED in variant-browser config and in in interpretation portal */
const filterMenu = {
    searchButtonText: "Search",
    tooltip: {
        classes: "qtip-rounded qtip-shadow qtip-custom-class",
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
                    tooltip: "Only considers variants from the selected studies",
                },
                cohortFileMenu,
            ],
        },
        {
            title: "Genomic",
            collapsed: true,
            fields: [
                {
                    id: "region",
                    title: "Chromosomal Location",
                    tooltip: "Filter out variants falling outside the genomic interval(s) defined",
                },
                {
                    id: "feature",
                    title: "Feature IDs (gene, SNPs, ...)",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
                {
                    id: "diseasePanels",
                    title: "Disease Panels",
                    tooltip: "Filter out variants falling outside the genomic intervals (typically genes) defined by the panel(s) chosen",
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
                        "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene",
                    ],
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
                {
                    id: "type",
                    title: "Variant Type",
                    types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"],
                    tooltip: "Only considers variants of the selected type",
                },
            ],
        },
        {
            title: "Population Frequency",
            collapsed: true,
            fields: [
                {
                    id: "populationFrequency",
                    title: "Select Population Frequency",
                    tooltip: "",
                    showSetAll: true,
                },
            ],
        },
        {
            title: "Consequence Type",
            collapsed: true,
            fields: [
                {
                    id: "consequenceType",
                    title: "Select SO terms",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
            ],
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
                        "quantitative impact value. Polyphen scores can be Benign (<0.15), Possibly damaging (0.15-0.85) or Damaging (>0.85)",
                },
                {
                    id: "cadd",
                    title: "CADD",
                    tooltip: "Raw values have relative meaning, with higher values indicating that a variant is more likely to be " +
                        "simulated (or not observed) and therefore more likely to have deleterious effects. If discovering causal variants " +
                        "within an individual, or small groups, of exomes or genomes te use of the scaled CADD score is recommended",
                },
            ],
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
                        " Scores ≥ 2 indicate evolutionary constraint to and ≥ 3 indicate purifying selection.",
                },
            ],
        },
        {
            title: "Gene Ontology",
            collapsed: true,
            fields: [
                {
                    id: "go",
                    title: "GO Accessions (max. 100 terms)",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
            ],
        },
        {
            title: "Phenotype-Disease",
            collapsed: true,
            fields: [
                {
                    id: "hpo",
                    title: "HPO Accessions",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
                {
                    id: "clinvar",
                    title: "ClinVar Accessions",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
                {
                    id: "fullTextSearch",
                    title: "Full-text search on HPO, ClinVar, protein domains or keywords. Some OMIM and Orphanet IDs are also supported",
                    tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined",
                },
            ],
        },
    ],
};

const tools = {

};
