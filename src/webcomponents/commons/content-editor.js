import {html, LitElement} from "lit";
import * as CodeCake from "codecake";
import LitUtils from "./utils/lit-utils.js";

export default class ContentEditor extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            content: {
                type: String,
            },
            config: {
                type: Object,
            },
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

    firstUpdated() {
        // 1. initialize the editor using the provided configuration
        const editor = CodeCake.create(this.querySelector("div"), {
            code: this.content || "",
            language: this._config.language,
            className: `codecake-${this._config.theme} ${this._config.editorClassName}`,
            style: this._config.editorStyle,
            lineNumbers: this._config.lineNumbers,
            highlight: (code, language) => {
                return CodeCake.highlight(code, language);
            },
        });

        // 2. listen to changes in the editor
        editor.onChange(newCode => {
            LitUtils.dispatchCustomEvent(this, "contentChange", newCode);
        });
    }

    render() {
        return html`
            <div class="${this._config.parentClassName}" style="min-height:0px;${this._config.parentStyle}"></div>
        `;
    }

    getDefaultConfig() {
        return {
            parentClassName: "w-full overflow-y-auto h-full rounded-3",
            parentStyle: "",
            editorClassName: "h-full",
            editorStyle: "",
            language: "",
            lineNumbers: true,
            theme: "dark",
        };
    }
}

customElements.define("content-editor", ContentEditor);
