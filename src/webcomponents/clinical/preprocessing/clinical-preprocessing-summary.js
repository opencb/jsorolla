import {LitElement, html, nothing} from "lit";
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
        this._params = this.toolParams;
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
                    title: "Pipeline",
                    display: {
                        visible: data => !!data?.pipeline?.file,
                    },
                    elements: [
                        {
                            title: "Name",
                            field: "pipeline.name",
                        },
                        {
                            title: "Version",
                            field: "pipeline.version",
                            type: "custom",
                            display: {
                                render: version => {
                                    return html`<span class="badge bg-secondary">${version}</span>`;
                                },
                            },
                        },
                        {
                            title: "Description",
                            field: "pipeline.description",
                        },
                        {
                            title: "File",
                            field: "pipeline.file",
                            type: "custom",
                            display: {
                                render: file => {
                                    return html`
                                        <code class="text-break">${(file || "-").replaceAll(":", "/")}</code>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Input Params",
                    display: {},
                    elements: [
                        {
                            title: "Samples",
                            field: "input.samples",
                            type: "table",
                            display: {
                                getData: data => data.samples || [],
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
                                            render: files => {
                                                return (files || []).map(file => {
                                                    return html`<code class="d-block">${file}</code>`;
                                                });
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            field: "preprocessing.indexDir",
                            title: "Index Directory",
                            type: "custom",
                            display: {
                                render: indexDir => {
                                    return indexDir ? html`<code class="text-break">${indexDir}</code>` : "Not specified.";
                                },
                            },
                        },
                        {
                            field: "preprocessing.outputDir",
                            title: "Output Directory",
                            type: "custom",
                            display: {
                                render: outdir => {
                                    return outdir ? html`<code class="text-break">${outdir}</code>` : "Not specified.";
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Quality Control Params",
                    display: {},
                    elements: [
                        {
                            title: "Tool",
                            field: "preprocessing.steps.qualityControl.tool.id",
                        },
                        {
                            title: "Parameters",
                            type: "table",
                            display: {
                                getData: data => {
                                    return this.getParameters(data.preprocessing?.steps?.qualityControl?.tool?.parameters || {});
                                },
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No parameters specified.",
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
                            field: "preprocessing.steps.alignment.tool.id",
                        },
                        {
                            title: "Alignment Index",
                            field: "preprocessing.steps.alignment.tool.index",
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
                                getData: data => {
                                    return this.getParameters(data.preprocessing?.steps?.alignment?.tool?.parameters || {});
                                },
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "No parameters specified.",
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
                            title: "Tools",
                            type: "table",
                            display: {
                                getData: data => {
                                    return data.preprocessing?.steps?.variantCalling?.tools || [];
                                },
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
                                                return reference ? html`<code class="text-break">${reference}</code>` : "Not specified.";
                                            },
                                        },
                                    },
                                    {
                                        title: "Options",
                                        field: "options",
                                        type: "custom",
                                        display: {
                                            render: (options) => {
                                                const opts = this.getParameters(options);
                                                if (opts.length === 0) {
                                                    return html`<span>No options specified.</span>`;
                                                }
                                                return opts.map(opt => html`
                                                    <div><b>${opt.key}:</b> ${opt.value}</div>
                                                `);
                                            },
                                        },
                                    },
                                    {
                                        title: "Parameters",
                                        field: "parameters",
                                        type: "custom",
                                        display: {
                                            render: (parameters) => {
                                                const params = this.getParameters(parameters);
                                                if (params.length === 0) {
                                                    return html`<span>No parameters specified.</span>`;
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
