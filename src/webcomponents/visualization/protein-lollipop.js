import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import ProteinLollipopViz from "../../core/visualisation/protein-lollipop.js";

export default class ProteinLollipop extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
    }

    updated(changedProperties) {
        // TODO
    }

    render() {
        return html`
            <div id="${this._prefix}ProteinLollipop" style="width:100%;"></div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("protein-lollipop", ProteinLollipop);
