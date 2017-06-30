class GeneTrack extends FeatureTrack {
    constructor(args) {
        super(args);
        //set default args
        this.minTranscriptRegionSize;

        //save default render reference;
        this.defaultRenderer = this.renderer;
        //    this.histogramRenderer = new FeatureClusterRenderer();
        this.histogramRenderer = new HistogramRenderer(args);

        //set instantiation args, must be last
        Object.assign(this, args);

        this.exclude;
    }

    getDataHandler(event) {
        let features;
        if (event.dataType == 'histogram') {
            this.renderer = this.histogramRenderer;
            features = event.items;
        } else {
            this.renderer = this.defaultRenderer;
            features = this.getFeaturesToRenderByChunk(event);
        }
        this.renderer.render(features, {
            cacheItems: event.items,
            svgCanvasFeatures: this.svgCanvasFeatures,
            renderedArea: this.renderedArea,
            pixelBase: this.pixelBase,
            position: this.region.center(),
            regionSize: this.region.length(),
            maxLabelRegionSize: this.maxLabelRegionSize,
            width: this.width,
            pixelPosition: this.pixelPosition

        });
        this.updateHeight();
    }

    updateTranscriptParams() {
        if (this.region.length() < this.minTranscriptRegionSize) {
            this.exclude = this.dataAdapter.params.exclude;
        } else {
            this.exclude = 'transcripts,chunkIds';
        }
    }

    draw() {
        // super.draw();

        this._setCanvasConfig();

        this.updateTranscriptParams();
        this.updateHistogramParams();
        this.clean();

        let dataType = 'features';
        /*
         if (!_.isUndefined(this.exclude)) {
         dataType = 'features' + this.exclude.replace(/[,.]/gi,'');
         }*/

        if (this.histogram) {
            dataType = 'histogram';
        }

        let _this = this;
        if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {
            this.setLoading(true);
            this.dataAdapter.getData({
                dataType: dataType,
                region: new Region({
                    chromosome: this.region.chromosome,
                    start: this.region.start - this.svgCanvasOffset * 2,
                    end: this.region.end + this.svgCanvasOffset * 2
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval,
                    exclude: this.exclude
                },
                done: function (event) {
                    _this.getDataHandler(event);
                    _this.setLoading(false);
                }
            });
        } else {
            //        this.invalidZoomText.setAttribute("visibility", "visible");
        }
        this.updateHeight();
    }

    move(disp) {
        let _this = this;

        this.dataType = 'features';

        if (!_.isUndefined(this.exclude)) {
            this.dataType = 'features' + this.exclude;
        }

        if (this.histogram) {
            this.dataType = 'histogram';
        }

        //    trackSvg.position = _this.region.center();
        _this.region.center();
        let pixelDisplacement = disp * _this.pixelBase;
        this.pixelPosition -= pixelDisplacement;

        //parseFloat important
        let move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
        this.svgCanvasFeatures.setAttribute("x", move);

        let virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
        let virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);
        // check if track is visible in this zoom

        //    console.log(virtualStart+'  ----  '+virtualEnd)
        //    console.log(this.svgCanvasLeftLimit+'  ----  '+this.svgCanvasRightLimit)
        //    console.log(this.svgCanvasOffset)

        if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {

            if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
                //          left
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: _this.region.chromosome,
                        start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset),
                        end: this.svgCanvasLeftLimit
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval,
                        exclude: this.exclude
                    },
                    done: function (event) {
                        _this.getDataHandler(event);
                    }
                });
                this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
            }

            if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
                //          right
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: _this.region.chromosome,
                        start: this.svgCanvasRightLimit,
                        end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset)
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval,
                        exclude: this.exclude
                    },
                    done: function (event) {
                        _this.getDataHandler(event);
                    }
                });
                this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
            }
        }

        if (this.autoHeight == true) {
            this.updateHeight();
        }
    }
}
