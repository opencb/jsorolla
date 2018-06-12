/**
  @param  args example:
        {
            height: number, <- height of div
            histogramColor: String
            histogramHeight: number <- height of histogram
            histogramMaxFreqValue: number
            ...
        }
 */
class HistogramRenderer extends Renderer {

    constructor(args) {
        super(args);
        //Extend and add Backbone Events
        Object.assign(this, Backbone.Events);

        //set default args
        this.histogramHeight = 75;
        this.histogramColor = "#428bca";

        this.maxValue = 10;
        this.updateScale(args);
        //set instantiation args
        Object.assign(this, args);

    }

    _checkFeatureValue(feature) {
        if (feature.features_count === null) {
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
            if (UtilsNew.isNotUndefinedOrNull(args.height)) {
                this.histogramHeight = args.height * 0.95;
            }
            if (UtilsNew.isNotUndefinedOrNull(args.histogramMaxFreqValue)) {
                this.maxValue = args.histogramMaxFreqValue;
            }
        }
        this.multiplier = this.histogramHeight / this.maxValue;
    }
    /**
    @param features  Array containing chunks example
            [   {chunkKey:"13:3298_histogram_10000"
                 region: Region{chromosome: "13", start:329800000, end:32980016}
                 value:{_id: 1940000, chromosome:"13", start: 32980000, end: 32980016, features_count:0},
                 ...
                 }
            ]
     @param args example
                {pixelPosition: number,
                position: number,
                svgCanvasFeatures
                }

     */
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
                "fill": this.histogramColor,
                "cursor": "pointer"
            });

        }
    }
}
