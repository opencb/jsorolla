class VariantTrack extends FeatureTrack {

    constructor(args) {
        super(args);

        this.DEFAULT_EXCLUDE = "studies,annotation";

        // set user args
        Object.assign(this, args);

        // init dataAdapter and renderer
        this.histogramRenderer = new HistogramRenderer(args);
        this._init();

        this.resource = this.dataAdapter.resource;
        this.species = this.dataAdapter.species;
    }

    _init() {
        // Set OpenCGA adapter as default. OpenCGA Client constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {
        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            if (UtilsNew.isNotUndefinedOrNull(this.opencga)) {
                if (UtilsNew.isNotUndefinedOrNull(this.opencga.client)) {
                    this.dataAdapter = new OpencgaAdapter(this.opencga.client, "analysis/variant", "", "query", {
                        studies: this.opencga.studies,
                        exclude: this.DEFAULT_EXCLUDE
                    }, {
                        chunkSize: 10000
                    });
                }

                if (UtilsNew.isNotUndefinedOrNull(this.opencga.samples) && this.opencga.samples.length !== 0) {
                    this.dataAdapter.params.exclude = "studies.files,studies.stats,annotation";
                    this.dataAdapter.params.returnedSamples = this.opencga.samples;
                }

                if (UtilsNew.isNotUndefinedOrNull(this.opencga.files) && this.opencga.files.length !== 0) {
                    this.dataAdapter.params.exclude = "studies.files,studies.stats,annotation";
                    this.dataAdapter.params.file = this.opencga.files;
                }
            } else {
                console.error("No 'dataAdapter' or 'opencga' object provided");
            }
        }

        // Set FeatureRenderer as default
        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            let customConfig = {};
            if (UtilsNew.isNotUndefinedOrNull(this.opencga)) {
                customConfig = Object.assign(customConfig, this.opencga.config);
                customConfig.sampleNames = UtilsNew.isNotEmptyArray(this.opencga.samples) ? this.opencga.samples : this.opencga.files;
            }

            this.renderer = new VariantRenderer(
                { config: customConfig }
            );
        }
        this.renderer.track = this;
    }

    initializeDom(targetId) {
        //TODO Create a button for configuration
        this._initializeDom(targetId);

        this.main = SVG.addChild(this.contentDiv, "svg", {
            "class": "trackSvg",
            "x": 0,
            "y": 0,
            "width": this.width
        });

        this.svgCanvasFeatures = SVG.addChild(this.main, "svg", {
            "class": "features",
            "x": -this.pixelPosition,
            "width": this.svgCanvasWidth
        });

        this.updateHeight();
        this.renderer.init();
    }

    getDataHandler(event) {
        //console.time("Total VariantTrack -> getDataHandler " + event.sender.category);
        //
        //console.time("Chunks() VariantTrack -> getDataHandler " + event.sender.category);
        let renderer;
        let features;
        if (event.dataType !== "histogram" || UtilsNew.isNotUndefinedOrNull(this.renderer.config.sampleNames)) {
            renderer = this.renderer;
            features = this.getFeaturesToRenderByChunk(event);

            console.timeEnd("Chunks() FeatureTrack -> getDataHandler " + event.sender.category);

            console.time("render() FeatureTrack -> getDataHandler " + event.sender.category);
            renderer.render(features, {
                cacheItems: event.items,
                svgCanvasFeatures: this.svgCanvasFeatures,
                featureTypes: this.featureTypes,
                renderedArea: this.renderedArea,
                pixelBase: this.pixelBase,
                position: this.region.center(),
                regionSize: this.region.length(),
                maxLabelRegionSize: this.maxLabelRegionSize,
                width: this.width,
                pixelPosition: this.pixelPosition,
                resource: this.resource,
                species: this.species,
                featureType: this.featureType
            });
            //console.timeEnd("render() VariantTrack -> getDataHandler " + event.sender.category);

            this.updateHeight();
            //console.timeEnd("Total VariantTrack -> getDataHandler " + event.sender.category);

        } else { //(event.dataType == "histogram") {

            renderer = this.histogramRenderer;
            for ( let i = 0; i < event.items.length; i ++){
                features = event.items[i];

                //console.timeEnd("Chunks() VariantTrack -> getDataHandler " + event.sender.category);
                //
                //console.time("render() VariantTrack -> getDataHandler " + event.sender.category);
                renderer.render(features, {
                    cacheItems: features,
                    svgCanvasFeatures: this.svgCanvasFeatures,
                    featureTypes: this.featureTypes,
                    renderedArea: this.renderedArea,
                    pixelBase: this.pixelBase,
                    position: this.region.center(),
                    regionSize: this.region.length(),
                    maxLabelRegionSize: this.maxLabelRegionSize,
                    width: this.width,
                    pixelPosition: this.pixelPosition,
                    resource: this.resource,
                    species: this.species,
                    featureType: this.featureType
                });
                //console.timeEnd("render() VariantTrack -> getDataHandler " + event.sender.category);

                this.updateHeight();
                //console.timeEnd("Total VariantTrack -> getDataHandler " + event.sender.category);
            }
        }

    }

}
