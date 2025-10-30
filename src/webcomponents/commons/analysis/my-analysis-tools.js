import {html, LitElement, nothing} from "lit";
import ModalUtils from "../modal/modal-utils.js";
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
        this._showExecuteDockerToolModal = false;
        this._config = this.getDefaultConfig();
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
                    }}">
                </tool-analysis>
            `,
        });
    }

    render() {
        return html`
            <tool-header
                .title="${this._config.title}"
                .rightContent="${this.renderRightContent()}">
            </tool-header>
            <vertical-menu
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config || {}}">
            </vertical-menu>

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
            menu: [
                {
                    id: "custom-tools",
                    name: "Custom Tools",
                    submenu: [
                        {
                            id: "tool-analysis",
                            name: "Execute Docker Tool",
                            render: opencgaSession => html`
                                <tool-analysis
                                    .opencgaSession="${opencgaSession}">
                                </tool-analysis>
                            `,
                        },
                        {
                            id: "custom-tool-builder",
                            name: "Tool Docker Builder",
                            render: opencgaSession => html`
                                <custom-tool-builder
                                    .opencgaSession="${opencgaSession}">
                                </custom-tool-builder>
                            `,
                        },
                    ],
                },
                {
                    id: "workflows",
                    name: "Workflows",
                    submenu: [
                        {
                            id: "workflow-analysis",
                            name: "Workflow Executor",
                            render: opencgaSession => html`
                                <tool-executor
                                    .opencgaSession="${opencgaSession}">
                                </tool-executor>
                            `,
                        },
                    ],
                },
                {
                    id: "variant-walker",
                    name: "Variant Walker",
                    submenu: [
                        {
                            id: "variant-walker",
                            name: "Custom Variant Walker",
                            description: "",
                            render: opencgaSession => html`
                                <div>Variant Walker tool</div>
                            `,
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("my-analysis-tools", MyAnalysisTools);
