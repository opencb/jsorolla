import {LitElement, html} from "lit";
import "./genome-browser.js";

export default class SplitGenomeBrowser extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            regions: {
                type: Array,
            },
            species: {
                type: String,
            },
            tracks: {
                type: Array,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    render() {
        if (!this.opencgaSession) {
            return null;
        }

        return html`
            <div class="row">
                ${this.regions.map(region => html`
                    <div class="col-md-6">
                        <genome-browser
                            .opencgaSession="${this.opencgaSession}"
                            .region="${region}"
                            .active="${this.active}"
                            .species="${this.species}"
                            .tracks="${this.tracks}"
                            .config="${this.config}">
                        </genome-browser>
                    </div>
                `)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("split-genome-browser", SplitGenomeBrowser);
