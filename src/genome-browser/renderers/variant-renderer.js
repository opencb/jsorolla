import FeatureRenderer from "./feature-renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import {SVG} from "../../core/svg.js";

export default class VariantRenderer extends FeatureRenderer {

    // TODO: remove this old function
    // renderOld(features, options) {
    //     (features || []).forEach(feature => {
    //         // get feature render configuration
    //         const tooltipTitle = typeof this.config.tooltipTitle === "function" ? this.config.tooltipTitle(feature) : this.config.tooltipTitle;
    //         const tooltipText = typeof this.config.tooltipText === "function" ? this.config.tooltipText(feature) : this.config.tooltipText;

    //         // get feature genomic information
    //         const start = feature.start;
    //         const end = feature.end;
    //         const length = Math.max(Math.abs((end - start) + 1), 1);

    //         // Transform to pixel position, minimum width set to 1px
    //         const width = Math.max(length * options.pixelBase, 1);


    //         // calculate x to draw svg rect
    //         const x = GenomeBrowserUtils.getFeatureX(start, options);

    //         // Color: Dark blue: 0/0, Orange: 0/1, Red: 1/1, Black: ./.
    //         let d00 = "";
    //         let dDD = "";
    //         let d11 = "";
    //         let d01 = "";
    //         const xs = x; // x start
    //         const xe = x + width; // x end
    //         let ys = 5; // y start
    //         const yi = 10; // y increment
    //         const yi2 = this.config.sampleTrackHeight; // y increment

    //         const samplesData = feature.studies?.[0]?.samplesData || [];
    //         // for (const i in feature.studies[0].samplesData) {
    //         samplesData.forEach(data => {
    //             const svgPath = `M${xs},${ys} L${xe},${ys} L${xe},${ys + yi} L${xs},${ys + yi} z `;

    //             // Only one study is expected, and GT is always the first field in samplesData
    //             // const genotype = feature.studies[0].samplesData[i]["0"];
    //             const genotype = data["0"];
    //             switch (genotype) {
    //                 case "0|0":
    //                 case "0/0":
    //                     d00 += svgPath;
    //                     break;
    //                 case "0|1":
    //                 case "0/1":
    //                 case "1|0":
    //                 case "1/0":
    //                     d01 += svgPath;
    //                     break;
    //                 case "1|1":
    //                 case "1/1":
    //                     d11 += svgPath;
    //                     break;
    //                 case ".|.":
    //                 case "./.":
    //                     dDD += svgPath;
    //                     break;
    //             }
    //             ys += yi2;
    //         });

    //         const featureGroup = SVG.addChild(options.svgCanvasFeatures, "g", {
    //             feature_id: feature.id,
    //         });
    //         SVG.addChild(featureGroup, "rect", {
    //             x: xs,
    //             y: 1,
    //             width: width,
    //             height: ys,
    //             fill: "transparent",
    //             cursor: "pointer",
    //         });
    //         if (d00 !== "") {
    //             SVG.addChild(featureGroup, "path", {
    //                 d: d00,
    //                 fill: "blue",
    //                 cursor: "pointer",
    //             });
    //         }
    //         if (dDD !== "") {
    //             SVG.addChild(featureGroup, "path", {
    //                 d: dDD,
    //                 fill: "black",
    //                 cursor: "pointer",
    //             });
    //         }
    //         if (d11 !== "") {
    //             SVG.addChild(featureGroup, "path", {
    //                 d: d11,
    //                 fill: "red",
    //                 cursor: "pointer",
    //             });
    //         }
    //         if (d01 !== "") {
    //             SVG.addChild(featureGroup, "path", {
    //                 d: d01,
    //                 fill: "orange",
    //                 cursor: "pointer",
    //             });
    //         }

    //         $(featureGroup).qtip({
    //             content: {
    //                 text: `${tooltipText}<br>${samplesData.length} samples`,
    //                 title: tooltipTitle,
    //             },
    //             position: {
    //                 target: "mouse",
    //                 adjust: {x: 25, y: 15},
    //             },
    //             style: {
    //                 width: true,
    //                 classes: `${this.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
    //             },
    //             show: {
    //                 delay: 300,
    //             },
    //             hide: {
    //                 delay: 300,
    //             },
    //         });

    //         // TODO: review this event
    //         // let lastSampleIndex = 0;
    //         // featureGroup.addEventListener("mousemove", event => {
    //         //     const sampleIndex = parseInt(event.offsetY / yi2);
    //         //     if (sampleIndex !== lastSampleIndex) {
    //         //         // console.log(sampleIndex);
    //         //         let samplesCount = 0;
    //         //         let sampleName = "";
    //         //         for (const i in feature.studies) {
    //         //             for (const j in feature.studies[i].samplesData) { // better search it up than storing it? memory could be an issue.
    //         //                 if (sampleIndex === samplesCount) {
    //         //                     sampleName = j;
    //         //                 }
    //         //                 samplesCount++;
    //         //             }
    //         //         }
    //         //         $(featureGroup).qtip("option", "content.text", `${tooltipText}<br>${sampleName}`);
    //         //     }
    //         //     lastSampleIndex = sampleIndex;
    //         // });
    //     });
    // }

    render(features, options) {
        (features || []).forEach(feature => {
            const group = SVG.addChild(options.svgCanvasFeatures, "g", {});

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            const length = Math.max(Math.abs((end - start) + 1), 1);

            // transform to pixel position
            const width = Math.max(length * options.pixelBase, 1);
            const x = GenomeBrowserUtils.getFeatureX(start, options);

            // Render feature position
            // SVG.addChild(group, "rect", {
            //     "x": x,
            //     "y": 0,
            //     "width": width,
            //     "height": this.config.sampleNamesHeight - 2,
            //     // "stroke": "#000000",
            //     // "stroke-width": 1,
            //     // "stroke-opacity": 0.7,
            //     "fill": "darkBlue",
            //     "cursor": "pointer",
            // });

            // Render for each sample in feature.studies[0].samples
            // this.config.sampleNames.forEach((sampleName, index) => {
            (feature.studies[0]?.samples || []).forEach((sampleData, index) => {
                // Only one study is expected, and GT is always the first field in samplesData
                const genotype = sampleData.data[0];
                const genotypeColor = typeof this.config.genotypeColor === "function" ? this.config.genotypeColor(genotype) : this.config.genotypeColor;

                SVG.addChild(group, "rect", {
                    "x": x,
                    "y": index * this.config.sampleHeight,
                    "width": width,
                    "height": this.config.sampleHeight - 2,
                    // "stroke": "#000000",
                    // "stroke-width": 1,
                    // "stroke-opacity": 0.7,
                    "fill": genotypeColor,
                    "cursor": "pointer",
                    // "data-genotype": genotype,
                });
            });
        });
    }

    getDefaultConfig() {
        return {
            infoWidgetId: "id",
            color: GenomeBrowserUtils.variantColorFormatter,
            strokeColor: "#555",
            height: 10,
            histogramColor: "#58f3f0",
            label: GenomeBrowserUtils.variantLabelFormatter,
            tooltipTitle: GenomeBrowserUtils.variantTooltipTitleFormatter,
            tooltipText: GenomeBrowserUtils.variantTooltipTextFormatter,
            genotypeColor: GenomeBrowserUtils.genotypeColorFormatter,
            // sampleTrackHeight: 20,
            // sampleTrackY: 15,
            // sampleTrackFontSize: 12,
            sampleNames: [],
            sampleHeight: 20,
        };
    }

}
