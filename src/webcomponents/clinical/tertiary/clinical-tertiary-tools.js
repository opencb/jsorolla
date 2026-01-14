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
            toolId: {
                type: String,
            },
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
        this.toolId = "";
        this.toolParams = {};

        this._tools = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.fetchTools();
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("toolId")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
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
                })
                .finally(() => {
                    // check if no toolId selected, and set a default one
                    if (!this.toolId && this._tools.length > 0) {
                        this.onToolIdChange(this._tools[0].id);
                    }
                });
        }
    }

    onToolIdChange(selectedTool) {
        LitUtils.dispatchCustomEvent(this, "toolIdChange", selectedTool)
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
                .data="${this.toolParams}"
                .config="${this._config}">
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
                            render: () => html`
                                <div
                                    class="border rounded-3 p-3 ${this.toolId === tool.id ? "border-primary bg-primary-subtle" : "cursor-pointer bg-white"}"
                                    @click="${() => this.onToolIdChange(tool.id)}">
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
                        visible: () => !!this.toolId,
                    },
                    render: () => html`
                        <tool-executor
                            .opencgaSession="${this.opencgaSession}"
                            .toolId="${this.toolId}"
                            .toolParams="${this.toolParams}"
                            .disabledParams="${[
                                "clinicalAnalysisId",
                            ]}"
                            .displayConfig="${{
                                titleVisible: false,
                                buttonsVisible: false,
                            }}">
                        </tool-executor>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-tools", ClinicalTertiaryTools);

