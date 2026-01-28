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
                "type": "CUSTOM_TOOL",
                "scope": "CLINICAL_INTERPRETATION_ANALYSIS",
                "container": {
                    "name": "opencb/gsc-pipeline",
                    "tag": "1.0.1",
                    "digest": "",
                    "commandLine": "/opt/app/src/main.py single --case ${clinicalAnalysisId} -c file://analysis/config.json -s pmszetta4"
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
                        "id": "report",
                        "name": "Create report",
                        "type": "BOOLEAN",
                        "required": false,
                        "defaultValue": "true",
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
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Import Tool",
            message: `Are you sure you want to import the tool "${tool.name}"?`,
            ok: () => {
                this.#setLoading(true);
                
                // TODO: Implement actual import logic
                // For now, just simulate a successful import
                setTimeout(() => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: "Tool Import",
                        message: `Tool "${tool.name}" imported successfully`,
                    });
                    LitUtils.dispatchCustomEvent(this, "toolImport", { id: tool.id });
                    this.#setLoading(false);
                }, 1000);
            },
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
                fields: ["name", "description", "category"],
                ignoreCase: true
            },
            sortBy: {
                options: [
                    {
                        id: "name",
                        name: "Name",
                    },
                    {
                        id: "category",
                        name: "Category",
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
                        field: "name",
                        formatter: (value, row) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div class="fw-bold">${value}</div>
                                    <div class="text-secondary">${row.description}</div>
                                </div>
                            `;
                        },
                        width: "40",
                        widthUnit: "%"
                    },
                    {
                        title: "Category",
                        field: "category",
                        formatter: value => {
                            const categoryColors = {
                                "Variant Analysis": "primary",
                                "Alignment Analysis": "success",
                                "Quality Control": "info",
                            };
                            const color = categoryColors[value] || "secondary";
                            return `
                                <span class="badge bg-${color}">${value}</span>
                            `;
                        }
                    },
                    {
                        title: "Version",
                        field: "version",
                        formatter: value => {
                            return `
                                <div class="text-center">
                                    <span class="badge bg-secondary">v${value}</span>
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Container",
                        field: "container",
                        formatter: value => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div class="font-monospace" style="font-size: 0.85em;">${value}</div>
                                </div>
                            `;
                        },
                        width: "30",
                        widthUnit: "%"
                    },
                    {
                        title: "Author",
                        field: "author",
                        formatter: value => {
                            return `<div class="text-secondary">${value}</div>`;
                        }
                    },
                    {
                        title: "Import",
                        field: "import",
                        formatter: () => {
                            return `
                                <button type="button" class="btn btn-primary btn-sm">
                                    Import
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
