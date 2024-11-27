import {LitElement, html, nothing} from "lit";
import "../commons/tool-header.js";
import "../variant/analysis/sample-variant-stats-analysis.js";

export default class AnalysisTools extends LitElement {

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
        this._tool = "sample-variant-stats";
        this._config = this.getDefaultConfig();
    }

    renderSidebarItems() {
        return this._config.availableTools.map(tool => {
            if (tool.category) {
                return html`
                    <div class="fw-bold text-gray-700 fs-9 user-select-none">
                        ${tool.name}
                    </div>
                `
            } else {
                const active = this._tool === tool.id;
                return html`
                    <a class="d-block btn w-full text-start ${active ? "btn-primary" : "hover:bg-gray-200"}" href="#${tool.id}">
                        ${tool.name}
                    </a>     
                `;
            }
        });
    }

    renderTool() {
        let content = nothing;
        switch (this._tool) {
            case "sample-variant-stats":
                content = html`
                    <sample-variant-stats-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </sample-variant-stats-analysis>
                `;
                break;
        }
        return content;
    }

    render() {
        return html`
            <tool-header
                .title="${"Analysis Tools"}"
                .icon="${"fa-tools"}">
            </tool-header>
            <div class="row w-full">
                <div class="col-2 d-flex flex-column gap-1">
                    ${this.renderSidebarItems()}
                </div>
                <div class="col-10">
                    <div class="w-full mx-auto" style="max-width:768px;">
                        ${this.renderTool()}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            availableTools: [
                {name: "Summary Stats", category: true},
                {id: "sample-variant-stats", name: "Sample Variant Stats"},
                {id: "cohort-variant-stats", name: "Cohort Variant Stats"},
            ],
        };
    }

}

customElements.define("analysis-tools", AnalysisTools);
