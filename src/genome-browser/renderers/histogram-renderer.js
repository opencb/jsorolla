class HistogramRenderer extends Renderer {

    constructor(args) {
        super(args);
        //Extend and add Backbone Events
        Object.assign(this, Backbone.Events);

        //set default args
        this.histogramHeight = 75;
        this.histogramColor = "#428bca";
        //    this.multiplier = 7;

        this.maxValue = 10;
        this.updateScale(args);
        //set instantiation args
        Object.assign(this, args);
    }

    _checkFeatureValue(feature) {
        if (feature.features_count === null) {
            //            var height = Math.log(features[i].absolute);
            if (feature.absolute !== 0 && feature.absolute > 0) {
                // take care of feature.absolute==1 counts and set scaled value to 0.2 as log(2) ~= 0.3
                feature.features_count = Math.max(0.2, Math.log(feature.absolute));
            } else {
                feature.features_count = 0;
            }
        }
    }

    /**
     * updates "this.multiplier" using "histogramMaxFreqValue" and "height"
     * @param args
     */
    updateScale(args) {
        if (args !== null) {
            if (args.height !== null) {
                this.histogramHeight = args.height * 0.95;
            }
            if (args.histogramMaxFreqValue !== null) {
                this.maxValue = args.histogramMaxFreqValue;
            }
        }
        //this.multiplier = 7;
        this.multiplier = this.histogramHeight / this.maxValue;
    }

    render(features, args) {
        features.sort(function (a, b) {
            return a.value.start - b.value.start;
        });

        let middle = args.width / 2;
        //console.log(middle);
        let points = "";

        this.updateScale(args);

        if (features.length > 0) {
            let firstFeature = features[0].value;
            let width = (firstFeature.end - firstFeature.start + 1) * args.pixelBase;
            let x = args.pixelPosition + middle - ((args.position - parseInt(firstFeature.start)) * args.pixelBase);

            this._checkFeatureValue(firstFeature);
            let height = firstFeature.features_count * this.multiplier;

            points = (x - (width / 2)).toFixed(1) + "," + this.histogramHeight.toFixed(1) + " ";
            points += (x - (width / 2)).toFixed(1) + "," + (this.histogramHeight - height).toFixed(1) + " ";
        }
        for (let i = 0, len = features.length; i < len; i++) {
            let feature = features[i].value;
            feature.start = parseInt(feature.start);
            feature.end = parseInt(feature.end);
            let width = (feature.end - feature.start + 1) * args.pixelBase;
            let x = args.pixelPosition + middle - ((args.position - feature.start) * args.pixelBase);

            this._checkFeatureValue(feature);
            let height = feature.features_count * this.multiplier;

            points += (x + (width / 2)).toFixed(1) + "," + (this.histogramHeight - height).toFixed(1) + " ";
        }
        if (features.length > 0) {
            let lastFeature = features[features.length - 1].value;
            let width = (lastFeature.end - lastFeature.start + 1) * args.pixelBase;
            let x = args.pixelPosition + middle - ((args.position - parseInt(lastFeature.start)) * args.pixelBase);

            this._checkFeatureValue(lastFeature);
            let height = lastFeature.features_count * this.multiplier;

            points += (x + (width)).toFixed(1) + "," + (this.histogramHeight - height).toFixed(1) + " ";
            points += (x + (width)).toFixed(1) + "," + this.histogramHeight.toFixed(1) + " ";
        }

        if (points !== "") {
            SVG.addChild(args.svgCanvasFeatures, "polyline", {
                "points": points,
                //        "stroke": "#000000",
                //        "stroke-width": 0.2,
                "fill": this.histogramColor,
                "cursor": "pointer"
            });

        }
    }
}
