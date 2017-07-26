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
        if (typeof this.dataAdapter === "undefined" || this.dataAdapter === null) {
            if (typeof this.opencga !== "undefined" && this.opencga !== null) {
                // let opencgaClientConfig = new OpenCGAClientConfig(this.opencga.host, this.opencga.version);
                // opencgaConfig.cache.active = false;
                if (this.opencga.client !== undefined && this.opencga.client !== null) {
                    this.dataAdapter = new OpencgaAdapter(this.opencga.client, "analysis/variant", "", "query", {
                        studies: this.opencga.studies,
                        exclude: this.DEFAULT_EXCLUDE
                    }, {
                        chunkSize: 20000
                    });
                }

                if (typeof this.opencga.samples !== "undefined" && this.opencga.samples !== null && this.opencga.samples.length !== 0) {
                    this.dataAdapter.params.exclude = "studies.files,studies.stats,annotation";
                    this.dataAdapter.params.returnedSamples = this.opencga.samples;
                }
            } else {
                console.error("No 'dataAdapter' or 'opencga' object provided");
            }
        }

        // Set FeatureRenderer as default
        if (typeof this.renderer === "undefined" || this.renderer === null) {
            FEATURE_TYPES.variant.sampleNames = this.opencga.samples;
            this.renderer = new VariantRenderer(FEATURE_TYPES.variant);
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

}
