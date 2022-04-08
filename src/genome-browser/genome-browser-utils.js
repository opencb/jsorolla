import UtilsNew from "../core/utilsNew.js";
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
    static variantTooltipTextFormatter(feature) {
        return GenomeBrowserUtils.featureTooltipTextFormatter(feature);
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

}
