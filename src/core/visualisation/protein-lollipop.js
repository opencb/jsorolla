import LollipopLayout from "./lollipop-layout.js";
import {SVG} from "../svg.js";
import UtilsNew from "../utils-new.js";

const getDefaultConfig = () => ({
    showProteinScale: true,
    showProteinStructure: true,
    showProteinLollipops: true,
    showLegend: true,
    labelsWidth: 200,
    proteinFeatures: [
        "domain",
        "region of interest",
    ],
    proteinFeaturesColors: {
        "domain": "#fd9843",
        "region of interest": "#3d8bfd",
        "other": "#adb5bd",
    },
});

// This is a terrible hack to find the correct protein ID and the transcript ID
const getProteinInfoFromGene = (client, geneName) => {
    let protein = null;
    return client.getProteinClient(null, "search", {gene: geneName})
        .then(response => {
            protein = response.responses[0].results[0];
            // const gene = protein?.gene[0]?.name?.find(item => item.type === "primary");
            return client.getGeneClient(geneName, "transcript", {});
        })
        .then(response => {
            const transcript = response.responses[0]?.results?.find(item => {
                return item.proteinSequence === protein.sequence.value;
            });
            if (transcript) {
                protein.proteinId = transcript.proteinId;
                protein.transcriptId = transcript.id;
            }
            return protein;
        });

};

const draw = (target, protein, variants, customConfig) => {
    const prefix = UtilsNew.randomString(8);
    const config = {
        ...getDefaultConfig(),
        ...customConfig,
    };
    console.log(protein);
    console.log(variants);

    // Initialize template
    const template = `
        <div id="${prefix}" class="" style="user-select:none;">
        </div>
    `;
    const parent = UtilsNew.renderHTML(template).querySelector(`div#${prefix}`);

    // Append HTML content into target element (if provided)
    if (target) {
        target.appendChild(parent);
    }

    // Initialize SVG for reindering protein tracks
    const svg = SVG.init(parent, {width: "100%"}, 0);
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

        const defaultColor = config.proteinFeaturesColors["other"];
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
            .filter(feature => config.proteinFeatures.includes(feature.type))
            .forEach(feature => {
                const featureStart = getPixelPosition(feature.location.begin.position);
                const featureEnd = getPixelPosition(feature.location.end.position);

                SVG.addChild(group, "rect", {
                    "fill": config.proteinFeaturesColors[feature.type] || defaultColor,
                    "height": 40,
                    "stroke": "black",
                    "stroke-width": "1px",
                    "width": (featureEnd - featureStart),
                    "x": featureStart,
                    "y": -40,
                    "title": feature.description,
                });
            });
    }

    // Update SVG size
    svg.setAttribute("height", `${offset}px`);

    return svg;
};

export default {
    getDefaultConfig,
    getProteinInfoFromGene,
    draw,
};
