class GeneTrack extends FeatureTrack {

    constructor(args) {
        super(args);

        this.DEFAULT_EXCLUDE = "transcripts.tfbs,transcripts.xrefs,transcripts.proteinSequence,transcripts.cDnaSequence,transcripts.exons.sequence,annotation";

        // set default values
        this.minTranscriptRegionSize = 200000;

        // set user args
        Object.assign(this, args);

        // init dataAdapter and renderer
        this.histogramRenderer = new HistogramRenderer(args);
        this._init();

        // These variables must be fixed in this GeneTrack
        this.dataType = "features";
        this.resource = this.dataAdapter.resource;
        this.species = this.dataAdapter.species;
    }

    _init() {
        // set CellBase adapter as default
        if (typeof this.dataAdapter === "undefined") {
            if (typeof this.cellbase !== "undefined" && this.cellbase !== null) {
                let cellBaseConfig = new CellBaseClientConfig(this.cellbase.host, this.cellbase.version, this.cellbase.species);
                cellBaseConfig.cache.active = false;
                this.dataAdapter = new CellBaseAdapter(new CellBaseClient(cellBaseConfig), "genomic", "region", "gene", {}, { chunkSize: 100000 });
            }
        }

        // set a default geneRenderer
        if (typeof this.renderer === "undefined") {
            this.renderer = new GeneRenderer({});
        }
    }

    getDataHandler(event) {
        if (typeof event !== "undefined") {

            let renderer;
            let features;
            if (event.dataType !== "histogram") {
                renderer = this.renderer;
                features = this.getFeaturesToRenderByChunk(event);
            } else {
                renderer = this.histogramRenderer;
                features = event.items;
            }

            renderer.render(features, {
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
    }

    draw() {
        if (this.region.length() < this.minTranscriptRegionSize) {
            this.exclude = this.DEFAULT_EXCLUDE;
        } else {
            this.exclude = "transcripts,annotation";
        }

        super.draw(this.dataAdapter, this.renderer);
    }

    move(disp) {
        let _this = this;

        this.dataType = "features";

        //if (!_.isUndefined(this.exclude)) {
        //    this.dataType = "features" + this.exclude;
        //}

        if (this.histogram) {
            this.dataType = "histogram";
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

        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {

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
                    //done: function (event) {
                    //    _this.getDataHandler(event);
                    //}
                })
                .then(function (response) {
                    _this.getDataHandler(response);
                })
                .catch(function(reason) {
                    console.log(`Gene Track move error: ${reason}`);
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
                    }
                    //},
                    //done: function (event) {
                    //    _this.getDataHandler(event);
                    //}
                })
                .then(function (response) {
                    _this.getDataHandler(response);
                })
                .catch(function(reason) {
                    console.log(`Gene Track move error: ${reason}`);
                });
                this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
            }
        }

        if (this.autoHeight === true) {
            this.updateHeight();
        }
    }
}
