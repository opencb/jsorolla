import UtilsNew from "../../core/utilsNew.js";
import Region from "../../core/bioinfo/region.js";

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
        this.id = UtilsNew.randomString(8);
        this.region = new Region(this.config.region);

        this.#initDom();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.id}" class="ocb-gb-status-bar">
                <div class="ocb-gv-status-left">
                    ${this.config.version}
                </div>
                <div class="ocb-gv-status-right">
                    <span id="${this.id}PositionBase" style="margin-right:4px"></span>
                    <span id="${this.id}PositionRegion"></span>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.id}`);
        this.mousePositionBase = this.div.querySelector(`span#${this.id}PositionBase`);
        this.mousePositionRegion = this.div.querySelector(`span#${this.id}PositionRegion`);

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
        // TODO: move SEQUENCE_COLORS to global constants module
        this.mousePositionBase.style.color = SEQUENCE_COLORS[event.base];
        this.mousePositionBase.textContent = event.base;
        this.mousePositionRegion.textContent = `${this.region.chromosome}:${event.mousePos}`;
    }

    // Get default status bar config
    getDefaultConfig() {
        return {
            autoRender: true,
            region: null,
            version: "",
        };
    }

}
