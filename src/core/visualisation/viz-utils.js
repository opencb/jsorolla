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

};
