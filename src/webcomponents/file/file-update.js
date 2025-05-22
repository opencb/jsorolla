import {html, LitElement} from "lit";
import "../commons/opencga-update.js";
import "../commons/filters/catalog-distinct-autocomplete.js";

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
                            title: "Tags",
                            field: "tags",
                            type: "custom",
                            display: {
                                render: (tags, onFilterChange) => html`
                                    <catalog-distinct-autocomplete
                                        .opencgaSession="${this.opencgaSession}"
                                        .resource="${"FILE"}"
                                        .value="${(tags || []).join(",")}"
                                        .queryField="${"tags"}"
                                        .distinctFields="${"tags"}"
                                        .config="${{
                                            freeTag: true,
                                        }}"
                                        @filterChange="${event => onFilterChange(event.detail.value)}">
                                    </catalog-distinct-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description...",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("file-update", FileUpdate);
