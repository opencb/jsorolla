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
                document.body.appendChild(tooltipElement);
                const targetPosition = event.currentTarget.getBoundingClientRect();
                tooltipElement.style.top = (targetPosition.top + targetPosition.height) + "px";
                tooltipElement.style.left = (targetPosition.left + targetPosition.width / 2) + "px";
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
