import {SVG} from "../core/svg.js";

export default class GenomeBrowserUtils {

    // TODO: check if we need to insert the element to calculate the width
    getLabelWidth(label, track) {
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

}
