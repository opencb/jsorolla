// import {SVG} from "../../core/svg.js";

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

    // Placeholder getDefaultConfig
    getDefaultConfig() {
        return {};
    }

}
