import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/empty-state.js";
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

    onToolChange(event, selectedTool) {
        this._toolParams = {
            toolId: selectedTool,
        };
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

        if (this._tools.length === 0) {
            return html`
                <empty-state
                    icon="fas fa-tools"
                    description="No clinical analysis tools available in the current study. Please contact your study administrator to register new tools.">
                </empty-state>
            `;
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
            title: "Configure Tool to Execute",
            display: {
                titleClassName: "mb-4",
                className: "row",
                layout: [
                    {
                        id: "tools-menu",
                        className: "col-md-3",
                    },
                    {
                        id: "tools-form",
                        className: "col-md-9",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "tools-menu",
                    elements: (this._tools || []).map(tool => ({
                        type: "custom",
                        display: {
                            render: (data) => html`
                                <div class="bg-white border rounded-3 p-4 ${data.toolId === tool.id ? "border-primary" : "cursor-pointer"}" @click="${event => this.onToolChange(event, tool.id)}">
                                    <div class="">${tool.name || tool.id}</div>
                                </div>
                            `,
                        },
                    })),
                },
                {
                    id: "tools-form",
                    display: {
                        visible: data => !!data.toolId,
                    },
                    render: (data) => html`
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
                // {
                //     elements: [
                //         {
                //             name: "Select Clinical Analysis Tool",
                //             field: "toolId",
                //             type: "select",
                //             allowedValues: this._tools.map(t => t.id),
                //             display: {
                //                 placeholder: "Select a tool...",
                //             },
                //         },
                //         {
                //             name: "Tool Configuration",
                //             type: "custom",
                //             display: {
                //                 visible: data => !!data.toolId,
                //                 render: (fieldValue, dataFormChange, updateParams, data) => html`
                //                     <tool-executor
                //                         .opencgaSession="${this.opencgaSession}"
                //                         .toolId="${data.toolId}"
                //                         .toolParams="${{
                //                             variables: {
                //                                 clinicalAnalysisId: "",
                //                             },
                //                         }}"
                //                         .displayConfig="${{
                //                             titleVisible: false,
                //                             buttonsVisible: false,
                //                         }}"
                //                         @toolParamsChange="${event => this.onToolExecutorChange(event)}">
                //                     </tool-executor>
                //                 `,
                //             },
                //         },
                //     ],
                // },
            ],
        };
    }

}

customElements.define("clinical-tertiary-tools", ClinicalTertiaryTools);

