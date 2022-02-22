import UtilsNew from "../core/utilsNew.js";
import {SVG} from "../core/svg.js";

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

    //
    // Variant utils
    //

    // Variant label formatter
    static variantLabelFormatter(feature) {
        return [feature.id, feature.name].filter(f => !!f).join(" - ");
    }

    // Variant tooltip title formatter
    static variantTooltipTitleFormatter(feature) {
        return [feature.featureType, feature.id, feature.name].filter(f => !!f).join(" - ");
    }

    // Variant tooltip text formatter
    static variantTooltipTextFormatter(feature) {
        const strand = feature.strand || "NA";
        const length = (feature.end - feature.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        const otherFeatureKeys = Object.keys(feature).filter(key => {
            return !(key === "start" || key === "end" || key === "id" || key === "name" || key === "length");
        });
        const otherFeatureData = otherFeatureKeys.map(key => `
            <div class="">
                ${key}: <strong>${feature[key]}</strong>
            </div>
        `);
        return `
            <div class="">
                start-end: <strong>${feature.start}-${feature.end} (${strand})</strong>
            </div>
            <div class="">
                length: <strong style="color:#005fdb">${length}</strong>
            </div>
            ${otherFeatureData.join("")}
        `;
    }

}
