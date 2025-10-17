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
            input: this.toolParams?.preprocessing?.input,
            preprocessing: {
                qc: this.toolParams?.preprocessing?.steps?.find(step => step.id === "quality-control" || step.name === "quality-control"),
                alignment: this.toolParams?.preprocessing?.steps?.find(step => step.id === "alignment" || step.name === "alignment"),
                vc: this.toolParams?.preprocessing?.steps?.find(step => step.id === "variant-calling" || step.name === "variant-calling"),
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
                    title: "Input Params",
                    display: {},
                    elements: [
                        {
                            title: "Samples",
                            field: "input.samples",
                            type: "table",
                            display: {
                                getData: data => {
                                    return data.input.samples || [];
                                },
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No samples selected.",
                                columns: [
                                    {
                                        title: "Sample",
                                        field: "id",
                                    },
                                    {
                                        title: "Type",
                                        field: "somatic",
                                        type: "custom",
                                        display: {
                                            render: somatic => somatic ? "Somatic" : "Germline",
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "files",
                                        type: "custom",
                                        display: {
                                            render: files => files ? files.map(file => html`<div>${file}</div>`) : "No files selected.",
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            field: "input.indexDir",
                            title: "Index Directory",
                        },
                    ],
                },
                {
                    title: "Quality Control Params",
                    display: {},
                    elements: [
                        {
                            title: "Tool",
                            field: "preprocessing.qc.tool.id",
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
                    title: "Alignment Params",
                    display: {},
                    elements: [
                        {
                            title: "Tool",
                            field: "preprocessing.alignment.tool.id",
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
                    title: "Variant Calling Params",
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
                                        title: "Tool",
                                        field: "id",
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
                                        title: "Options",
                                        type: "custom",
                                        display: {
                                            render: (options) => {
                                                const opts = this.getParameters(options);
                                                if (opts.length === 0) {
                                                    return html`<span>No options available.</span>`;
                                                }
                                                return opts.map(opt => html`
                                                    <div><b>${opt.key}:</b> ${opt.value}</div>
                                                `);
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
