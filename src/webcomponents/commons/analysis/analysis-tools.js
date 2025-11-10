import {LitElement, html, nothing, render} from "lit";
import "../tool-header.js";
import "../view/vertical-menu.js";
import "../../clinical/analysis/mutational-signature-analysis.js";
import "../../clinical/analysis/rd-tiering-analysis.js";
import "../../job/analysis/tool-analysis.js";
import "../../job/analysis/custom-tool-builder.js";
import "../../variant/analysis/gwas-analysis.js";
import "../../variant/analysis/sample-variant-stats-analysis.js";
import "../../variant/analysis/cohort-variant-stats-analysis.js";
import "../../variant/analysis/sample-eligibility-analysis.js";
import "../../variant/analysis/inferred-sex-analysis.js";
import "../../variant/analysis/individual-relatedness-analysis.js";
import "../../variant/analysis/mendelian-error-analysis.js";
import "../../variant/analysis/sample-qc-analysis.js";
import "../../variant/analysis/individual-qc-analysis.js";
import "../../variant/analysis/family-qc-analysis.js";
import "../../variant/analysis/liftover-analysis.js";
import "../../variant/analysis/knockout-analysis.js";
import "../../variant/analysis/opencga-plink-analysis.js";
import "../../variant/analysis/opencga-gatk-analysis.js";
import "../../variant/analysis/bcftools-analysis.js";
import "../../variant/analysis/variant-export-analysis.js";
import "../../variant/analysis/opencga-variant-stats-exporter-analysis.js";
import "../../variant/analysis/bcftools-analysis.js";
import "../../variant/interpretation/variant-interpreter.js";
import "../../workflow/analysis/tool-executor.js";

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
        this._config = this.getDefaultConfig();
    }

    render() {
        return html`
            <tool-header .title="${this._config.title}"></tool-header>
            <vertical-menu
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config || {}}">
            </vertical-menu>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Analysis Tools",
            display: {
                contentClassName: "mx-auto",
                contentStyle: "max-width:920px;",
                menuStyle: "width:240px",
            },
            menu: [
                {
                    id: "analysis-execution",
                    name: "Analysis Execution",
                    submenu: [
                        {
                            id: "tool-analysis",
                            name: "Tool Executor",
                            render: opencgaSession => html`
                                <tool-analysis
                                    .opencgaSession="${opencgaSession}">
                                </tool-analysis>
                            `,
                        },
                        {
                            id: "custom-tool-builder",
                            name: "Custom Tool Builder",
                            render: opencgaSession => html`
                                <custom-tool-builder
                                    .opencgaSession="${opencgaSession}">
                                </custom-tool-builder>
                            `,
                        },
                        {
                            id: "tool-executor",
                            name: "User Tool Executor",
                            render: opencgaSession => html`
                                <tool-executor
                                    .opencgaSession="${opencgaSession}">
                                </tool-executor>
                            `,
                        },
                    ],
                },
                {
                    id: "summary-stats",
                    name: "Summary Stats",
                    submenu: [
                        {
                            id: "sample-variant-stats",
                            name: "Sample Variant Stats",
                            render: opencgaSession => html`
                                <sample-variant-stats-analysis
                                    .opencgaSession="${opencgaSession}">
                                </sample-variant-stats-analysis>
                            `,
                        },
                        {
                            id: "cohort-variant-stats",
                            name: "Cohort Variant Stats",
                            render: opencgaSession => html`
                                <cohort-variant-stats-analysis
                                    .opencgaSession="${opencgaSession}">
                                </cohort-variant-stats-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "association-analysis",
                    name: "Association Analysis",
                    submenu: [
                        {
                            id: "gwas",
                            name: "Genome-Wide Association Study (GWAS)",
                            description: "Study of a genome-wide set of genetic variants in different individuals to see if any variant is associated with a trait",
                            render: opencgaSession => html`
                                <gwas-analysis
                                    .opencgaSession="${opencgaSession}">
                                </gwas-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "sample-analysis",
                    name: "Sample Analysis",
                    submenu: [
                        {
                            id: "knockout",
                            name: "Knockout Analysis",
                            render: opencgaSession => html`
                                <knockout-analysis
                                    .opencgaSession="${opencgaSession}">
                                </knockout-analysis>
                            `,
                        },
                        {
                            id: "sample-eligibility",
                            name: "Eligibility Analysis",
                            render: opencgaSession => html`
                                <sample-eligibility-analysis
                                    .opencgaSession="${opencgaSession}">
                                </sample-eligibility-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "individual-analysis",
                    name: "Individual Analysis",
                    submenu: [
                        {
                            id: "inferred-sex",
                            name: "Sex Inference",
                            render: opencgaSession => html`
                                <inferred-sex-analysis
                                    .opencgaSession="${opencgaSession}">
                                </inferred-sex-analysis>
                            `,
                        },
                        {
                            id: "individual-relatedness",
                            name: "Relatedness",
                            render: opencgaSession => html`
                                <individual-relatedness-analysis
                                    .opencgaSession="${opencgaSession}">
                                </individual-relatedness-analysis>
                            `,
                        },
                        {
                            id: "mendelian-error",
                            name: "Mendelian Errors",
                            render: opencgaSession => html`
                                <mendelian-error-analysis
                                    .opencgaSession="${opencgaSession}">
                                </mendelian-error-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "cancer-analysis",
                    name: "Cancer Analysis",
                    submenu: [
                        {
                            id: "mutational-signature",
                            name: "Mutational Signature",
                            render: opencgaSession => html`
                                <mutational-signature-analysis
                                    .opencgaSession="${opencgaSession}">
                                </mutational-signature-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "quality-control",
                    name: "Quality Control",
                    submenu: [
                        {
                            id: "sample-qc",
                            name: "Sample Quality Control",
                            description: "Calculate different genetic checks and metrics and store data in Sample Catalog",
                            render: opencgaSession => html`
                                <sample-qc-analysis
                                    .opencgaSession="${opencgaSession}">
                                </sample-qc-analysis>
                            `,
                        },
                        {
                            id: "individual-qc",
                            name: "Individual Quality Control",
                            description: "Calculate different genetic checks and metrics and store data in Individual Catalog",
                            render: opencgaSession => html`
                                <individual-qc-analysis
                                    .opencgaSession="${opencgaSession}">
                                </individual-qc-analysis>
                            `,
                        },
                        {
                            id: "family-qc",
                            name: "Family Quality Control",
                            description: "Calculate different genetic checks and metrics and store data in Family Catalog",
                            render: opencgaSession => html`
                                <family-qc-analysis
                                    .opencgaSession="${opencgaSession}">
                                </family-qc-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "export",
                    name: "Export",
                    submenu: [
                        {
                            id: "variant-export",
                            name: "Variant Export",
                            description: `
                                Filter and export variants, with their annotation and sample genotypes,
                                from the Variant Storage to a file in multiple supported formats (vcf, json, json_sparse, tped, ...)
                                for being shared or processed by an external tool.
                            `,
                            render: opencgaSession => html`
                                <variant-export-analysis
                                    .opencgaSession="${opencgaSession}">
                                </variant-export-analysis>
                            `,
                        },
                        {
                            id: "variant-stats-exporter",
                            name: "Variant Stats Export",
                            description: "Export variant stats for different cohorts",
                            render: opencgaSession => html`
                                <opencga-variant-stats-exporter-analysis
                                    .opencgaSession="${opencgaSession}">
                                </opencga-variant-stats-exporter-analysis>
                            `,
                        },
                    ],
                },
                {
                    id: "external-tools",
                    name: "External Tools",
                    submenu: [
                        {
                            id: "liftover",
                            name: "LiftOver",
                            render: opencgaSession => html`
                                <liftover-analysis
                                    .opencgaSession="${opencgaSession}">
                                </liftover-analysis>
                            `,
                        },
                        {
                            id: "plink",
                            name: "Plink",
                            render: opencgaSession => html`
                                <opencga-plink-analysis
                                    .opencgaSession="${opencgaSession}">
                                </opencga-plink-analysis>
                            `,
                        },
                        {
                            id: "gatk",
                            name: "GATK",
                            render: opencgaSession => html`
                                <opencga-gatk-analysis
                                    .opencgaSession="${opencgaSession}">
                                </opencga-gatk-analysis>
                            `,
                        },
                        {
                            id: "bcftools",
                            name: "BCFtools",
                            render: opencgaSession => html`
                                <bcftools-analysis
                                    .opencgaSession="${opencgaSession}">
                                </bcftools-analysis>
                            `,
                        },
                    ],
                },
                // {
                //     id: "data-management",
                //     name: "Data Management",
                //     submenu: [
                //         {
                //             id: "alignment-index",
                //             name: "Alignment Index",
                //             description: "Create a .bai index file.",
                //             render: opencgaSession => html`
                //                 <opencga-alignment-index-analysis
                //                     .opencgaSession="${opencgaSession}">
                //                 </opencga-alignment-index-analysis>
                //             `,
                //         },
                //         {
                //             id: "coverage-index",
                //             name: "Coverage Index",
                //             description: "Precompute coverage in a BigWig file",
                //             render: opencgaSession => html`
                //                 <opencga-coverage-index-analysis
                //                     .opencgaSession="${opencgaSession}">
                //                 </opencga-coverage-index-analysis>
                //             `,
                //         },
                //     ],
                // },
                // {
                //     id: "summary-stats",
                //     name: "Summary Stats",
                //     submenu: [
                //         {
                //             id: "alignment-stats",
                //             name: "Alignment Stats",
                //             description: "Compute BAM stats using samtools",
                //             render: opencgaSession => html`
                //                 <opencga-alignment-stats-analysis
                //                     .opencgaSession="${opencgaSession}">
                //                 </opencga-alignment-stats-analysis>
                //             `,
                //         },
                //         {
                //             id: "beacon",
                //             name: "GA4GH Beacon",
                //             description: "Find databases that have information about specific variants.",
                //             render: opencgaSession => html``,
                //         },
                //     ],
                // },
            ],
        };
    }

}

customElements.define("analysis-tools", AnalysisTools);
