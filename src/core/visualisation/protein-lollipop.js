import LollipopLayout from "./lollipop-layout.js";
import {SVG} from "../svg.js";

const getDefaultConfig = () => ({
    showProteinScale: true,
    showProteinStructure: true,
    showProteinLollipops: true,
    showLegend: true,
    labelsWidth: 200,
});

export const proteinLollipop = (target, protein, variants, customConfig) => {
    const config = {
        ...getDefaultConfig(),
        ...customConfig,
    };
    console.log(protein);
    console.log(variants);

    const svg = SVG.init(target, {
        style: "user-select:none;",
        width: "100%",
    });
    const width = svg.clientWidth;
    let offset = 0;

    // Get protein length
    const chainFeature = protein.feature?.find(feature => feature.type === "chain");
    if (!chainFeature || !chainFeature?.location?.end?.position) {
        throw new Error("No 'chain' feature found in protein");
    }
    const proteinLength = chainFeature.location.end.position;

    // Tiny utility to calculate the positin in px from the given protein coordinate
    const getPixelPosition = p => p * width / proteinLength;

    if (config.showProteinScale) {
        offset = offset + 25;
        const group = SVG.addChild(svg, "g", {
            "transform": `translate(0,${offset})`,
        });

        // Append scale ticks
        for (let i = 1; i * 200 < proteinLength; i++) {
            const tickValue = i * 200;
            const tickPosition = getPixelPosition(tickValue) - 0.5;
            SVG.addChild(group, "path", {
                "d": `M${tickPosition}-6V0.5`,
                "fill": "none",
                "stroke": "black",
                "stroke-width": "1px",
            });
            SVG.addChildText(group, tickValue.toString(), {
                "fill": "black",
                "font-family": "Arial",
                "font-size": "10px",
                "style": "cursor:default;",
                "text-anchor": "middle",
                "x": tickPosition,
                "y": -8,
            });
        }

        // Append scale line
        SVG.addChild(group, "path", {
            "d": `M0.5,-6V0.5H${(width - 0.5)}V-6`,
            "fill": "none",
            "stroke": "black",
            "stroke-width": "1px",
        });
    }

    // Show protein lollipops
    // if (config.showProteinLollipops) {
    //     offset = offset + 400;
    //     const group = SVG.addChild(svg, "g", {
    //         "transform": `translate(0, ${offset})`,
    //     });
    // }

    // Show protein structure
    if (config.showProteinStructure) {
        offset = offset + 50;
        const group = SVG.addChild(svg, "g", {
            "transform": `translate(0, ${offset})`,
        });

        // Append structure line
        SVG.addChild(group, "path", {
            "d": `M0.5,-19.5H${(width - 0.5)}`,
            "fill": "none",
            "stroke": "black",
            "stroke-width": "1px",
        });

        // Append protein domains
        protein.feature
            .filter(feature => feature.type === "domain" || feature.type === "region of interest")
            .forEach(feature => {
                const featureStart = getPixelPosition(feature.location.begin.position);
                const featureEnd = getPixelPosition(feature.location.end.position);

                SVG.addChild(group, "rect", {
                    "fill": "#fdb462",
                    "height": 40,
                    "stroke": "black",
                    "stroke-width": "1px",
                    "width": (featureEnd - featureStart),
                    "x": featureStart,
                    "y": -40,
                });
            });
    }

    // Update SVG size
    svg.setAttribute("height", `${offset}px`);

    return svg;
};
