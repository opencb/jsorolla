import { html, LitElement } from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import GridCommons from "../commons/grid-commons.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/data-list.js";

export default class ToolImport extends LitElement {

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
                type: Object
            },
            tools: {
                type: Array
            },
        };
    }

    #init() {
        this.isLoading = false;
        this._config = this.getDefaultConfig();

        // Hard-coded list of available tools
        this.tools = [
            {
                "id": "carrier",
                "name": "Carrier Single Analysis",
                "description": "Performs the carrier analysis",
                "scope": "CLINICAL_INTERPRETATION_ANALYSIS",
                "container": {
                    "name": "opencb/gsc-pipeline",
                    "tag": "1.0.3",
                    "digest": "",
                    "commandLine": "/opt/app/src/main.py single --case ${clinicalAnalysisId} --host ${host}"
                },
                "variables": [
                    {
                        "id": "clinicalAnalysisId",
                        "name": "Case ID",
                        "type": "STRING",
                        "required": true,
                        "output": false
                    },
                    {
                        "id": "host",
                        "name": "XetaBase Host",
                        "type": "STRING",
                        "required": true,
                        "defaultValue": `${window.location.origin}/opencga`,
                        "output": false
                    }
                ],
                "minimumRequirements": {
                    "cpu": "4",
                    "memory": "8.0GB"
                },
            },
            {
                "id": "pre-marital",
                "name": "Pre-marital Analysis",
                "description": "Performs the pre-marital analysis",
                "scope": "CLINICAL_INTERPRETATION_ANALYSIS",
                "container": {
                    "name": "opencb/gsc-pipeline",
                    "tag": "1.0.3",
                    "digest": "",
                    "commandLine": "/opt/src/main.py pre-marital --case ${clinicalAnalysisId} --host ${host}"
                },
                "variables": [
                    {
                        "id": "clinicalAnalysisId",
                        "name": "Case ID",
                        "description": "Select case ID for the analysis",
                        "type": "STRING",
                        "required": true,
                        "output": false
                    },
                    {
                        "id": "host",
                        "name": "XetaBase Host",
                        "type": "STRING",
                        "required": true,
                        "defaultValue": `${window.location.origin}/opencga`,
                        "output": false
                    }
                ],
                "minimumRequirements": {
                    "cpu": "4",
                    "memory": "8.0GB"
                },
            },
        ];
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    onImport(e, tool) {
        this.#setLoading(true);

        // Call OpenCGA API to create the custom tool
        this.opencgaSession.opencgaClient.userTool()
            .createCustom(tool, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Tool Import",
                    message: `Tool "${tool.name}" imported successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "toolImport", { id: tool.id });
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <div>
                <data-list
                    .data="${this.tools || []}"
                    .config="${this._config}">
                </data-list>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                float: "left"
            },
            search: {
                fields: ["name", "description", "scope"],
                ignoreCase: true
            },
            sortBy: {
                options: [
                    {
                        id: "name",
                        name: "Name",
                    },
                    {
                        id: "scope",
                        name: "Scope",
                    }
                ]
            },
            groupBy: {
                options: []
            },
            table: {
                showHeader: true,
                options: {
                    classes: "table table-hover table-borderless",
                    theadClasses: "table-light",
                    buttonsClass: "light",
                    iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                    icons: GridCommons.GRID_ICONS,
                    pagination: true,
                    pageSize: 10,
                    pageList: [5, 10, 25],
                    detailView: false,
                    rowStyle: "",
                },
                columns: [
                    {
                        title: "Tool",
                        field: "id",
                        formatter: toolId => {
                            return `
                                <div class="fw-bold my-1" data-action="view">${toolId}</div>
                            `;
                        },
                    },
                    {
                        title: "Name",
                        field: "name",
                        formatter: (value, row) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>${value}</div>
                                    ${row.description ? `<div class="text-secondary">${row.description}</div>` : ""}
                                </div>
                            `;
                        },
                    },
                    {
                        title: "Scope",
                        field: "scope",
                        formatter: value => {
                            const scopeConfig = {
                                "SECONDARY_ANALYSIS": {
                                    label: "SECONDARY",
                                    color: "#25283D"
                                },
                                "RESEARCH_ANALYSIS": {
                                    label: "RESEARCH",
                                    color: "#98DFEA"
                                },
                                "CLINICAL_INTERPRETATION_ANALYSIS": {
                                    label: "CLINICAL INTERPRETATION",
                                    color: "#9F1F93"
                                },
                                "OTHER": {
                                    label: "OTHER",
                                    color: "#C2CBCF"
                                }
                            };
                            const config = scopeConfig[value] || { label: "Unknown", color: "black" };
                            return `
                                <span class="badge fs-7" style="background-color: ${config.color};">
                                    ${config.label}
                                </span>
                            `;
                        }
                    },
                    {
                        title: "Container",
                        field: "container",
                        formatter: container => {
                            if (!container || !container.name) {
                                return "-";
                            }
                            // Both CUSTOM TOOLS and VARIANT_WALKER use container executor
                            // We need to find the container repository from the name
                            const split = container?.name.split("/");
                            const repositoryName = split?.length > 2 ? split[0] : "DOCKER";
                            return `
                                <div>
                                    <a class="link d-inline-flex align-items-center gap-1" href="https://hub.docker.com/r/${container.name}" target="_blank">
                                        <span>${container.name} v${container.tag}</span>
                                        <i class="fa fa-external-link-alt fs-8"></i>
                                    </a>
                                </div>
                                <div class="text-secondary my-1">${repositoryName?.toUpperCase() || "-"}</div>
                            `;
                        },
                    },
                    {
                        title: "Requirements",
                        field: "minimumRequirements",
                        formatter: value => {
                            if (!value) {
                                return "-";
                            }
                            return `
                                <div class="my-1"><b>CPU</b>: ${value.cpu || "-"} core(s)</div>
                                <div class="my-1"><b>Memory</b>: ${value.memory?.split(".")[0] || "-"} ${value.memory?.endsWith("GB") ? "" : "GB"}</div>
                                <div class="my-1"><b>Processor</b>: ${value.processorType || "CPU"}</div>
                            `;
                        }
                    },
                    {
                        title: "Add",
                        field: "import",
                        formatter: () => {
                            return `
                                <button type="button" class="btn btn-primary">
                                    Add
                                </button>
                            `;
                        },
                        events: {
                            "click button": (e, value, row) => this.onImport(e, row)
                        }
                    },
                ],
            },
        };
    }
}

customElements.define("tool-import", ToolImport);
