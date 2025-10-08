import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";

export default class ClinicalPreprocessingSummary extends LitElement {

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
        this._params = {
            select: this.toolParams?.select,
            preprocessing: {
                qc: this.toolParams?.preprocessing?.steps?.find(step => step.name === "quality-control"),
                alignment: this.toolParams?.preprocessing?.steps?.find(step => step.name === "alignment"),
                vc: this.toolParams?.preprocessing?.steps?.find(step => step.name === "variant-calling"),
            },
        };
    }

    getParameters(data) {
        return Object.keys(data || {}).map(key => {
            return {
                key: key,
                value: data[key],
            };
        });
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
            title: "Preprocessing Summary & Run",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Selected Files",
                    display: {},
                    elements: [
                        {
                            field: "select.analysisType",
                            title: "Analysis Type",
                        },
                        {
                            title: "Selected Files",
                            field: "select",
                            type: "table",
                            display: {
                                getData: data => {
                                    const analysisType = data.select?.analysisType?.toLowerCase();
                                    const fileIds = data.select?.[analysisType]?.fileIds?.split(",") || [];

                                    // filter and return only the selected files
                                    return (data.select?.[analysisType]?.files || []).filter(ffileId => {
                                        return fileIds.includes(ffileId.fileId);
                                    });
                                },
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No files selected.",
                                columns: [
                                    {
                                        title: "Individual",
                                        field: "individualId",
                                    },
                                    {
                                        title: "Sample",
                                        field: "sampleId",
                                        type: "custom",
                                        display: {
                                            render: (sampleId, onFieldChange, updateParams, data, row) => html`
                                                <div class="mb-1">${sampleId}</div>
                                                <div class="text-muted fs-7">${row.sampleSomatic ? "Somatic" : "Germline"}</div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "File",
                                        field: "fileName",
                                    },
                                    {
                                        title: "Format",
                                        field: "fileFormat",
                                    },
                                    {
                                        title: "Size",
                                        field: "fileSize",
                                        type: "custom",
                                        display: {
                                            render: size => UtilsNew.getDiskUsage(size),
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Quality Control Options",
                    display: {},
                    elements: [
                        {
                            title: "Tool",
                            field: "preprocessing.qc.tool.name",
                        },
                        {
                            title: "Parameters",
                            type: "table",
                            display: {
                                getData: data => this.getParameters(data.preprocessing.qc?.tool?.parameters),
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No parameters available.",
                                columns: [
                                    {
                                        title: "Parameter",
                                        field: "key",
                                    },
                                    {
                                        title: "Value",
                                        field: "value",
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Alignment Options",
                    display: {},
                    elements: [
                        {
                            title: "Tool",
                            field: "preprocessing.alignment.tool.name",
                        },
                        {
                            title: "Alignment Index",
                            field: "preprocessing.alignment.tool.index",
                            type: "custom",
                            display: {
                                render: (index) => {
                                    return index ? html`<code>${index}</code>` : "Not specified.";
                                },
                            },
                        },
                        {
                            title: "Parameters",
                            type: "table",
                            display: {
                                getData: data => this.getParameters(data.preprocessing.alignment?.tool?.parameters),
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No parameters available.",
                                columns: [
                                    {
                                        title: "Parameter",
                                        field: "key",
                                    },
                                    {
                                        title: "Value",
                                        field: "value",
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Variant Calling Options",
                    display: {},
                    elements: [
                        {
                            type: "table",
                            display: {
                                getData: data => data.preprocessing.vc?.tools || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No Variant Calling tools available.",
                                columns: [
                                    {
                                        title: "Tool Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Reference",
                                        field: "reference",
                                        type: "custom",
                                        display: {
                                            render: (reference) => {
                                                return reference ? html`<code>${reference}</code>` : "Not specified.";
                                            },
                                        },
                                    },
                                    {
                                        title: "Parameters",
                                        type: "custom",
                                        display: {
                                            render: (parameters) => {
                                                const params = this.getParameters(parameters);
                                                if (params.length === 0) {
                                                    return html`<span>No parameters available.</span>`;
                                                }
                                                return params.map(param => html`
                                                    <div><b>${param.key}:</b> ${param.value}</div>
                                                `);
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                // {
                //     title: "Variant Index Parameters",
                //     display: {},
                //     elements: [
                //         {
                //             title: "Parameters",
                //             field: "variantIndex",
                //             type: "table",
                //             display: {
                //                 getData: data => this.getParameters(data.variantIndex),
                //                 className: "table-borderless table-grid mb-0",
                //                 columns: [
                //                     {
                //                         title: "Parameter",
                //                         field: "key",
                //                     },
                //                     {
                //                         title: "Value",
                //                         field: "value",
                //                     },
                //                 ],
                //             },
                //         },
                //     ],
                // },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-summary", ClinicalPreprocessingSummary);
