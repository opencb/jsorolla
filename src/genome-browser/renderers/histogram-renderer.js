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

import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";

export default class HistogramRenderer extends Renderer {

    render(chunks, options) {
        const middle = options.width / 2;

        (chunks || []).forEach(chunk => {
            const items = chunk.buckets || [];

            // Update the scale values
            const histogramHeight = options.height ? options.height * 0.95 : this.config.histogramHeight;
            const maxValue = options.histogramMaxFreqValue || this.config.maxValue;
            const multiplier = histogramHeight / maxValue;

            const points = [];

            // Draw starting point
            if (items.length > 0) {
                const firstItem = items[0];
                // const width = parseInt(firstItem.value) * options.pixelBase;
                const x = options.pixelPosition + middle - ((options.position - parseInt(firstItem.value)) * options.pixelBase);
                // const height = firstItem.count * multiplier;

                points.push(`${x.toFixed(1)},0`);
                // points.push(`${x.toFixed(1)},${histogramHeight.toFixed(1)}`);
                // points.push(`${(x - (width / 2)).toFixed(1)},${(histogramHeight - height).toFixed(1)}`);
            }

            items.forEach(item => {
                // const width = (feature.end - feature.start + 1) * options.pixelBase;
                const x = options.pixelPosition + middle - ((options.position - parseInt(item.value)) * options.pixelBase);
                const height = item.count * multiplier;

                points.push(`${x.toFixed(1)},${(histogramHeight - height).toFixed(1)}`);
            });

            // Draw ending point of histogram
            if (items.length > 0) {
                const lastItem = items[items.length - 1];
                // const width = (lastFeature.end - lastFeature.start + 1) * options.pixelBase;
                const x = options.pixelPosition + middle - ((options.position - parseInt(lastItem.value)) * options.pixelBase);
                // const height = lastItem.count * multiplier;

                // points.push(`${(x + width).toFixed(1)},${(histogramHeight - height).toFixed(1)}`);
                // points.push(`${x.toFixed(1)},${histogramHeight.toFixed(1)}`);
                points.push(`${x.toFixed(1)},0`);
            }

            // Draw histogram points
            if (points.length > 0) {
                SVG.addChild(options.svgCanvasFeatures, "polyline", {
                    points: points.join(" "),
                    fill: this.config.histogramColor,
                    // cursor: "pointer",
                });
            }
        });
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
