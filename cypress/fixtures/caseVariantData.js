const caseFilterVariant = {
    diseasePanel: {
        disease_panel: "Albinism or congenital nystagmus - Genomics England PanelApp v1.6 (41 genes, 0 regions)",
        feature_type: "Region",
        genes_by_moi: "X-linked Dominant",
        genes_by_confidence: "LOW",
        genes_by_roles_in_cancer: "TUMOR_SUPPRESSOR_GENE",
        panel_intersection: "ON"
    },
    clinicalAnnotation: {
        clinical_database: "ClinVar",
        clinical_significance: ["Likely benign", "Benign", "Pathogenic"],
        clinical_status: false
    },
    consequenceType: {
        coding_sequence: true,
        terms_manual: "coding_sequence_variant"
    }

};


module.exports = {
    caseFilterVariant
};
