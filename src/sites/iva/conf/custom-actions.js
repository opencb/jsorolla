const CUSTOM_ACTIONS = {

    copyEpic: {
        version: "2.4.0",
        // All the fields defined by the own user team schema. For instance:
        // KIT missense_variant in exon 17
        // HGVSc: c.2447A>T
        // HGVSp: p.(Asp816Val)
        // COSMIC ID: COSV55386424
        // dbSNP: rs121913507
        // Allele Frequency (VAF): 70.6%
        execute: (variant, showConsequenceTypes) => {
            const annotation = variant.annotation;

            const selectedEvidences = [];
            if (showConsequenceTypes) {
                for (const index of showConsequenceTypes) {
                    selectedEvidences.push(variant.evidences[index]);
                }
            } else {
                selectedEvidences.push(variant.evidences[0]);
            }

            const consequenceTypes = [];
            for (const evidence of selectedEvidences) {
                const ct = annotation.consequenceTypes.find(ct => ct.transcriptId === evidence.genomicFeature?.transcriptId);
                consequenceTypes.push(ct);
            }

            let vaf = "NA";
            const vafIndex = variant.studies?.[0]?.sampleDataKeys?.indexOf("AF");
            if (typeof vafIndex === "number" && vafIndex >= 0) {
                vaf = variant.studies[0].samples?.[0]?.data?.[vafIndex];
            } else {
                if (variant.studies[0].files?.[0]?.data.AF) {
                    vaf = variant.studies[0].files[0].data.AF;
                }
            }

            const result = [];
            for (const ct of consequenceTypes) {
                result.push(`${ct.geneName} ${ct.sequenceOntologyTerms[0]?.name} in exon ${ct.exonOverlap?.[0]?.number}`);
                result.push(`HGVSc: ${annotation.hgvs.find(hgvs => hgvs.startsWith(ct.transcriptId)) || "-"}`);
                result.push(`HGVSp: ${annotation.hgvs.find(hgvs => hgvs.startsWith(ct.proteinVariantAnnotation?.proteinId)) || "-"}`);
                result.push(`COSMIC ID: ${annotation.traitAssociation.find(ta => ta.source.name === "cosmic")?.id}`);
                result.push(`dbSNP: ${variant.names?.find(name => name.startsWith("rs"))}`);
                result.push(`Allele Frequency (VAF): ${(vaf && vaf !== ".") ? vaf : "NA"}`);
                result.push(`Comments: ${variant.comments?.length > 0 ? variant.comments.map(comment => comment.message).join(";") : ""}`);
            }
            return result.join("\n");
        }
    }
};

