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

import UtilsNew from "../../core/utils-new.js";
import {SVG} from "../../core/svg.js";


export default class JobTimelinePlot {

    constructor(jobs, configuration) {
        this.jobs = jobs;
        this.configuration = configuration;
    }

    render(settings) {
        return this._render(this.jobs, settings);
    }

    _render(jobs, configuration) {
        // We merge user's setting with default settings, by doing these users do not have to write al possible settings
        const config = {...this.getDefaultSetting(), ...this.configuration, ...configuration};

        const svg = SVG.create("svg", {
            width: config.width,
            height: config.height,
            viewBox: "0 0 " + config.width + " " + config.height,
            style: "fill: white",
            xmlns: "http://www.w3.org/2000/svg"
        });

        if (config.border) {
            SVG.addChild(svg, "rect", {width: config.width, height: config.height, style: "fill: white;stroke: black"});
        }

        // svg.appendChild(this._createSvgDefs(pedigree, settings));

        // Add Axis
        // Horizontal axis
        this.renderXAxis(svg, jobs, config);

        // Vertical axis
        this.renderYAxis(svg, jobs, config);

        if (jobs?.length > 0) {
            for (const job of jobs) {
                this._renderJob(svg, job, config);
            }
        }
        return svg;
    }

    renderXAxis(svg, jobs, config) {
        if (config?.xAxis.show) {
            const text = SVG.addChild(svg, "text", {
                x: config.width / 2,
                y: config.height - config.margin,
                style: `fill: black;font-size: ${config.xAxis.titleFontSize}px`,
                // transform: "translate(10,300) rotate(-90)"
            });
            text.textContent = config.xAxis?.title || "Date";

            // Horizontal axis
            SVG.addChild(svg, "line", {
                x1: 0 + config.margin + config.yAxis.titleWidth + config.yAxis.titleFontSize,
                y1: config.height - config.margin - config.xAxis.titleFontSize - config.xAxis.titleHeight,

                x2: config.width - config.margin,
                y2: config.height - config.margin - config.xAxis.titleFontSize - config.xAxis.titleHeight,
                style: "stroke: black;stroke-width: 2"
            });
        }
    }

    renderYAxis(svg, jobs, config) {
        if (config?.yAxis.show) {
            const text = SVG.addChild(svg, "text", {
                x: config.margin + config.yAxis.titleWidth,
                y: 0,
                style: `fill: black;font-size: ${config.yAxis.titleFontSize}px`,
                transform: "translate(10,300) rotate(-90)"
            });
            text.textContent = config.yAxis?.title || "Date";

            // Vertical axis
            SVG.addChild(svg, "line", {
                x1: 0 + config.margin + config.yAxis.titleWidth + config.yAxis.titleFontSize,
                y1: 0 + config.margin + config.yAxis.titleFontSize + config.yAxis.titleWidth,

                x2: 0 + config.margin + config.yAxis.titleWidth + config.yAxis.titleFontSize,
                y2: config.height - config.margin - config.yAxis.titleFontSize - config.yAxis.titleWidth,
                style: "stroke: black;stroke-width: 2"
            });
        }
    }

    _renderJob(svg, job, config) {
        const jobToolId = job.tool?.id || "UNKNOWN";
        const jobStatus = job.internal?.status?.id || "UNKNOWN";
        const jobStartDate = job.execution?.start || 0;
        const durationHours = (job.execution?.end - job.execution?.start); // Convert milliseconds to hours

        // Unique list of job starting dates
        const stringDates = [...new Set(this.jobs.filter(j => j.execution?.start).map(j => j.execution?.start))];
        const minDate = Math.min(...stringDates);
        const maxDate = Math.max(...stringDates);

        const r = (maxDate - minDate) / (config.width - config.margin - config.yAxis.titleWidth - config.yAxis.titleFontSize); // Calculate the range of dates
// debugger
        // const dateIndexMap = jobs.reduce((acc, job, index) => {
        //     if (job.execution?.start) {
        //         acc[job.execution.start] = index;
        //     }
        //     return acc;
        // }, {});

        // const x = this._getXAxisCoordinates(config);
        // const y = this._generateAllDates();
        // debugger
        const x = (jobStartDate - minDate) / r;
        const xx = config.margin + config.yAxis.titleWidth + config.yAxis.titleFontSize + x;
        console.log(x)


        // Duration
        const durations = [...new Set(this.jobs.filter(j => j.execution?.start).map(j => j.execution?.end - j.execution?.start))];
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        const h = (maxDuration - minDuration) / (config.height - config.margin - config.xAxis.titleHeight - config.xAxis.titleFontSize);

        const y = (durationHours - minDuration) / h;
        const yy = config.height - (config.margin + config.xAxis.titleHeight + config.xAxis.titleFontSize + y);
        debugger
        SVG.addChild(svg, "circle", {
            cx: xx,
            cy: yy,
            radius: 5,
            r: 5,
            width: 5, height: 5,
            // transform: "translate(" + radius + ") rotate(45 " + (x - radius) + " " + (10 + radius + (1.5 * width) + y) + ")",
            style: `fill: red; stroke: black;stroke-width: 2`
        });
    }
    _generateAllDates() {

        const incompleteDates = [...new Set(this.jobs.map(j => j.execution?.start))];
        console.log(incompleteDates);
        if (!incompleteDates || incompleteDates.length === 0) {
            return [];
        }

        // Convert string dates to Date objects and find min/max
        // const dates = incompleteDates
        //     .filter(dateStr => dateStr?.length > 8)
        //     .map(dateStr => {
        //         const year = parseInt(dateStr.substring(0, 4));
        //         const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
        //         const day = parseInt(dateStr.substring(6, 8));
        //         return new Date(year, month, day);
        //     });
        //
        // if (dates.length === 0) {
        //     return [];
        // }

        const minDate = Math.min(...incompleteDates);
        const maxDate = Math.max(...incompleteDates);
        debugger
        // Generate all dates between min and max
        const allDates = [];
        const currentDate = new Date(minDate);

        while (currentDate <= maxDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            allDates.push(`${year}${month}${day}`);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(allDates);
        return allDates;
    }
    _getXAxisCoordinates(config) {
        const xAxisCoordinates = [];
        const stringDates = [...new Set(this.jobs.map(j => j.execution?.start))];
        stringDates.forEach((date, index) => {
            const x = config.margin + config.yAxis.titleWidth + config.yAxis.titleFontSize + (index * 100); // Example spacing
            xAxisCoordinates.push({ date, x });
        });
        return xAxisCoordinates;
    }

    _renderPedigree(object, x, y, width, radius, showSampleNames, svg) {
        // No defined sex
        let memberSVG;
        if (typeof object.sex === "undefined" || object.sex === "undefined") {
            SVG.addChild(svg, "rect", {
                x: x - radius, y: y,
                width: width * 0.8, height: width * 0.8,
                transform: "translate(" + radius + ") rotate(45 " + (x - radius) + " " + (10 + radius + (1.5 * width) + y) + ")",
                style: "fill: " + object.colorPattern + ";stroke: black;stroke-width: 2"
            });
        } else {
            // Member is a male
            if (object.sex === "male" || object.sex === "MALE") {
                SVG.addChild(svg, "rect", {
                    x: x - radius,
                    y: y,
                    width: width,
                    height: width,
                    // fill: "url(#Pattern2)",
                    style: "fill: url(#" + object.colorPattern + ");stroke: black;stroke-width: 2"
                });
            } else {
                // Member is a female
                memberSVG = SVG.addChild(svg, "circle", {
                    cx: x, cy: y + radius,
                    r: radius,
                    style: "fill: url(#" + object.colorPattern + ");stroke: black;stroke-width: 2"
                });
            }
        }

        if ((typeof object.lifeStatus !== "undefined" && object.lifeStatus !== null) && object.lifeStatus.toUpperCase() === "DECEASED") {
            SVG.addChild(svg, "line", {
                x1: x - radius - 10, y1: y + radius + 30,
                x2: x + radius + 10, y2: y - radius + 10,
                style: "stroke: black;stroke-width: 2"
            });
        }

        if (showSampleNames) {
            let text = SVG.addChild(svg, "text", {
                x: x - radius + 2,
                y: y + width + 15,
                style: "fill: black;font-size:11px"
            });
            text.textContent = object.name;
        }
    }

    // This function create the different color Patterns in a SVG 'defs' section
    // _createSvgDefs(family, settings) {
    //     let svgDefs = SVG.create("defs");
    //
    //     // Default color pattern when no disease exist
    //     let pattern = SVG.create("pattern", {id: "PatternWhite", x: 0, y: 0, width: 1, height: 1});
    //     let rect = SVG.create("rect", {
    //         x: 0, y: 0,
    //         width: settings.box, height: settings.box,
    //         fill: "white"
    //     });
    //     pattern.appendChild(rect);
    //     svgDefs.appendChild(pattern);
    //
    //     // We create all possible combination (incrementally with no reptition, eg. 0, 01, 02, 1, 12, ...)
    //     for (let i = 0; i < family.disorders.length; i++) {
    //         // Add the single disease color, eg. 0, 1, 2
    //         let pattern = SVG.create("pattern", {id: "Pattern_" + i, x: 0, y: 0, width: 1, height: 1});
    //         let rect = SVG.create("rect", {
    //             x: 0, y: 0,
    //             width: settings.box, height: settings.box,
    //             fill: settings.colors[i]
    //         });
    //         pattern.appendChild(rect);
    //         svgDefs.appendChild(pattern);
    //
    //         // Add the double disease color, eg. 01, 02, 12, ...
    //         for (let j = i + 1; j < family.disorders.length; j++) {
    //             let pattern = SVG.create("pattern", {id: "Pattern_" + i + j, x: 0, y: 0, width: 1, height: 1});
    //             let rect1 = SVG.create("rect", {
    //                 x: 0, y: 0,
    //                 width: settings.box / 2, height: settings.box,
    //                 fill: settings.colors[i]
    //             });
    //             let rect2 = SVG.create("rect", {
    //                 x: settings.box / 2, y: 0,
    //                 width: settings.box / 2, height: settings.box,
    //                 fill: settings.colors[j]
    //             });
    //             pattern.appendChild(rect1);
    //             pattern.appendChild(rect2);
    //             svgDefs.appendChild(pattern);
    //         }
    //     }
    //
    //     return svgDefs;
    // }

    getDefaultSetting() {
        return {
            width: 1280, // width is dynamic on the max number of siblings
            height: 800,
            margin: 20,
            // box: 60,
            // colors: ["black", "red", "blue"],
            border: true,
            xAxis: {
                show: true,
                title: "Date",
                titleFontSize: 12,
                titleHeight: 10,
            },
            yAxis: {
                show: true,
                title: "Duration (h)",
                titleFontSize: 12,
                titleWidth: 10,
            },
            shape: {
                DONE: "circle",
                PENDING: "triangle",
                ABORTED: "diamond",
                ERROR: "cross",
            },
            color: {
                "variant-index": "blue",
                "variant-secondary-annotation-index": "orange",
            }
        };
    }

}
