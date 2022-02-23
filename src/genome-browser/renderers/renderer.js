// import {SVG} from "../../core/svg.js";

export default class Renderer {

    constructor(config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.config = {
            ...this.getDefaultConfig(),
            fontClass: "ocb-font-roboto ocb-font-size-11",
            toolTipfontClass: "ocb-tooltip-font",
            ...config,
        };
    }

    // Placeholder getDefaultConfig
    getDefaultConfig() {
        return {};
    }

}
