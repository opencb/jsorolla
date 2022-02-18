import UtilsNew from "../../core/utilsNew.js";
import Region from "../../core/bioinfo/region.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class StatusBar {

    constructor(target, config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.target = target;
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.#init();
    }

    #init() {
        this.prefix = UtilsNew.randomString(8);
        this.region = new Region(this.config.region);

        this.#initDom();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" class="ocb-gb-status-bar">
                <div class="ocb-gv-status-left">
                    ${this.config.version}
                </div>
                <div class="ocb-gv-status-right">
                    <span id="${this.prefix}PositionBase" style="margin-right:4px"></span>
                    <span id="${this.prefix}PositionRegion"></span>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);
        this.mousePositionBase = this.div.querySelector(`span#${this.prefix}PositionBase`);
        this.mousePositionRegion = this.div.querySelector(`span#${this.prefix}PositionRegion`);

        this.target.appendChild(this.div);
    }

    draw() {
        // Nothing to do
    }

    setRegion(event) {
        this.region.load(event.region);
        this.mousePositionBase.textContent = "";
        this.mousePositionRegion.textContent = `${this.region.chromosome}:${event.region.center()}`;
    }

    setMousePosition(event) {
        this.mousePositionBase.style.color = GenomeBrowserConstants.SEQUENCE_COLORS[event.base];
        this.mousePositionBase.textContent = event.base;
        this.mousePositionRegion.textContent = `${this.region.chromosome}:${event.mousePos}`;
    }

    // Get default status bar config
    getDefaultConfig() {
        return {
            region: null,
            version: "",
        };
    }

}
