class GeneRenderer {

    constructor(config) {
        this.config = this._getDefaultConfig().combine(config);
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
        this.config = this.config.combine(config);

        this._renderCoverage(data.coverage);
        this._renderLowCoverage(data.lowCoverage);
    }

    _renderCoverage(data) {
        // Draw the features
        let polyline = [];

        let maxHeight = this.config().height();

        let windowSize = data.windowSize;
        let start = data.start;

        let maximumCoverage = 0;
        // We get the maximum value to be able to scale
        for (let i = 0; i < data.values.length; i++) {
            if (maximumCoverage < data.values[i]) {
                maximumCoverage = data.values[i];
            }
        }

        let x = 0;
        let y = 0;
        let firstHeight = 0;
        let negativeX = 0;
        let yOfNegativeX = 0;

        for (let i = 0; i < data.values.length; i++) {
            let chromosomicPosition = start + (windowSize * i);

            if (chromosomicPosition > this.config().end()) {
                break;
            }

            x = this._calculatePixelPosition(chromosomicPosition);
            y = maxHeight - ((data.values[i] / maximumCoverage) * maxHeight);

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
        polyline.push(`${this.config().width()},100 0,100 0,${firstHeight}`);

        SVG.addChild(this.config().svgCanvas(), "polyline", {
            points: polyline.join(" "),
            stroke: "blue",
            fill: "gainsboro",
            "stroke-width": 0.2
        });
    }

    _renderLowCoverage(data) {
        let path = [];

        for (let i = 0; i < data.length; i++) {
            let start = data[i].start;
            let end = data[i].end;

            if (end < this.config().start()) {
                // We skip regions of low coverage that fall before the starting region that will be actually represented
                continue;
            }
            if (start > this.config().end()) {
                // We stop if we find regions of low coverage that fall after the ending region that will be actually represented
                break;
            }

            let pixelStart = this._calculatePixelPosition(start);
            let pixelEnd = this._calculatePixelPosition(end);

            path.push(`M ${pixelStart} 0 H ${pixelEnd} V 100 H ${pixelStart}`);
        }

        SVG.addChild(this.config().svgCanvas(), "path", {
            d: path.join(" "),
            // stroke: "black",
            // "stroke-width": 0.5,
            fill: "red",
            "fill-opacity": 0.5,
        });
    }

    _calculatePixelPosition(position) {
        return (position - this.config().start()) * this.config().scaleFactor();
    }

    get config() {
        return this._config;
    }

    _getDefaultConfig() {

    }

}

class GeneRendererConfig {

    constructor(svgCanvas, scaleFactor, width, height, start, end) {
        /*
        * SVG component
        * */
        this._svgCanvas = svgCanvas;

        /*
        * Scale factor (old pixelBase) -> width (pixels) / length (bps)
        * */
        this._scaleFactor = scaleFactor;

        /*
        * Height of the window where the coverage will be rendered
        * */
        this._height = height;

        /*
        * Width of the window where the coverage will be rendered
        * */
        this._width = width;

        /*
        * First position of the chromosomic region to be fitted in the window
        * */
        this._start = start;

        /*
        * Last position of the chromosomic region to be fitted in the window
        * */
        this._end = end;

    }

    combine(config) {
        let geneConfig = new GeneRendererConfig();
        geneConfig.svgCanvas = UtilsNew.isNotUndefinedOrNull(config.svgCanvas) ? config.svgCanvas : this.svgCanvas;
        geneConfig.scaleFactor = UtilsNew.isNotUndefinedOrNull(config.scaleFactor) ? config.scaleFactor : this.scaleFactor;
        geneConfig.height = UtilsNew.isNotUndefinedOrNull(config.height) ? config.height : this.height;
        geneConfig.width = UtilsNew.isNotUndefinedOrNull(config.width) ? config.width : this.width;
        geneConfig.start = UtilsNew.isNotUndefinedOrNull(config.start) ? config.start : this.start;
        geneConfig.end = UtilsNew.isNotUndefinedOrNull(config.end) ? config.end : this.end;
    }

    get svgCanvas() {
        return this._svgCanvas;
    }

    set svgCanvas(value) {
        this._svgCanvas = value;
    }

    get scaleFactor() {
        return this._scaleFactor;
    }

    set scaleFactor(value) {
        this._scaleFactor = value;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    get start() {
        return this._start;
    }

    set start(value) {
        this._start = value;
    }

    get end() {
        return this._end;
    }

    set end(value) {
        this._end = value;
    }
}