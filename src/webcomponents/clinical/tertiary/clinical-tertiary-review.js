import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";

export default class ClinicalTertiaryReview extends LitElement {

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
        this._params = null;
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
        this._params = this.toolParams;
    }

    render() {
        if (!this.opencgaSession || !this._params) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._params}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Review & Run",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Analysis Overview",
                    display: {
                        titleClassName: "h4 mb-3",
                    },
                    elements: [
                        {
                            title: "Study",
                            type: "custom",
                            display: {
                                render: () => {
                                    return html`
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fas fa-flask text-primary"></i>
                                            <span class="fw-bold">${this.opencgaSession?.study?.id || "N/A"}</span>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Analysis Date",
                            type: "custom",
                            display: {
                                render: () => {
                                    const date = new Date().toLocaleString();
                                    return html`
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fas fa-calendar text-primary"></i>
                                            <span>${date}</span>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Selected Clinical Analyses",
                    display: {
                        titleClassName: "h4 mb-3 mt-4",
                        visible: data => data?.clinicalAnalyses?.length > 0,
                    },
                    elements: [
                        {
                            field: "clinicalAnalyses",
                            type: "table",
                            display: {
                                className: "table table-hover shadow-sm",
                                defaultValue: html`
                                    <div class="alert alert-warning d-flex align-items-center gap-2">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <span>No clinical analyses selected.</span>
                                    </div>
                                `,
                                columns: [
                                    // {
                                    //     title: "#",
                                    //     field: "_index",
                                    //     type: "custom",
                                    //     display: {
                                    //         render: (value, row, index) => index + 1,
                                    //         defaultValue: "-",
                                    //     },
                                    // },
                                    {
                                        title: "Clinical Analysis ID",
                                        field: "id",
                                        type: "custom",
                                        display: {
                                            render: id => html`
                                                <div class="d-flex align-items-center gap-2">
                                                    <i class="fas fa-file-medical text-primary"></i>
                                                    <code class="text-primary">${id || "N/A"}</code>
                                                </div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Type",
                                        field: "type",
                                        type: "custom",
                                        display: {
                                            render: type => html`
                                                <span class="badge bg-info">${type || "N/A"}</span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Status",
                                        field: "status",
                                        type: "custom",
                                        display: {
                                            render: status => html`
                                                <span class="badge ${status === "READY" ? "bg-success" : "bg-warning"}">
                                                    ${status.id || "N/A"}
                                                </span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Proband",
                                        field: "proband.id",
                                        display: {
                                            defaultValue: "N/A",
                                        },
                                    },
                                    {
                                        title: "Sample",
                                        field: "proband.samples",
                                        type: "custom",
                                        display: {
                                            render: samples => html`
                                                <span class="badge bg-secondary">${samples[0]?.id || "N/A"}</span>
                                            `,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Selected Tool",
                    display: {
                        titleClassName: "h4 mb-3 mt-4",
                        visible: data => data?.tool?.id,
                    },
                    elements: [
                        {
                            field: "tool",
                            type: "custom",
                            display: {
                                render: tool => {
                                    if (!tool || !tool.id) {
                                        return html`
                                            <div class="alert alert-warning d-flex align-items-center gap-2">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                <span>No tool selected.</span>
                                            </div>
                                        `;
                                    }
                                    return html`
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <div class="d-flex align-items-start gap-3">
                                                            <div class="bg-primary bg-opacity-10 rounded p-3">
                                                                <i class="fas fa-tools text-primary fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <div class="text-muted small mb-1">Tool ID</div>
                                                                <div class="fw-bold">${tool.id}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="d-flex align-items-start gap-3">
                                                            <div class="bg-success bg-opacity-10 rounded p-3">
                                                                <i class="fas fa-code-branch text-success fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <div class="text-muted small mb-1">Version</div>
                                                                <div class="fw-bold">${tool.version || "Latest"}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="d-flex align-items-start gap-3">
                                                            <div class="bg-info bg-opacity-10 rounded p-3">
                                                                <i class="fas fa-tag text-info fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <div class="text-muted small mb-1">Type</div>
                                                                <div class="fw-bold">${tool.type || "N/A"}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="d-flex align-items-start gap-3">
                                                            <div class="bg-warning bg-opacity-10 rounded p-3">
                                                                <i class="fas fa-info-circle text-warning fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <div class="text-muted small mb-1">Description</div>
                                                                <div class="fw-bold">${tool.description || "No description available"}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Tool Parameters",
                    display: {
                        titleClassName: "h4 mb-3 mt-4",
                        visible: data => data?.toolParams && Object.keys(data.toolParams).length > 0,
                    },
                    elements: [
                        {
                            field: "toolParams",
                            type: "custom",
                            display: {
                                render: toolParams => {
                                    if (!toolParams || Object.keys(toolParams).length === 0) {
                                        return html`
                                            <div class="alert alert-info d-flex align-items-center gap-2">
                                                <i class="fas fa-info-circle"></i>
                                                <span>No custom parameters configured. Using default values.</span>
                                            </div>
                                        `;
                                    }
                                    return html`
                                        <div class="card shadow-sm">
                                            <div class="card-body p-0">
                                                <table class="table table-striped mb-0">
                                                    <thead class="table-light">
                                                        <tr>
                                                            <th style="width: 40%;">Parameter</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${Object.entries(toolParams).map(([key, value]) => html`
                                                            <tr>
                                                                <td>
                                                                    <div class="d-flex align-items-center gap-2">
                                                                        <i class="fas fa-cog text-secondary"></i>
                                                                        <code class="text-secondary">${key}</code>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <code class="text-primary">${JSON.stringify(value)}</code>
                                                                </td>
                                                            </tr>
                                                        `)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Execution Summary",
                    display: {
                        titleClassName: "h4 mb-3 mt-4",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const numClinicalAnalyses = data?.clinicalAnalyses?.length || 0;
                                    const toolName = data?.tool?.id || "No tool";
                                    return html`
                                        <div class="alert alert-primary d-flex align-items-start gap-3">
                                            <i class="fas fa-info-circle fs-4 mt-1"></i>
                                            <div>
                                                <div class="fw-bold mb-2">Ready to execute analysis</div>
                                                <div>
                                                    This will execute <strong>${toolName}</strong> on
                                                    <strong>${numClinicalAnalyses}</strong> clinical ${numClinicalAnalyses === 1 ? "analysis" : "analyses"}.
                                                    ${numClinicalAnalyses > 0 ? html`
                                                        <div class="mt-2">
                                                            A total of <strong>${numClinicalAnalyses} job${numClinicalAnalyses > 1 ? "s" : ""}</strong>
                                                            will be submitted to the job queue.
                                                        </div>
                                                    ` : nothing}
                                                </div>
                                            </div>
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

customElements.define("clinical-tertiary-review", ClinicalTertiaryReview);

