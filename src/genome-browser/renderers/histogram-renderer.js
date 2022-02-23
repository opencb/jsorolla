import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";

export default class HistogramRenderer extends Renderer {

    #getFeatureValue(feature) {
        return feature.absolute > 0 ? Math.max(0.2, Math.log(feature.absolute)) : 0;
    }

    render(features, options) {
        // Sort features by start position
        features.sort((a, b) => a.value.start - b.value.start);

        const middle = options.width / 2;

        // Update the scale values
        const histogramHeight = options.height ? options.height * 0.95 : this.config.histogramHeight;
        const maxValue = options.histogramMaxFreqValue || this.config.maxValue;
        const multiplier = histogramHeight / maxValue;

        const points = [];

        // Draw starting point
        if (features.length > 0) {
            const firstFeature = features[0].value;
            const width = (firstFeature.end - firstFeature.start + 1) * options.pixelBase;
            const x = options.pixelPosition + middle - ((options.position - parseInt(firstFeature.start)) * options.pixelBase);
            const height = this.#getFeatureValue(firstFeature) * multiplier;

            points.push(`${(x - (width / 2)).toFixed(1)},${histogramHeight.toFixed(1)}`);
            points.push(`${(x - (width / 2)).toFixed(1)},${(histogramHeight - height).toFixed(1)}`);
        }

        features.forEach(feature => {
            const width = (feature.end - feature.start + 1) * options.pixelBase;
            const x = options.pixelPosition + middle - ((options.position - feature.start) * options.pixelBase);
            const height = this.#getFeatureValue(feature) * multiplier;

            points.push(`${(x + (width / 2)).toFixed(1)},${(histogramHeight - height).toFixed(1)}`);
        });

        // Draw ending point of histogram
        if (features.length > 0) {
            const lastFeature = features[features.length - 1].value;
            const width = (lastFeature.end - lastFeature.start + 1) * options.pixelBase;
            const x = options.pixelPosition + middle - ((options.position - parseInt(lastFeature.start)) * options.pixelBase);
            const height = this.#getFeatureValue(lastFeature) * multiplier;

            points.push(`${(x + width).toFixed(1)},${(histogramHeight - height).toFixed(1)}`);
            points.push(`${(x + width).toFixed(1)},${histogramHeight.toFixed(1)}`);
        }

        // Draw histogram points
        if (points.length > 0) {
            SVG.addChild(options.svgCanvasFeatures, "polyline", {
                points: points.join(" "),
                fill: this.config.histogramColor,
                cursor: "pointer",
            });
        }
    }

    // Get histogram default config
    getDefaultConfig() {
        return {
            maxValue: 10,
            histogramHeight: 75,
            histogramColor: "#428bca",
        };
    }

}
