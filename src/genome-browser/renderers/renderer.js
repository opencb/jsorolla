import {SVG} from "../../core/svg.js";


export default class Renderer {

    constructor(config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.fontClass = "ocb-font-roboto ocb-font-size-11";
        this.toolTipfontClass = "ocb-tooltip-font";
    }

    // Returns svg feature x value from feature genomic position
    // TODO: move to utils?
    getFeatureX(start, args) {
        const middle = args.width / 2;
        return args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
    }

    // Placeholder getDefaultConfig
    getDefaultConfig() {
        return {};
    }

}
