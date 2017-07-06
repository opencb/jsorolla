class VariantTrack extends FeatureTrack {

    constructor(args) {
        super(args);

        this.DEFAULT_EXCLUDE = "studies,annotation";

        console.log("Variant-TRack constructor");


        // set user args
        Object.assign(this, args);

        // init dataAdapter and renderer
        this.histogramRenderer = new HistogramRenderer(args);
        this._init();

        this.resource = this.dataAdapter.resource;
        this.species = this.dataAdapter.species;
    }

    _init() {
        // set OpenCGA adapter as default. OpenCGA Client constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {
        if (typeof this.dataAdapter === "undefined" || this.dataAdapter === null) {
            if (typeof this.opencga !== "undefined" && this.opencga !== null) {
                let opencgaConfig = new OpenCGAClientConfig(this.opencga.host, this.opencga.version);
                // opencgaConfig.cache.active = false;
                this.dataAdapter = new OpencgaAdapter(new OpenCGAClient(opencgaConfig), "analysis/variant", "", "query", {
                    studies: this.opencga.studies,
                    exclude: this.DEFAULT_EXCLUDE
                }, {
                    chunkSize: 100000
                });
            }
        }

        // set a default geneRenderer
        if (typeof this.renderer === "undefined" || this.renderer === null) {
            this.renderer = new FeatureRenderer(FEATURE_TYPES.variant);
        }

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



}
