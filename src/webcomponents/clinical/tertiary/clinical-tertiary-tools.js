import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";

export default class ClinicalTertiaryTools extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolParams: {
                type: Object,
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
        this.DEFAULT_TOOLPARAMS = {
            tools: [],
            newToolName: "",
            newToolVersion: "",
        };
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParamsObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    toolParamsObserver() {
        if (this.toolParams) {
            this._toolParams = {...this.DEFAULT_TOOLPARAMS, ...this.toolParams};
        } else {
            this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        }
    }

    onFieldChange(event) {
        const {field, value} = event.detail;
        this._toolParams = {
            ...this._toolParams,
            [field]: value,
        };
        this.dispatchEvent(new CustomEvent("paramsChange", {
            detail: this._toolParams,
            bubbles: true,
            composed: true,
        }));
    }

    onClear() {
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Select Tools",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Tools Configuration",
                    elements: [
                        {
                            title: "Select Tools",
                            field: "tools",
                            type: "table",
                            display: {
                                getData: data => data?.tools || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No tools selected.",
                                columns: [
                                    {
                                        title: "Tool Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Version",
                                        field: "version",
                                    },
                                    {
                                        title: "Enabled",
                                        field: "enabled",
                                        type: "custom",
                                        display: {
                                            render: (enabled, dataFormFieldChange, updateParams, data, row) => html`
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    ?checked="${enabled || false}"
                                                    @change="${event => {
                                                        const updatedTools = (data?.tools || []).map(tool => 
                                                            tool.name === row.name ? {...tool, enabled: event.target.checked} : tool
                                                        );
                                                        dataFormFieldChange(updatedTools);
                                                    }}">
                                            `,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            title: "Add Tool",
                            type: "custom",
                            display: {
                                render: () => {
                                    return html`
                                        <div class="d-flex gap-2">
                                            <input
                                                type="text"
                                                class="form-control"
                                                placeholder="Tool name"
                                                .value="${this._toolParams.newToolName || ""}"
                                                @input="${e => {
                                                    this._toolParams.newToolName = e.target.value;
                                                    this.requestUpdate();
                                                }}">
                                            <input
                                                type="text"
                                                class="form-control"
                                                placeholder="Version"
                                                .value="${this._toolParams.newToolVersion || ""}"
                                                @input="${e => {
                                                    this._toolParams.newToolVersion = e.target.value;
                                                    this.requestUpdate();
                                                }}">
                                            <button
                                                class="btn btn-primary"
                                                @click="${() => {
                                                    if (this._toolParams.newToolName) {
                                                        const updatedTools = [...(this._toolParams.tools || []), {
                                                            name: this._toolParams.newToolName,
                                                            version: this._toolParams.newToolVersion || "",
                                                            enabled: true,
                                                        }];
                                                        this._toolParams = {
                                                            ...this._toolParams,
                                                            tools: updatedTools,
                                                            newToolName: "",
                                                            newToolVersion: "",
                                                        };
                                                        this.dispatchEvent(new CustomEvent("paramsChange", {
                                                            detail: this._toolParams,
                                                            bubbles: true,
                                                            composed: true,
                                                        }));
                                                        this.requestUpdate();
                                                    }
                                                }}">
                                                Add
                                            </button>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-tools", ClinicalTertiaryTools);

