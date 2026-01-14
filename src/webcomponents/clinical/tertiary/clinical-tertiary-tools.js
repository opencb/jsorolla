import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
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
            tool: null,
            commandLine: "",
            params: {},
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
        this._toolParams = {
            ...this.DEFAULT_TOOLPARAMS,
            ...this.toolParams,
        };
    }

    dispatchChange() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            ...this._toolParams,
        });
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
                    // set the first tool as selected by default
                    if (this._tools.length > 0 && !this._toolParams.tool) {
                        this._toolParams.tool = this._tools[0];
                    }
                    // this._toolParams = {
                    //     ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                    //     tool: this._tools.length > 0 ? this._tools[0] : null,
                    // };
                    this._config = this.getDefaultConfig();
                    this.requestUpdate();
                    this.dispatchChange();
                })
                .catch(response => {
                    console.error("An error occurred fetching tools: ", response);
                });
        }
    }

    onFieldChange(event) {
        this._toolParams = {...this._toolParams};
        this.requestUpdate();
        this.dispatchChange();
    }

    onToolChange(event, selectedTool) {
        this._toolParams = {
            tool: selectedTool,
        };
        this.requestUpdate();
        this.dispatchChange();
    }

    onToolExecutorChange(event) {
        this._toolParams = {
            ...this._toolParams,
            commandLine: event.detail.params.commandLine || "",
            params: event.detail.executionParams || {},
        };
        this.dispatchChange();
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
                @fieldChange="${event => this.onFieldChange(event)}">
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
                    display: {
                        separationClassName: "mb-2",
                    },
                    elements: (this._tools || []).map(tool => ({
                        type: "custom",
                        display: {
                            render: (data) => html`
                                <div
                                    class="border rounded-3 p-3 ${data.tool?.id === tool.id ? "border-primary bg-primary-subtle" : "cursor-pointer bg-white"}"
                                    @click="${event => this.onToolChange(event, tool)}">
                                    <div class="fw-bold">${tool.name || tool.id}</div>
                                    ${tool.description ? html`
                                        <div class="text-muted fs-7">${tool.description}</div>
                                    ` : nothing}
                                </div>
                            `,
                        },
                    })),
                },
                {
                    id: "tools-form",
                    display: {
                        visible: data => !!data.tool,
                    },
                    render: (data) => html`
                        <tool-executor
                            .opencgaSession="${this.opencgaSession}"
                            .toolId="${data?.tool?.id}"
                            .toolParams="${{
                                variables: {
                                    clinicalAnalysisId: "",
                                },
                            }}"
                            .disabledParams="${[
                                "clinicalAnalysisId",
                            ]}"
                            .displayConfig="${{
                                titleVisible: false,
                                buttonsVisible: false,
                            }}"
                            @toolParamsChange="${event => this.onToolExecutorChange(event)}">
                        </tool-executor>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-tools", ClinicalTertiaryTools);

