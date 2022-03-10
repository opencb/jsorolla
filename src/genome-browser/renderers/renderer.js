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

    // Get value from config
    getValueFromConfig(key, args) {
        return typeof this.config[key] === "function" ? this.config[key].apply(null, args) : this.config[key];
    }

    // Placeholder getDefaultConfig
    getDefaultConfig() {
        return {};
    }

}
