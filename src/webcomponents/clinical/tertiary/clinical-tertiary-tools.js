import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../workflow/analysis/tool-executor.js";

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
            toolId: "",
        };
        this._tools = [];
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.fetchTools();
        }

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
            this._toolParams = {
                ...this.DEFAULT_TOOLPARAMS,
                ...this.toolParams,
            };
        }
    }

    fetchTools() {
        if (this.opencgaSession) {
            this.opencgaSession.opencgaClient.userTool()
                .search({
                    scope: "CLINICAL_INTERPRETATION_ANALYSIS",
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._tools = response.responses[0].results || [];
                    this._config = this.getDefaultConfig();
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching tools: ", response);
                });
        }
    }

    onFieldChange(event) {
        this._toolParams = {...this._toolParams};
        this.requestUpdate();
    }

    onToolExecutorChange(event) {
        this._toolParams = {
            ...this._toolParams,
            ...event.detail,
        };
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
                    elements: [
                        {
                            name: "Select Clinical Analysis Tool",
                            field: "toolId",
                            type: "select",
                            allowedValues: this._tools.map(t => t.id),
                            display: {
                                placeholder: "Select a tool...",
                            },
                        },
                        {
                            name: "Tool Configuration",
                            type: "custom",
                            display: {
                                visible: data => !!data.toolId,
                                render: (fieldValue, dataFormChange, updateParams, data) => html`
                                    <tool-executor
                                        .opencgaSession="${this.opencgaSession}"
                                        .toolId="${data.toolId}"
                                        .toolParams="${{
                                            variables: {
                                                clinicalAnalysisId: "",
                                            },
                                        }}"
                                        .displayConfig="${{
                                            titleVisible: false,
                                            buttonsVisible: false,
                                        }}"
                                        @toolParamsChange="${event => this.onToolExecutorChange(event)}">
                                    </tool-executor>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-tools", ClinicalTertiaryTools);

