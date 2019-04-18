class CoverageRenderer {

    constructor(target, config) {
        Object.assign(this, Backbone.Events);

        this.target = target;

        this.config = Object.assign({}, this._getDefaultConfig(), config);
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
        let _config = Object.assign({}, this.config, config);

        this._calculateScaleFactor(_config);

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

        for (let i = 0; i < data.values.length; i++) {
            let chromosomicPosition = start + (windowSize * i);

            x = this._calculatePixelPosition(chromosomicPosition, config);
            y = maxHeight - ((Math.min(data.values[i] / config.maxCoverage, 1)) * maxHeight);

            if (i === 0) {
                firstHeight = y;
            }

            polyline.push(`${x},${y}`);
        }

        // We will close the polyline
        polyline.push(`${x},100 0,100 0,${firstHeight}`);

        const coverage = SVG.addChild(config.target, "polyline", {
            points: polyline.join(" "),
            stroke: "blue",
            fill: "gainsboro",
            "stroke-width": 0.2
        });

        $(coverage).qtip({
            content: " ",
            position: { target: "mouse", adjust: { x: 15, y: 0 }, viewport: $(window), effect: false },
            style: { width: true, classes: 'qtip-bootstrap' },
            show: { delay: 300 },
            hide: { delay: 300 },
        });

        $(coverage).mousemove(function(event) {
            let centerPosition = data.start + Math.floor((data.end - data.start + 1) / 2);
            let mid = config.width / 2;
            let mouseLineOffset = config.scaleFactor / 2;
            let offsetX = event.clientX - config.target.getBoundingClientRect().left;

            let cX = offsetX - mouseLineOffset - config.pixelPosition;
            let rcX = (cX / config.scaleFactor) | 0;

            let posOffset = (mid / config.scaleFactor) | 0;
            let mousePosition = centerPosition + rcX - posOffset;

            const pos = Math.floor((mousePosition - parseInt(start)) / windowSize);
            if (pos < 0 || pos >= data.values.length) {
                return;
            }

            const str = `depth: <span class="ssel">${data.values[pos]}</span><br>`;
            $(coverage).qtip("option", "content.text", str);
        });

    }

    _renderLowCoverage(data, config) {
        if (UtilsNew.isUndefinedOrNull(data)) {
            return;
        }

        let path = [];

        let values = {};
        for (let i = 0; i < data.length; i++) {
            let start = data[i].start;
            let end = data[i].end;

            for (let j = 0; j < data[i].values.length; j++) {
                values[data[i].start + j] = data[i].values[j];
            }

            let pixelStart = this._calculatePixelPosition(start, config);
            let pixelEnd = this._calculatePixelPosition(end, config);

            if (pixelEnd === pixelStart) {
                // Increase 1 pixelEnd so the line is visible
                pixelEnd += 1;
                let position = this._calculateChromosomicPosition(pixelEnd, config);
                // Now we need to store the final value across all the positions
                let lastValue = data[i].values[data[i].values.length - 1];
                for (let i = end; i <= position; i++) {
                    values[i] = lastValue;
                }
            }

            path.push(`M ${pixelStart} 0 H ${pixelEnd} V 100 H ${pixelStart}`);
        }

        const lowCoverage = SVG.addChild(config.target, "path", {
            d: path.join(" "),
            style: "cursor: pointer",
            // stroke: "black",
            // "stroke-width": 0.5,
            fill: "red",
            "fill-opacity": 0.5,
        });

        $(lowCoverage).qtip({
            content: " ",
            position: { target: "mouse", adjust: { x: 15, y: 0 }, viewport: $(window), effect: false },
            style: { width: true, classes: 'qtip-red' },
            show: { delay: 300 },
            hide: { delay: 300 },
        });

        let _this = this;
        $(lowCoverage).mousemove(function(event) {
            let position = Math.floor(_this._calculateChromosomicPosition(event.clientX - config.target.getBoundingClientRect().left, config));
            const str = `depth: <span class="ssel">${values[position]}</span><br>`;
            $(lowCoverage).qtip("option", "content.text", str);
        });

        $(lowCoverage).click(function(event) {
            let position = Math.floor(_this._calculateChromosomicPosition(event.clientX - config.target.getBoundingClientRect().left, config));
            _this.trigger("lowCoverage:click", {
                position: position,
                value: values[position]
            });
        });
    }

    _calculateScaleFactor(config) {
        if (UtilsNew.isUndefinedOrNull(config.visibleStartPosition) || UtilsNew.isUndefinedOrNull(config.visibleEndPosition)) {
            throw "Missing 'visibleStartPosition' or 'visibleEndPosition' configuration fields."
        }

        config.scaleFactor = config.width / (config.visibleEndPosition - config.visibleStartPosition + 1);
    }

    _calculatePixelPosition(position, config) {
        return ((position - config.visibleStartPosition) * config.scaleFactor) + config.pixelPosition;
    }

    _calculateChromosomicPosition(pixel, config) {
        return (pixel + config.visibleStartPosition * config.scaleFactor - config.pixelPosition) / config.scaleFactor;
    }

    _getDefaultConfig() {
        return {
            // svgCanvas: undefined,
            // scaleFactor: undefined,

            height: 40,
            width: 240,
            // start: undefined,
            // end: undefined,
            maxCoverage: 100
        }
    }

}