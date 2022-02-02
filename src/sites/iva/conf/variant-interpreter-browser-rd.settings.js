const VARIANT_INTERPRETER_BROWSER_RD_SETTINGS = {
    menu: {
        sections: [
            {
                title: "Sample",
                // TODO file-quality: showDepth: false
                filters: ["sample-genotype", "sample", "file-quality", "variant-file-info-filter", "cohort"]
            },
            {
                title: "Genomic",
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                filters: ["diseasePanels", "clinical-annotation"]
            },
            {
                title: "Consequence Type",
                filters: ["consequence-type"]
            },
            {
                title: "Population Frequency",
                filters: ["populationFrequency"]
            },
            {
                title: "Phenotype",
                filters: ["go", "hpo"]
            },
            {
                title: "Deleteriousness",
                filters: ["proteinSubstitutionScore", "cadd"]
            },
            {
                title: "Conservation",
                filters: ["conservation"]
            }
        ]
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: true,
            showDownload: false
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        copies: [
            {
                id: "copy-epic",
                name: "Copy Epic",
                description: "Description of the Schema",
                // All the fields defined by the own user team schema. For instance:
                // KIT missense_variant in exon 17
                // HGVSc: c.2447A>T
                // HGVSp: p.(Asp816Val)
                // COSMIC ID: COSV55386424
                // dbSNP: rs121913507
                // Allele Frequency (VAF): 70.6%
                execute: variant => {
                    const annotation = variant.annotation;
                    const ct = annotation.consequenceTypes[0];
                    return `
                        ${ct.geneName} ${ct.sequenceOntologyTerms[0]?.name} in exon ${ct.exonOverlap?.[0]?.number}
                        HGVSc: ${annotation.hgvs[0]}
                        HGVSp: ${annotation.hgvs[1]}
                        COSMIC ID: ${annotation.traitAssociation.find(ta => ta.source.name === "cosmic")?.id}
                        dbSNP: ${variant.names?.find(name => name.startsWith("rs"))}
                        Allele Frequency (VAF): 70.6%
                    `;
                }
            }
        ]
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id", "gene", "type", "consequenceType", "zygosity", "evidences", "VCF_Data", "frequencies", "clinicalInfo", "interpretation", "review", "actions"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    // details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "fileMetrics", "cohortStats", "samples", "beacon"]

};
