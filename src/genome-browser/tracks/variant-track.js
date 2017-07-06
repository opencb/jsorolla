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


}
