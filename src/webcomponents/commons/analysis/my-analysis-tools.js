import {html, LitElement, nothing} from "lit";
import {keyed} from "lit/directives/keyed.js";
import ModalUtils from "../modal/modal-utils.js";
import "../empty-state.js";
import "../tool-header.js";
import "../view/vertical-menu.js";
import "../../job/analysis/tool-analysis.js";
import "../../job/analysis/custom-tool-builder.js";
import "../../workflow/analysis/tool-executor.js";

export default class MyAnalysisTools extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.MENU_SECTIONS = [
            {type: "CUSTOM_TOOL", name: "Custom Tools"},
            {type: "WORKFLOW", name: "Workflows"},
            // {type: "VARIANT_WALKER", name: "Variant Walker"},
        ];

        this._customTools = [];
        this._showExecuteDockerToolModal = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._customTools = [];
        if (this.opencgaSession) {
            this.opencgaSession.opencgaClient.userTool()
                .search({
                    study: this.opencgaSession.study.fqn,
                    limit: 1000,
                    include: "id,name,type",
                })
                .then(response => {
                    this._customTools = response.responses[0].results;
                })
                .catch(response => {
                    console.error(response);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    this.requestUpdate();
                });
        }
    }

    onExecuteDockerToolModalShow() {
        this._showExecuteDockerToolModal = true;
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show("ExecuteDockerTool");
        });
    }

    renderRightContent() {
        return html`
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-light d-flex align-items-center gap-2" @click="${() => this.onExecuteDockerToolModalShow()}">
                    <i class="fas fa-rocket"></i>
                    <span>Execute Docker Tool</span>
                </button>
            </div>
        `;
    }

    renderExecuteDockerToolModal() {
        return ModalUtils.create(this, "ExecuteDockerTool", {
            display: {
                modalTitle: "Execute Docker Tool",
                modalSize: "modal-xl",
                modalCyDataName: "modal-execute-docker-tool",
            },
            render: () => html`
                <tool-analysis
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                        showTitle: false,
                    }}"
                    @toolAnalysisSubmit="${() => {
                        ModalUtils.close("ExecuteDockerTool");
                        this._showExecuteDockerToolModal = false;
                        this.requestUpdate();
                    }}">
                </tool-analysis>
            `,
        });
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <tool-header
                .title="${this._config.title}"
                .rightContent="${this.renderRightContent()}">
            </tool-header>
            ${this._customTools?.length === 0 ? html`
                <empty-state
                    .title="${"No custom tools found."}"
                    .description="${html`Use the <b>My Tools Manager</b> tool to register or import custom tools, or <b>Execute Docker tools</b> directly.`}">
                </empty-state>
            ` : nothing}
            ${this._customTools?.length > 0 ? keyed(this.opencgaSession?.study?.fqn + "." + this._customTools?.length, html`
                <vertical-menu
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}">
                </vertical-menu>
            `) : nothing}

            ${this._showExecuteDockerToolModal ? this.renderExecuteDockerToolModal() : nothing}
        `;
    }

    getDefaultConfig() {
        return {
            title: "My Analysis Tools",
            display: {
                contentClassName: "mx-auto",
                contentStyle: "max-width:920px;",
                menuStyle: "width:240px",
            },
            menu: this.MENU_SECTIONS.map(section => {
                // 1. filter tools included in this section type
                const tools = this._customTools.filter(tool => {
                    return tool.type === section.type;
                });

                // 2. return the section configuration
                return {
                    id: section.type.toLowerCase(),
                    name: section.name,
                    submenu: tools.map(tool => ({
                        id: tool.id,
                        name: tool.name || tool.id,
                        render: opencgaSession => html`
                            <h2 class="fw-bold mb-3">Execute ${tool.name || tool.id}</h2>
                            <tool-executor
                                .toolParams="${{
                                    id: tool.id,
                                }}"
                                .displayConfig="${{
                                    titleVisible: false,
                                }}"
                                .opencgaSession="${opencgaSession}">
                            </tool-executor>
                        `,
                    })),
                };
            }),
        };
    }

}

customElements.define("my-analysis-tools", MyAnalysisTools);
