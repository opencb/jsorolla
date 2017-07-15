//Parent class for all renderers
class Renderer {
    constructor(args) {

    }

    init() {

    }

    render(items) {
    }

    getFeatureX(start, args) {//returns svg feature x value from feature genomic position
        let middle = args.width / 2;
        let x = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
        return x;
    }

    getDefaultConfig(type) {
        return FEATURE_TYPES[type];
    }

    getLabelWidth(label, args) {
        /* insert in dom to get the label width and then remove it*/
        let svgLabel = SVG.create("text", {
            'font-weight': 400,
            'class':this.fontClass
        });
        svgLabel.textContent = label;
        $(args.svgCanvasFeatures).append(svgLabel);
        let svgLabelWidth = $(svgLabel).width();
        $(svgLabel).remove();
        return svgLabelWidth;
    }
}