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

import UtilsNew from "../core/utils-new.js";
import {SVG} from "../core/svg.js";
import VariantInterpreterGridFormatter from "../webcomponents/variant/interpretation/variant-interpreter-grid-formatter.js";
import GenomeBrowserConstants from "./genome-browser-constants.js";

export default class GenomeBrowserUtils {

    //
    // CellBase utils
    //

    // Get species from CellBase
    static getSpeciesFromCellBase = cellBaseClient => {
        return cellBaseClient.getMeta("species").then(response => {
            const taxonomies = response.response[0].result[0];

            // Generate one specie for each assembly
            Object.keys(taxonomies).forEach(name => {
                const newSpecies = [];
                taxonomies[name].forEach(species => {
                    species.assemblies.forEach(assembly => {
                        const clonedSpecies = UtilsNew.objectClone(species);
                        delete clonedSpecies.assemblies;
                        clonedSpecies.assembly = assembly;
                        newSpecies.push(clonedSpecies);
                    });
                });

                taxonomies[name] = newSpecies;
            });

            return taxonomies;
        });
    }

    //
    // Common utils
    //

    // Clean an element
    static cleanDOMElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Sort chromosomes
    static sortChromosomes(chromosomes) {
        return chromosomes.sort((a, b) => {
            let isNumber = true;
            for (let i = 0; i < a.name.length && isNumber; i++) {
                isNumber = !isNaN(a.name[i]);
            }

            return !isNumber ? 1 : a.name - b.name;
        });
    }

    //
    // Renderer utils
    //

    // Returns svg feature x value from feature genomic position
    static getFeatureX(start, options) {
        const middle = options.width / 2;
        return options.pixelPosition + middle - ((options.position - start) * options.pixelBase);
    }

    // TODO: check if we need to insert the element to calculate the width
    // eslint-disable-next-line no-unused-vars
    static getLabelWidth(label, track) {
        // insert in dom to get the label width and then remove it
        const svgLabel = SVG.create("text", {
            "font-weight": 400,
            "class": "ocb-font-roboto ocb-font-size-11",
        });
        svgLabel.textContent = label;
        // $(track.svgCanvasFeatures).append(svgLabel);
        // let svgLabelWidth = $(svgLabel).width();
        // $(svgLabel).remove();
        return parseFloat(getComputedStyle(svgLabel, null).width.replace("px", "")) || 0;
    }

    // Generic title formatter
    static titleFormatter(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/gi, "") : "";
    }

    // Variant genotype color formatter
    static genotypeColorFormatter(value) {
        switch (value) {
            case "0|0":
            case "0/0":
                return GenomeBrowserConstants.GENOTYPES_COLORS["reference"];
            case "0|1":
            case "0/1":
            case "1|0":
            case "1/0":
                return GenomeBrowserConstants.GENOTYPES_COLORS["heterozygous"];
            case "1|1":
            case "1/1":
                return GenomeBrowserConstants.GENOTYPES_COLORS["homozygous"];
            // case ".|.":
            // case "./.":
            //     return GenomeBrowserConstants.GENOTYPES_COLORS["reference"];
        }
        // Other genotype
        return GenomeBrowserConstants.GENOTYPES_COLORS["others"];
    }

    // Get individual sex icon
    static getIndividualSexIcon(value) {
        switch (value.toUpperCase()) {
            case "MALE":
                return "fa-mars";
            case "FEMALE":
                return "fa-venus";
            default:
                return "fa-genderless";
        }
    }

    // Get individual sex color
    static getIndividualSexColor() {
        return "#333333";
    }

    //
    // Feature utils
    //

    // Common label formatter
    static featureLabelFormatter(feature) {
        return [feature.id, feature.name].filter(f => !!f).join(" - ");
    }

    // Feature position formatter
    static featurePositionFormatter(feature) {
        return `${feature.chromosome}:${feature.start}-${feature.end}`;
    }

    // Feature info formatter
    static featureInfoFormatter(feature) {
        const strand = feature.strand || "NA";
        const length = (feature.end - feature.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

        return `
            <div>Start - End: <strong>${feature.start}-${feature.end} (${strand})</strong></div>
            <div>Length: <strong style="color:#005fdb">${length}</strong></div>
        `;
    }

    // Feature tooltip title formatter
    static featureTooltipTitleFormatter(feature) {
        return [feature.featureType, feature.id, feature.name].filter(f => !!f).join(" - ");
    }

    // Feature tooltip text formatter
    static featureTooltipTextFormatter(feature) {
        const otherFeatureInfo = Object.keys(feature).map(key => {
            // Check for common feature keys
            if (key === "start" || key === "end" || key === "id" || key === "name" || key === "length") {
                return "";
            }
            // Check for object value or empty studies array--> ignore this value
            if (typeof feature[key] === "object" && (key !== "studies" || !feature[key].length)) {
                return "";
            }
            // Check for studies key --> join studies IDs
            const value = key === "studies" ? feature[key].map(s => s.studyId || "-").join(", ") : feature[key];
            return `
                <div>
                    <span style="text-transform:capitalize">${key}</span>: <strong>${value}</strong>
                </div>
            `;
        });
        return `
            ${GenomeBrowserUtils.featureInfoFormatter(feature)}
            ${otherFeatureInfo.join("")}
        `;
    }

    //
    // Variant utils
    //

    static variantColorFormatter(feature) {
        if (feature?.annotation?.displayConsequenceType) {
            return GenomeBrowserConstants.SNP_BIOTYPE_COLORS[feature.annotation.displayConsequenceType] || "#8BC34A";
        }
        return "#8BC34A";
    }

    // Variant label formatter
    static variantLabelFormatter(feature) {
        return GenomeBrowserUtils.featureLabelFormatter(feature);
    }

    // Variant tooltip title formatter
    static variantTooltipTitleFormatter(feature) {
        return GenomeBrowserUtils.featureTooltipTitleFormatter(feature);
    }

    // Variant tooltip text formatter
    static variantTooltipTextFormatter(feature, samples) {
        let info = GenomeBrowserUtils.featureTooltipTextFormatter(feature);

        // Check for samples
        if (samples && samples.length > 0 && feature.studies && feature.studies.length > 0) {
            const dpIndex = feature.studies[0].sampleDataKeys?.findIndex(v => v.toUpperCase() === "DP");
            const samplesInfo = `
                <div style="margin-bottom:4px;margin-top:4px;">Samples:</div>
                <table style="width:100%;">
                    <thead class="table-light">
                        <tr>
                            <th style=""></th>
                            <th style="padding-left:4px;">GT</th>
                            <th style="padding-left:4px;">DP</th>
                            <th style="padding-left:4px;">FILTER</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${samples.map((name, index) => {
                            const sample = feature.studies[0].samples?.[index];
                            const file = typeof sample?.fileIndex === "number" ? feature.studies[0].files?.[sample.fileIndex] : null;
                            return `
                                <tr>
                                    <td style=""><strong>${name}</strong></td>
                                    <td style="padding-left:4px;text-align:center;">${sample?.data?.[0] || "-"}</td>
                                    <td style="padding-left:4px;text-align:center;">${sample?.data?.[dpIndex] || "-"}</td>
                                    <td style="padding-left:4px;text-align:center;">${file ? file?.data?.["FILTER"] : "-"}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            `;
            info = info + samplesInfo;
        }

        return info;
    }

    // Sample genotype tooltip title formatter
    static sampleGenotypeTooltipTitleFormatter() {
        return "";
    }

    // Sample genotype tooltip text formatter
    static sampleGenotypeTooltipTextFormatter(feature, sample) {
        let file = null;
        if (typeof sample.fileIndex === "number") {
            file = feature.studies[0].files[sample.fileIndex];
        }

        return VariantInterpreterGridFormatter._getSampleGenotypeTooltipText(feature, sample, file);
    }

    //
    // Gene utils
    //

    // Gene color formatter
    static geneColorFormatter(gene) {
        return GenomeBrowserConstants.GENE_BIOTYPE_COLORS[gene.biotype];
    }

    // Gene label formatter
    static geneLabelFormatter(gene) {
        const name = gene.name || gene.id || "NA";
        const leftStrand = gene.strand && (gene.strand < 0 || gene.strand === "-") ? "<" : "";
        const rightStrand = gene.strand && (gene.strand > 0 || gene.strand === "+") ? ">" : "";
        const biotype = gene.biotype ? "[" + gene.biotype + "]" : "";

        return `${leftStrand} ${name} ${rightStrand} ${biotype}`;
    }

    // Gene tooltip title formatter
    static geneTooltipTitleFormatter(gene) {
        return `Gene - <span>${gene.name || gene.id}</span>`;
    }

    // Gene tooltip text formatter
    static geneTooltipTextFormatter(gene) {
        const color = GenomeBrowserUtils.geneColorFormatter(gene);

        return `
            <div>ID: <span class="ssel">${gene.id || ""}</span></div>
            <div>Biotype: <span class="emph" style="color:${color};">${gene.biotype}</span></div>
            ${GenomeBrowserUtils.featureInfoFormatter(gene)}
            <div>Source: <span class="ssel">${gene.source || "-"}</span></div>
            <div>Description: <span class="emph">${gene.description || "-"}</span></div>
        `;
    }

    //
    // Transcript utils
    //

    // Transcript title formatter
    static transcriptTooltipTitleFormatter(transcript) {
        return `Transcript - <span>${transcript.name || transcript.id}</span>`;
    }

    //
    // Exon utils
    //

    // Exon label formatter
    static exonLabelFormatter(exon) {
        return exon.name || exon.id;
    }

    // Exon tooltip title formatter
    static exonTooltipTitleFormatter(exon) {
        return `Exon - <span>${exon.name || exon.id}</span>`;
    }

    // Exon tooltip text formatter
    static exonTooltipTextFormatter(exon, transcript) {
        // return FEATURE_TYPES.getTipCommons(e) + FEATURE_TYPES._getSimpleKeys(e);
        const color = GenomeBrowserConstants.GENE_BIOTYPE_COLORS[transcript.biotype];
        const exonInfo = GenomeBrowserUtils.featureTooltipTextFormatter(exon);
        const transcriptInfo = GenomeBrowserUtils.featureInfoFormatter(transcript);

        return `
            <div>Transcript:</div>
            <div style="padding-left:12px">
                <div>ID: <span class="ssel">${transcript.id}</span></div>
                <div>Biotype: <span class="emph" style="color:${color};">${transcript.biotype}</span></div>
                <div>Description: <span class="emph">${transcript.description || "-"}</span></div>
                ${transcriptInfo}
            </div>
            <div>Exon:</div>
            <div style="padding-left:12px">
                ${exonInfo}
            </div>
        `;
    }

    //
    // Lollipops utils
    //

    // Lollipop shape formatter
    static lollipopShapeFormatter(feature, parent, x, y, width, color) {
        const type = feature.type || "";
        const half = width / 2;
        switch (type.toUpperCase()) {
            case "SNV":
                return SVG.addChild(parent, "circle", {
                    "data-cy": "gb-variant-lollipop-shape",
                    "data-shape": "circle",
                    "cx": x,
                    "cy": y,
                    "r": half,
                    "fill": color,
                });
            case "INDEL":
                return SVG.addChild(parent, "path", {
                    "data-cy": "gb-variant-lollipop-shape",
                    "data-shape": "triangle",
                    "d": `M${x},${y+half} L${x-half},${y-half} L${x+half},${y-half} Z`,
                    "fill": color,
                    "stroke-width": "0px",
                });
            default:
                return SVG.addChild(parent, "path", {
                    "data-cy": "gb-variant-lollipop-shape",
                    "data-shape": "square",
                    "d": `M${x},${y-half} L${x-half},${y} L${x},${y+half} L${x+half},${y} Z`,
                    "fill": color,
                    "stroke-width": "0px",
                });
        }
    }

    // Lollipop width
    static lollipopWidthFormatter(feature) {
        if (feature.studies) {
            // We will get only the first study in this list
            if (feature.studies[0]?.stats) {
                // Get only the stat item with the cohortId === "ALL"
                const item = feature.studies[0].stats.find(stat => stat.cohortId === "ALL");
                if (item) {
                    return item.altAlleleFreq || 0;
                }
            }
        }
        return 0;
    }

    //
    // Alignments utils
    //

    // Alignment strand parser
    static alignmentStrandParser(feature) {
        return feature.alignment.position.strand === "POS_STRAND" ? "Forward" : "Reverse";
    }

    // Alignments flags parser
    static alignmentFlagsParser(feature) {
        const flags = [];
        if (feature.numberReads > 1) {
            flags.push("read paired");
        }
        if (!feature.improperPlacement) {
            flags.push("read mapped in proper pair");
        }
        if (!feature.nextMatePosition) {
            flags.push("mate unmapped");
        }
        if (feature.readNumber === 0) {
            flags.push("first in pair");
        }
        if (feature.readNumber === (feature.numberReads - 1)) {
            flags.push("second in pair");
        }
        if (feature.secondaryAlignment) {
            flags.push("not primary alignment");
        }
        if (feature.failedVendorQualityChecks) {
            flags.push("read fails platform/vendor quality checks");
        }
        if (feature.duplicateFragment) {
            flags.push("read is PCR or optical duplicate");
        }

        return flags;
    }

    // Alignment flag formatter
    static alignmentFlagFormatter(flag) {
        const flagStyle = "white-space:nowrap;margin-right:4px;margin-bottom:2px;background-color:#cfe2ff;padding:2px 4px;border-radius:4px;";
        return `
            <div data-cy="gb-alignment-tooltip-flag" style="${flagStyle}">
                <b>${flag.replace(/\s/g, "_")}</b>
            </div>
        `;
    }

    // Alignment tooltip title formatter
    static alignmentTooltipTitleFormatter(feature) {
        return `Alignment <span class="ok">${feature.id}</span>`;
    }

    // Alignment tooltip text formatter
    static alignmentTooltipTextFormatter(feature) {
        const regionInfo = GenomeBrowserUtils.featureInfoFormatter({
            start: feature.start,
            end: feature.end,
            strand: feature?.alignment?.position?.strand ? GenomeBrowserUtils.alignmentStrandParser(feature) : "NA",
        });
        const flags = GenomeBrowserUtils.alignmentFlagsParser(feature);
        const info = Object.keys(feature.info || {}).map(key => {
            return `${key} : ${feature.info[key][0]} : ${feature.info[key][1]}`;
        });

        return `
            <div>
                ${flags.length > 0 ? `
                    <div style="display:flex;flex-wrap:wrap;margin-bottom:4px;" data-cy="gb-alignment-tooltip-flags">
                        ${flags.map(f => GenomeBrowserUtils.alignmentFlagFormatter(f)).join("")}
                    </div>
                ` : ""}
                ${regionInfo}
                <div>Cigar: <b>${feature.cigar || "NA"}</b></div>
                <div>Insert Size: <b>${feature.fragmentLength || "-"}</b></div>
                <div>Mapping Quality: <b>${feature.alignment.mappingQuality || "0"}</b></div>
                ${info.map(item => `<div>${item}</div>`).join("")}
            </div>
        `;
    }

    // Alignment color formatter
    static alignmentColorFormatter(read, pairedReads) {
        // Check for not paired read
        if (read.numberReads === 1 || !read.nextMatePosition) {
            return GenomeBrowserConstants.ALIGNMENTS_COLORS.not_paired;
        }
        // Check if is a translocation
        if (read.nextMatePosition.referenceName !== read.alignment.position.referenceName) {
            return GenomeBrowserConstants.ALIGNMENTS_COLORS.translocation;
        }
        const fragmentStart = Math.min.apply(null, pairedReads.map(r => r.end));
        const fragmentEnd = Math.max.apply(null, pairedReads.map(r => r.start));
        // Check for possible deletion
        if (fragmentEnd < fragmentStart) {
            return GenomeBrowserConstants.ALIGNMENTS_COLORS.possible_deletion;
        }
        // Check for possible insertion
        if (fragmentEnd - fragmentStart + 1 > 500) {
            return GenomeBrowserConstants.ALIGNMENTS_COLORS.possible_insertion;
        }
        // Default color
        return GenomeBrowserConstants.ALIGNMENTS_COLORS.default;
    }

    // Alignment opacity formatter
    static alignmentOpacityFormatter(read, pairedReads, minMappingQuality) {
        return read.alignment.mappingQuality > minMappingQuality ? 0.6 : 0.2;
    }

}
