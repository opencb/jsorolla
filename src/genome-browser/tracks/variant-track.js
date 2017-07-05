class VariantTrack extends FeatureTrack {
    constructor(args) {
        super(args);
        console.log("Variant-TRack constructor");
        this.resource = this.dataAdapter.resource;
        this.species = this.dataAdapter.species;
    }

    initializeDom(targetId) {
        //TODO Create a button for configuration
        this._initializeDom(targetId);

        this.main = SVG.addChild(this.contentDiv, 'svg', {
            'class': 'trackSvg',
            'x': 0,
            'y': 0,
            'width': this.width
        });
        this.svgCanvasFeatures = SVG.addChild(this.main, 'svg', {
            'class': 'features',
            'x': -this.pixelPosition,
            'width': this.svgCanvasWidth
        });
        this.updateHeight();
        this.renderer.init();
    }

    draw() {
        let _this = this;
        console.log("en el draw del variant-track");

        this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
        this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
        this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;

        this.updateHistogramParams();
        this.clean();

        this.dataType = 'features';
        if (this.histogram) {
            this.dataType = 'histogram';
        }

        if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {
            this.setLoading(true);
            console.log("Getting variants");
            this.dataAdapter.getVariant({
                dataType: this.dataType,
                region: new Region({
                    chromosome: this.region.chromosome,
                    start: this.region.start - this.svgCanvasOffset * 2,
                    end: this.region.end + this.svgCanvasOffset * 2
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval
                }
            })
            .then(function (response) {
                _this.getDataHandler(response);
                _this.setLoading(false);
            })
            .catch(function(reason) {
                console.log("Variant Track draw error: " + reason)
            });

            //        this.invalidZoomText.setAttribute("visibility", "hidden");
        } else {
            //        this.invalidZoomText.setAttribute("visibility", "visible");
        }
        this.updateHeight();
    }

    move(disp) {
        let _this = this;

        this.dataType = 'features';
        if (this.histogram) {
            this.dataType = 'histogram';
        }

        _this.region.center();
        let pixelDisplacement = disp * _this.pixelBase;
        this.pixelPosition -= pixelDisplacement;

        //parseFloat important
        let move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
        this.svgCanvasFeatures.setAttribute("x", move);

        let virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
        let virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

        if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {

            if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
                console.log("Getting variants Move");
                this.dataAdapter.getVariant({
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
                        interval: this.interval
                    },
                    done: function (event) {
                        _this.getDataHandler(event);
                    }
                })
                .then(function (response) {
                    _this.getDataHandler(response);
                })
                .catch(function(reason) {
                    console.log("Variant Track move error: " + reason)
                });
                this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
            }

            if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
                this.dataAdapter.getVariant({
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
                        interval: this.interval
                    }
                })
                .then(function (response) {
                    _this.getDataHandler(response);
                })
                .catch(function(reason) {
                    console.log("Variant Track move error: " + reason)
                });
                this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
            }
        }

        if (this.autoHeight == true) {
            this.updateHeight();
        }
    }
}
