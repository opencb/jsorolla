import {LitElement, html} from "lit";
import "../../commons/view/detail-tabs.js";
import "../../commons/json-viewer.js";

export default class PharmacogenomicsDetail extends LitElement {

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
                type: Object
            },
            variant: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    render() {
        return html`
            <detail-tabs
                .data="${this.variant}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Selected Variant: ",
            showTitle: true,
            items: [
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (variant, active) => html`
                        <json-viewer
                            .data="${variant?.annotation?.pharmacogenomics || {}}"
                            .active="${active}">
                        </json-viewer>
                    `,
                }
            ]
        };
    }

}

customElements.define("pharmacogenomics-detail", PharmacogenomicsDetail);
