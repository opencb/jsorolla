class CoverageRenderer {

    constructor() {
    }

    /*
    * data: {
    *   "coverage": {
    *     "chromosome": "chr1",
          "start": 1000,
          "end": 15000,
          "windowSize": 1,
          "values": [
            0,
            2,
            ...

    *   }, {...}, ... ],
    *   "lowCoverage": [{
    *     "chromosome": "chr1",
          "start": 1000,
          "end": 15000,
          "windowSize": 1,
          "values": [
            0,
            2,
            ...
          ]
    *   }, {...}, ... ]
    * }
    * */
    render(data, config) {
        let _config = Object.assign({}, this._getDefaultConfig(), config);

        this._renderCoverage(data.coverage, _config);
        this._renderLowCoverage(data.lowCoverage, _config);
    }

    _renderCoverage(data, config) {
        // Draw the features
        let polyline = [];

        let maxHeight = config.height;

        let windowSize = data.windowSize;
        let start = data.start;

        let x = 0;
        let y = 0;
        let firstHeight = 0;
        let negativeX = 0;
        let yOfNegativeX = 0;

        for (let i = 0; i < data.values.length; i++) {
            let chromosomicPosition = start + (windowSize * i);

            if (chromosomicPosition > config.end) {
                break;
            }

            x = this._calculatePixelPosition(chromosomicPosition, config);
            y = maxHeight - ((Math.min(data.values[i] / config.maxCoverage, 1)) * maxHeight);

            if (x < 0) {
                negativeX = x;
                yOfNegativeX = y;
                continue;
            }
            if (typeof negativeX !== "undefined") {
                // Calculate slope
                let slope = (y - yOfNegativeX) / (x - negativeX);
                // Now we can calculate which would be the Y at the first start point (x = 0)
                // y = mx + b
                firstHeight = y - (slope * x);

                polyline.push(`0,${firstHeight}`);

                // We don't want to do this calculation again, so we simply deactivate negativeX variable
                negativeX = undefined;
            }

            polyline.push(`${x},${y}`);
        }

        // We will close the polyline
        polyline.push(`${config.width},100 0,100 0,${firstHeight}`);

        SVG.addChild(config.svgCanvas, "polyline", {
            points: polyline.join(" "),
            stroke: "blue",
            fill: "gainsboro",
            "stroke-width": 0.2
        });
    }

    _renderLowCoverage(data, config) {
        let path = [];

        for (let i = 0; i < data.length; i++) {
            let start = data[i].start;
            let end = data[i].end;

            if (end < config.start) {
                // We skip regions of low coverage that fall before the starting region that will be actually represented
                continue;
            }
            if (start > config.end) {
                // We stop if we find regions of low coverage that fall after the ending region that will be actually represented
                break;
            }

            let pixelStart = this._calculatePixelPosition(start, config);
            let pixelEnd = this._calculatePixelPosition(end, config);

            path.push(`M ${pixelStart} 0 H ${pixelEnd} V 100 H ${pixelStart}`);
        }

        SVG.addChild(config.svgCanvas, "path", {
            d: path.join(" "),
            // stroke: "black",
            // "stroke-width": 0.5,
            fill: "red",
            "fill-opacity": 0.5,
        });
    }

    _calculatePixelPosition(position, config) {
        return (position - config.start) * config.scaleFactor;
    }

    _getDefaultConfig() {
        return {
            svgCanvas: undefined,
            scaleFactor: undefined,
            height: undefined,
            width: undefined,
            start: undefined,
            end: undefined,
            maxCoverage: 60
        }
    }

}