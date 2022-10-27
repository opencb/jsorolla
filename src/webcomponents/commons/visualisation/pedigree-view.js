
import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";


export default class PedigreeView extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            family: {
                type: Object
            },
            active: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this._results = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("family")) {
            this.pedigree()
        }
    }

    pedigree( ) {
        this.svg = SVG().addTo(`#${this._prefix}pedigree`).size(10, 10).attr({style: "border: 1px solid #cacaca"});
        this.rect = this.svg.rect(1, 1).attr({fill: "#fff", x: this._config.board.originX, y: this._config.board.originY});

        this.draw = this.svg.group();

    }

    getDefaultConfig() {
        return {

        };
    }

    render() {
        return html`
        <div id="${this._prefix}pedigree">
        </div>
        `;
    }

}

customElements.define("pedigree-view", PedigreeView);
