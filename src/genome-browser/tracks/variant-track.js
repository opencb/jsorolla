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

    _init(args) {
        // constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {
        // set CellBase adapter as default
        if (typeof this.dataAdapter === "undefined") {
            let opencgaConfig = new OpenCGAClientConfig(args.opencga.host, args.opencga.version, args.opencga.species);
            opencgaConfig.cache.active = false;
            this.dataAdapter = new OpencgaAdapter(new OpenCGAClient(opencgaConfig), "analysis/variant", "", "variant", {}, { chunkSize: 100000 });
        }

        // set a default geneRenderer
        if (typeof this.renderer === "undefined") {
            this.renderer = new FeatureRenderer({});
        }
    }
    


}
