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
import FeatureBinarySearchTree from "../feature-binary-search-tree.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";

export default class FeatureRenderer extends Renderer {

    render(features, options) {
        const group = SVG.create("g");

        (features || []).forEach((feature, featureIndex) => {
            // TODO: review this
            // if ("featureType" in feature) {
            //     Object.assign(this, FEATURE_TYPES[feature.featureType]);
            // }
            // if ("featureClass" in feature) {
            //     Object.assign(this, FEATURE_TYPES[feature.featureClass]);
            // }

            // TODO: review this
            // // Temporal fix for clinical
            // if (args.featureType === "clinical") {
            //     if ("clinvarSet" in feature) {
            //         Object.assign(this, FEATURE_TYPES.Clinvar);
            //     } else if ("mutationID" in feature) {
            //         Object.assign(this, FEATURE_TYPES.Cosmic);
            //     } else {
            //         Object.assign(this, FEATURE_TYPES.GWAS);
            //     }
            // }

            // Prevent rendering a feature twice
            if (options.renderedFeatures) {
                if (options.renderedFeatures.has(feature.id)) {
                    return;
                }
                options.renderedFeatures.add(feature.id);
            }

            // get feature render configuration
            const color = typeof this.config.color === "function" ? this.config.color(feature) : this.config.color;
            const strokeColor = typeof this.config.strokeColor === "function" ? this.config.strokeColor(feature) : this.config.strokeColor;
            const label = typeof this.config.label === "function" ? this.config.label(feature) : this.config.label;
            const height = typeof this.config.height === "function" ? this.config.height(feature) : this.config.height;
            const tooltipTitle = typeof this.config.tooltipTitle === "function" ? this.config.tooltipTitle(feature) : this.config.tooltipTitle;
            const tooltipText = typeof this.config.tooltipText === "function" ? this.config.tooltipText(feature) : this.config.tooltipText;
            const infoWidgetId = typeof this.config.infoWidgetId === "function" ? this.config.infoWidgetId(feature) : this.config.infoWidgetId;

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            const length = Math.max(Math.abs((end - start) + 1), 1);

            // transform to pixel position
            const width = Math.max(length * options.pixelBase, 1);

            const svgLabelWidth = label.length * 6.4;

            // calculate x to draw svg rect
            const x = GenomeBrowserUtils.getFeatureX(start, options);

            let maxWidth = Math.max(width, 2);
            let textHeight = 0;
            if (options.labelMaxRegionSize > options.regionSize) {
                textHeight = 9;
                maxWidth = Math.max(width, svgLabelWidth);
            }

            let rowY = 0;
            let textY = textHeight + height;
            const rowHeight = textHeight + height + 5;
            let foundArea = false;

            while (!foundArea) {
                if (!options.renderedArea[rowY]) {
                    // eslint-disable-next-line no-param-reassign
                    options.renderedArea[rowY] = new FeatureBinarySearchTree();
                }

                foundArea = options.renderedArea[rowY].add({
                    start: x,
                    end: x + maxWidth - 1,
                });

                if (foundArea) {
                    const featureGroup = SVG.addChild(group, "g", {
                        "data-cy": "gb-feature",
                        "data-feature-id": feature.id,
                        "data-feature-start": feature.start,
                        "data-feature-end": feature.end,
                        "data-feature-label": label || "-",
                    });
                    SVG.addChild(featureGroup, "rect", {
                        "data-cy": "gb-feature-rect",
                        "x": x,
                        "y": rowY,
                        "width": width,
                        "height": height,
                        "stroke": strokeColor,
                        "stroke-width": 1,
                        "stroke-opacity": 0.7,
                        "fill": color,
                        "cursor": "pointer",
                    });

                    if (options.labelMaxRegionSize > options.regionSize) {
                        const text = SVG.addChild(featureGroup, "text", {
                            "data-cy": "gb-feature-label",
                            "i": featureIndex,
                            "x": x,
                            "y": textY,
                            "font-weight": 400,
                            "opacity": null,
                            "fill": "black",
                            "cursor": "pointer",
                            "class": this.config.fontClass || "",
                        });
                        text.textContent = label;
                    }

                    if (tooltipText && tooltipTitle) {
                        $(featureGroup).qtip({
                            content: {
                                text: tooltipText,
                                title: tooltipTitle,
                            },
                            position: {
                                viewport: $(window),
                                target: "mouse",
                                adjust: {x: 25, y: 15},
                            },
                            style: {
                                width: true,
                                classes: `${this.config.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
                            },
                            show: {delay: 300},
                            hide: {delay: 300},
                        });
                    }

                    featureGroup.addEventListener("mouseover", event => {
                        this.trigger("feature:mouseover", {
                            query: feature[infoWidgetId],
                            feature: feature,
                            featureType: feature.featureType,
                            mouseoverEvent: event,
                        });
                    });

                    featureGroup.addEventListener("click", event => {
                        this.trigger("feature:click", {
                            query: feature[infoWidgetId],
                            feature: feature,
                            featureType: feature.featureType,
                            clickEvent: event,
                        });
                    });
                    // break;
                }
                rowY += rowHeight;
                textY += rowHeight;
            }
        });

        // Append SVG group element
        options.svgCanvasFeatures.appendChild(group);

    }

    // Default config for feature renderer
    getDefaultConfig() {
        return {
            color: "#aaa",
            infoWidgetId: "id",
            height: 10,
            histogramColor: "lightgray",
            label: GenomeBrowserUtils.featurePositionFormatter,
            tooltipTitle: GenomeBrowserUtils.featureTooltipTitleFormatter,
            tooltipText: GenomeBrowserUtils.featureTooltipTextFormatter,
        };
    }

}
