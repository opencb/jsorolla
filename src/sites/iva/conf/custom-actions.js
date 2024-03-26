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

const comparators = {
    "=": (a, b) => a === b,
    "==": (a, b) => a === b,
    "!=": (a, b) => a !== b,
    ">": (a, b) => a > b,
    ">=": (a, b) => a >= b,
    "<": (a, b) => a < b,
    "<=": (a, b) => a <= b,
};

const CUSTOM_ACTIONS = {
    highlightVariant: {
        version: "2.4.0",
        permission: "admin",
        execute: (variant, highlight) => {
            if (highlight?.filters?.length > 0) {
                const FILTER_REGEX = /(?<param>([a-zA-z0-9_]+))(?<op>[=<>]+)(?<value>([a-zA-z0-9_/]+))/;
                let pass = true;
                for (const filter of highlight.filters) {
                    const match = filter.match(FILTER_REGEX);
                    let value = null;
                    switch (match.groups.param) {
                        // INFO String filters
                        case "FILTER":
                            value = variant.studies[0].files[0]?.data[match.groups.param];
                            break;
                        // INFO Numeric filters
                        case "QUAL":
                        case "MQ":
                            value = Number(variant.studies[0].files[0]?.data[match.groups.param]);
                            break;
                        // FORMAT String filters
                        case "GT":
                            const index = variant.studies[0]?.sampleDataKeys?.findIndex(key => key === match.groups.param);
                            if (index > -1) {
                                value = variant.studies[0].samples[0]?.data[index];
                            }
                            break;
                        // FORMAT Numeric filters
                        case "GQ":
                        case "GQX":
                        case "DP":
                            const dpIndex = variant.studies[0]?.sampleDataKeys?.findIndex(key => key === match.groups.param);
                            if (dpIndex > -1) {
                                value = Number(variant.studies[0].samples[0]?.data[dpIndex]);
                            }
                            break;
                    }

                    // Process value and pass. Value==0 are allowed for numeric values.
                    if (value === 0 || value) {
                        pass &&= comparators[match.groups.op](value, match.groups.value);
                    } else {
                        pass &&= false;
                        break;
                    }
                }
                return pass;
            } else {
                return false;
            }
        },
    },
    copyEpic: {
        version: "2.4.0",
        permission: "admin",
        // All the fields defined by the own user team schema. For instance:
        // KIT missense_variant in exon 17
        // HGVSc: c.2447A>T
        // HGVSp: p.(Asp816Val)
        // COSMIC ID: COSV55386424
        // dbSNP: rs121913507
        // Allele Frequency (VAF): 70.6%
        execute: (variant, showConsequenceTypes, copy) => {
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

