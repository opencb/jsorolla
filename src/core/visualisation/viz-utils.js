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

import UtilsNew from "../utils-new";

export default {

    // Generate ticks to be displayed in a scale
    // @param {integer} start - Start value of the scale
    // @param {integer} end - End value of the scale
    // @param {intener} n - Maximum number of ticks to generate
    // @param {integer[]} steps - List of steps to use for generating scale ticks
    getScaleTicks(start, end, n, steps=[500, 250, 200, 100, 50, 25]) {
        const ticksValues = [];
        const range = Math.floor((end - start) / 10) * 10;
        const step = steps.find(value => value * n < range) || steps[0];
        const ticksStart = Math.floor(start / step) * step;
        const ticksEnd = Math.ceil(end / step) * step;
        for (let value = ticksStart; value <= ticksEnd; value = value + step) {
            ticksValues.push(value);
        }
        // Remove ticks outside of the [start, end] interval
        return ticksValues.filter(value => start <= value && value <= end);
    },

    // Display a tooltip in the specified element
    // @param {object} target - HTML element to attach the tooltip
    // @param {object} config - Tooltip configuration
    createTooltip(target, config) {
        const tooltipTemplate = `
            <div class="viz-tooltip" style="width:${config.width || "auto"};">
                <div class="viz-tooltip-box" style="max-height:${config.height || "auto"};">
                    ${config.title ? `
                        <div class="viz-tooltip-title">${config.title}</div>
                    ` : ""}
                    ${config.content ? `
                        <div class="viz-tooltip-content">${config.content}</div>
                    ` : ""}
                </div>
            </div>
        `;
        const tooltipElement = UtilsNew.renderHTML(tooltipTemplate).querySelector("div.viz-tooltip");
        const tooltipState = {
            displayed: false,
            hovered: false,
        };

        // Register enter and leave listeners to the tooltip element if it is hoverable
        if (config.hoverable) {
            tooltipElement.addEventListener("mouseenter", () => {
                tooltipState.hovered = true;
            });
            tooltipElement.addEventListener("mouseleave", () => {
                tooltipState.hovered = false;
                if (tooltipState.displayed) {
                    document.body.removeChild(tooltipElement);
                    tooltipState.displayed = false;
                }
            });
        }

        // Mouse over the element --> append the tooltip to the document
        target.addEventListener("mouseenter", event => {
            if (!tooltipState.displayed) {
                const tooltipRect = event.currentTarget.getBoundingClientRect();

                document.body.appendChild(tooltipElement);
                tooltipElement.style.top = (window.scrollY + tooltipRect.top + tooltipRect.height) + "px";
                tooltipElement.style.left = (window.scrollX + tooltipRect.left + tooltipRect.width / 2) + "px";
                tooltipState.displayed = true;
            }
        });

        // Mouse out --> remove tooltip from document
        target.addEventListener("mouseleave", () => {
            UtilsNew.sleep(50).then(() => {
                if (!tooltipState.hovered && tooltipState.displayed) {
                    document.body.removeChild(tooltipElement);
                    tooltipState.displayed = false;
                }
            });
        });
    },

};
