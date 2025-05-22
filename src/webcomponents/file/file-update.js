import {html, LitElement} from "lit";
import "../commons/opencga-update.js";

export default class FileUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            fileId: {
                type: String,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.fileId = "";
        this.displayConfig = {};
        this.active = true;

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    render() {
        return html `
            <opencga-update
                .resource="${"FILE"}"
                .componentId="${this.fileId}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active}"
                .config="${this._config}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a description...",
                            },
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "input-text",
                            display: {
                                placeholder: "tag1,tag2",
                                helpMessage: "Comma separated list of tags",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("file-update", FileUpdate);
