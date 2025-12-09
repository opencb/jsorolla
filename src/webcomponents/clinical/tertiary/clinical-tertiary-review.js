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
                    title: "Samples",
                    display: {
                        visible: data => data?.samples?.length > 0,
                    },
                    elements: [
                        {
                            title: "Selected Samples",
                            field: "samples",
                            type: "table",
                            display: {
                                getData: data => data?.samples || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No samples selected.",
                                columns: [
                                    {
                                        title: "Sample ID",
                                        field: "id",
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Cases Configuration",
                    display: {
                        visible: data => data?.cases !== undefined,
                    },
                    elements: [
                        {
                            title: "Create Cases",
                            field: "cases.createCases",
                            type: "custom",
                            display: {
                                render: createCases => {
                                    return html`<span class="badge ${createCases ? "bg-success" : "bg-secondary"}">${createCases ? "Yes" : "No"}</span>`;
                                },
                            },
                        },
                        {
                            title: "Clinical Analysis Type",
                            field: "cases.type",
                            display: {
                                visible: data => data?.cases?.createCases === true,
                            },
                        },
                        {
                            title: "Case ID Prefix",
                            field: "cases.caseIdPrefix",
                            type: "custom",
                            display: {
                                visible: data => data?.cases?.createCases === true,
                                render: prefix => {
                                    return prefix ? html`<code>${prefix}</code>` : "Not specified.";
                                },
                            },
                        },
                        {
                            title: "Disease Panels",
                            field: "cases.panels",
                            type: "table",
                            display: {
                                visible: data => data?.cases?.createCases === true && data?.cases?.panels?.length > 0,
                                getData: data => data?.cases?.panels || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No disease panels selected.",
                                columns: [
                                    {
                                        title: "Panel ID",
                                        field: "id",
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Tools",
                    display: {
                        visible: data => data?.tools?.tools?.length > 0,
                    },
                    elements: [
                        {
                            title: "Selected Tools",
                            field: "tools.tools",
                            type: "table",
                            display: {
                                getData: data => data?.tools?.tools || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No tools selected.",
                                columns: [
                                    {
                                        title: "Tool Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Version",
                                        field: "version",
                                    },
                                    {
                                        title: "Enabled",
                                        field: "enabled",
                                        type: "custom",
                                        display: {
                                            render: enabled => {
                                                return html`<span class="badge ${enabled ? "bg-success" : "bg-secondary"}">${enabled ? "Yes" : "No"}</span>`;
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-review", ClinicalTertiaryReview);

