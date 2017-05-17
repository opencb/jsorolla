/*
 * Copyright 2015-2016 OpenCB
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

/**
 * Created by imedina on 16/05/17.
 */
class Pedigree {

    constructor(settings) {
        this.settings = settings;
    }

    createSvg(pedigree, settings) {

        // If no settings is provided we use the one passed in the constructor
        if (typeof settings === "undefined" || settings === null) {
            settings = this.settings;
        }

        // We merge user's setting with default settings, by doing this users do not have to write al possible settings
        settings = Object.assign(this._getDefaultSetting(), settings);
        // settings = this.settings;

        let svg = SVG.create('svg', {
            width: settings.width,
            height: settings.height,
            viewBox: "0 0 " + settings.width + " " + settings.height,
            style: "fill: white"
        });

        if (settings.border) {
            SVG.addChild(svg, 'rect', {width: settings.width, height: settings.height, style: "fill: white;stroke: black"});
        }


        let xCenter = settings.width/2;
        let radius = settings.box / 2;

        // Draw the lines between parents and children
        if ((typeof pedigree.father !== "undefined" && typeof pedigree.mother !== "undefined") || true) {
            let verticalBarOffset = 0;
            if (pedigree.parentalConsanguinity) {
                verticalBarOffset = 2;
                SVG.addChild(svg, 'line', {
                    x1: xCenter - settings.box,     y1: 10 + radius - verticalBarOffset,
                    x2: xCenter + settings.box,     y2: 10 + radius - verticalBarOffset,
                    style: "stroke: black;stroke-width: 2"
                });
                SVG.addChild(svg, 'line', {
                    x1: xCenter - settings.box,     y1: 10 + radius + verticalBarOffset,
                    x2: xCenter + settings.box,     y2: 10 + radius + verticalBarOffset,
                    style: "stroke: black;stroke-width: 2"
                });

            } else {
                SVG.addChild(svg, 'line', {
                    x1: xCenter - settings.box,     y1: 10 + radius,
                    x2: xCenter + settings.box,     y2: 10 + radius,
                    style: "stroke: black;stroke-width: 2"
                });
            }

            // Vertical bar for children
            SVG.addChild(svg, 'line', {
                x1: xCenter,    y1: 10 + radius + verticalBarOffset,
                x2: xCenter,    y2: 10 + radius + (1.5 * settings.box),
                style: "stroke: black;stroke-width: 2"
            });
        }

        // Draw the FATHER
        if (typeof pedigree.father !== "undefined") {
            // Prepare the fill color
            let fillColor = this._getFillColor(pedigree.father);
            SVG.addChild(svg, 'rect', {
                x: xCenter - 2 * settings.box,  y: 10,
                width: settings.box,            height: settings.box,
                style: "fill: " + fillColor + ";stroke: black;stroke-width: 2"
            });

            if (settings.selectShowSampleNames) {
                let text = SVG.addChild(svg, 'text', {
                    x: xCenter - 2 * settings.box,  y: 10 + settings.box + 15,
                    style: "fill: black;font-size=8px;font-weight:10"
                });
                text.textContent = pedigree.father.name;
            }

            // $(fatherRect).qtip({
            //     content: {title: "Sample" + pedigree.father.name, text:
            //         "Name: " + pedigree.father.name
            //     },
            //     position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
            //     style: {width: true, classes: ' ui-tooltip ui-tooltip-shadow'},
            //     show: {delay: 250},
            //     hide: {delay: 200}
            // });


            if (pedigree.father.deceased) {
                SVG.addChild(svg, 'line', {
                    x1: xCenter - 2 * settings.box - 10,    y1: 10 + settings.box + 10,
                    x2: xCenter - settings.box + 10,        y2: 0,
                    style: "stroke: black;stroke-width: 2"
                });
            }
        }

        // Draw the MOTHER
        if (typeof pedigree.mother !== "undefined") {
            // Prepare the fill color
            let fillColor = this._getFillColor(pedigree.mother);
            SVG.addChild(svg, 'circle', {
                cx: xCenter - radius + (2 * settings.box),  cy: 10 + radius,
                r: radius,
                style: "fill: " + fillColor + ";stroke: black;stroke-width: 2"
            });

            if (settings.selectShowSampleNames) {
                let text = SVG.addChild(svg, 'text', {
                    x: xCenter - 2 * radius + (2 * settings.box),  y: 10 + settings.box + 15,
                    style: "fill: black;font-size=8px;font-weight:10"
                });
                text.textContent = pedigree.mother.name;
            }

            if (pedigree.mother.deceased) {
                SVG.addChild(svg, 'line', {
                    x1: xCenter + settings.box - 10,        y1: 10 + settings.box + 10,
                    x2: xCenter + 2 * settings.box + 10,    y2: 0,
                    style: "stroke: black;stroke-width: 2"
                });
            }
        }

        // Draw the CHILDREN
        if (typeof pedigree.children !== "undefined" && pedigree.children.length > 0) {
            if (pedigree.children.length === 1) {
                this._addChild(pedigree.children[0], xCenter, 0, settings.box, radius, settings.selectShowSampleNames, svg);
            } else {
                let numChildren = pedigree.children.length;
                let w =  (numChildren + numChildren - 1) * settings.box;
                // Add horizontal bar
                SVG.addChild(svg, 'line', {
                    x1: xCenter - w / 2,        y1: 10 + radius + (1.5 * settings.box),
                    x2: xCenter + w / 2 ,       y2: 10 + radius + (1.5 * settings.box),
                    style: "stroke: black;stroke-width: 2"
                });

                let left = xCenter - w / 2;
                let interval = w / (numChildren - 1);
                for (let i = 0; i < pedigree.children.length; i++) {
                    SVG.addChild(svg, 'line', {
                        x1: left + (i * interval),        y1: 10 + radius + (1.5 * settings.box),
                        x2: left + (i * interval) ,       y2: 10 + radius + (1.5 * settings.box) + 15,
                        style: "stroke: black;stroke-width: 2"
                    });

                    this._addChild(pedigree.children[i], left + (i * interval), 15, settings.box, radius, settings.selectShowSampleNames, svg);
                }
            }
        }

        return svg;
    }

    _addChild(object, xCenter, y, width, radius, showSampleNames, svg) {
        // Prepare the fill color
        let fillColor = this._getFillColor(object);

        // No defined gender
        if (typeof object.gender === "undefined" || object.gender === "undefined") {
            SVG.addChild(svg, 'rect', {
                x: xCenter - radius,    y: 10 + radius + (1.5 * width) + y,
                width: width * 0.8,           height: width * 0.8,
                transform: "translate(" + radius + ") rotate(45 " + (xCenter - radius) + " " + (10 + radius + (1.5 * width) + y) + ")",
                style: "fill: " + fillColor + ";stroke: black;stroke-width: 2"
            });
        } else {
            // Child is a boy
            if (object.gender === "male") {
                SVG.addChild(svg, 'rect', {
                    x: xCenter - radius,    y: 10 + radius + (1.5 * width) + y,
                    width: width,    height: width,
                    style: "fill: " + fillColor + ";stroke: black;stroke-width: 2"
                });
            } else {
                // Child is a girl
                SVG.addChild(svg, 'circle', {
                    cx: xCenter,    cy: 10 + radius + radius + (1.5 * width) + y,
                    r: radius,
                    style: "fill: " + fillColor + ";stroke: black;stroke-width: 2"
                });
            }
        }

        if (showSampleNames) {
            let text = SVG.addChild(svg, 'text', {
                x: xCenter - radius,  y: 10 + 3 * width + 15 + y,
                style: "fill: black;font-size=8px;font-weight:10"
            });
            text.textContent = object.name;
        }

        if (object.deceased) {
            SVG.addChild(svg, 'line', {
                x1: xCenter - radius - 10,      y1: 10 + (2.5 * width) + radius + 10 + y,
                x2: xCenter + radius + 10,      y2: 10 + (2.5 * width) - radius - 10 + y,
                style: "stroke: black;stroke-width: 2"
            });
        }
    }

    _getFillColor(object) {
        let fillColor = "white";
        if (typeof object !== "undefined" && typeof object.affected !== "undefined" && object.affected) {
            fillColor = "black";
        }
        return fillColor;
    }

    _getDefaultSetting() {
        let config = {
            width: 400,
            height: 240,

            box: 40
        };
        return config;
    }
}