import {html, LitElement, nothing} from "lit";

export default class LayoutFooter extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            version: {
                type: String,
            },
            host: {
                type: Object,
            },
            config: {
                type: Object
            }
        };
    }

    renderVersion(name, version, url) {
        return html`
            <a class="d-inline-block text-gray-900 fs-7 text-decoration-none" href="${url}" target="blank">
                ${name} <sup>${version || ""}</sup>
            </a>
        `;
    }

    render() {
        return html`
            <div class="d-flex justify-content-between border-top py-4 mx-3">
                <div class=""></div>
                <div class="d-flex gap-3">
                    ${this.renderVersion("IVA (JSorolla)", "v" + this.version, "https://github.com/opencb/jsorolla")}
                    ${this.host?.opencga ? this.renderVersion("OpenCGA", this.host.opencga, "https://github.com/opencb/opencga") : nothing}
                    ${this.host?.cellbase ? this.renderVersion("CellBase", this.host.cellbase, "https://github.com/opencb/cellbase") : nothing}
                </div>
            </div>
        `;
    }

}

customElements.define("layout-footer", LayoutFooter);
