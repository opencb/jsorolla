import {LitElement, html, nothing} from "lit";

export default class HtmlViewer extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.active = true;
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

    updated(changedProperties) {
        if (changedProperties.has("data") || changedProperties.has("active")) {
            if (this.active && this.data) {
                const iframeElement = this.querySelector("iframe");
                iframeElement.contentWindow.document.open();
                iframeElement.contentWindow.document.write(this.data || "");
                iframeElement.contentWindow.document.close();
            }
        }
    }

    render() {
        if (!this.data) {
            return nothing;
        }

        return html`
            <iframe width="${this._config.width}" height="${this._config.height}"></iframe>
        `;
    }

    getDefaultConfig() {
        return {
            width: "100%",
            height: "720px",
        };
    }

}

customElements.define("html-viewer", HtmlViewer);
