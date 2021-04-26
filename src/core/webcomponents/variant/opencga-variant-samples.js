/**
 * Copyright 2015-2019 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../loading-spinner.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import GridCommons from "../commons/grid-commons.js";
import "../commons/opencb-grid-toolbar.js";


export default class OpencgaVariantSamples extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            variantId: {
                type: String
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "ovcs" + UtilsNew.randomString(6);

        this.active = false;
        this.gridId = this._prefix + "SampleTable";
        this.toolbarConfig = {};
    }

    connectedCallback() {
        this.config = this.getDefaultConfig();
        this.gridCommons = new GridCommons(this.gridId, this, this.config);
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // this.catalogGridFormatter = new CatalogGridFormatter(this.opencgaSession);
        }

        if ((changedProperties.has("variantId") || changedProperties.has("active")) && this.active) {
            this.renderTable();
        }
    }

    genoypeFormatter(value, row, index) {
        if (value && value.data && value.data.length > 0) {
            const gt = value.data[0];
            const color = gt === "0/1" || gt === "0|1" || gt === "1|0" ? "darkorange" : "red";
            return `<span style="color: ${color}">${value.data[0]}</span>`;
        } else {
            return "-";
        }
    }

    variantFormatter(value, row, index) {
        if (value && value.file && value.dataKeys && value.data && value.dataKeys.length === value.data.length) {
            const fileInfo = `Filter: ${value.file.data["FILTER"]}; Qual: ${value.file.data["QUAL"]}`;
            const sampleFormat = [];
            for (let i = 0; i < value.dataKeys.length; i++) {
                sampleFormat.push(`${value.dataKeys[i]}=${value.data[i]}`);
            }
            return fileInfo + "<br>" + sampleFormat.join("; ");
        } else {
            return "-";
        }
    }

    individualFormatter(value, row, index) {
        if (value) {
            return value;
        } else {
            return "-";
        }
    }

    sexFormatter(value, row, index) {
        // debugger
        if (value) {
            return `${value.sex} (${value.karyotypicSex})`;
        } else {
            return "-";
        }
    }

    disorderFormatter(value, row, index) {
        if (value && value.length) {
            return value.map(disorder => `<p>${disorder.id}</p>`).join("");
        } else {
            return "-";
        }
    }

    renderTable() {
        if (!this.opencgaSession) {
            return;
        }

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            pagination: true,
            sidePagination: "server",
            columns: this.getColumns(),
            formatShowingRows: this.gridCommons.formatShowingRows,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: async params => {
                const tableOptions = this.table.bootstrapTable("getOptions");
                // let limit = tableOptions.pageSize || 10;
                // let skip = tableOptions.pageNumber ? tableOptions.pageNumber * limit - limit : 0;
                const query = {
                    variant: this.variantId,
                    study: this.opencgaSession.study.fqn,
                    limit: params.data.limit || tableOptions.pageSize,
                    skip: params.data.offset || 0,
                    count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                    genotype: "0/1,1/1,0/2,1/2,2/2"
                };
                try {
                    const data = await this.fetchData(query);
                    params.success(data);
                } catch (e) {
                    console.log(e);
                    params.error(e);
                }
            },
            responseHandler: response => {
                // let tableOptions = $(this.table).bootstrapTable("getOptions");
                // this.from = tableOptions.pageNumber * tableOptions.pageSize - tableOptions.pageSize + 1;
                // this.to = Math.min(tableOptions.pageNumber * tableOptions.pageSize, this.numSamples);
                // this.numTotalResultsText = this.numSamples;
                // this.requestUpdate();
                return {
                    total: this.numSamples,
                    rows: response
                };
            },
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onLoadSuccess: data => {
                this.gridCommons.onLoadSuccess(data, 2);
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });
    }

    async fetchData(query, batch_size) {
        try {

            const variantResponse = await this.opencgaSession.opencgaClient.variants().querySample(query);
            const result = variantResponse.getResult(0);

            // Save response count attributes
            this.responseAttributes = variantResponse.responses[0].attributes;

            // Get the total number of samples
            // TODO count only the genotypes filtered
            // _this.numSamples = result.studies[0].samples.length;
            this.numSamples = 0;
            const stats = result.studies[0].stats;
            for (const stat of stats) {
                if (stat.cohortId === "ALL") {
                    for (const gt of Object.keys(stat.genotypeCount)) {
                        if (gt !== "0/0" && gt !== "./.") {
                            this.numSamples += stat.genotypeCount[gt];
                        }
                    }
                    // this.numSamples = stat.genotypeCount["0/1"] + stat.genotypeCount["1/1"]
                    // this.numSamples = stat.sampleCount - stat.genotypeCount["0/0"]
                    break;
                }
            }

            // Prepare sample variant data for next query
            const variantSamples = result.studies[0].samples;

            if (variantSamples && variantSamples.length > 0) {
                const variantSampleInfo = {};
                const sampleIds = [];
                const samples = [];
                for (const variantSample of variantSamples) {
                    sampleIds.push(variantSample.sampleId);
                    variantSampleInfo[variantSample.sampleId] = {
                        id: variantSample.sampleId,
                        file: result.studies[0].files[variantSample.fileIndex],
                        dataKeys: result.studies[0].sampleDataKeys,
                        data: variantSample.data
                    };
                }


                const batch = batch_size ?? sampleIds.length;
                for (let i = 0; i < sampleIds.length;) {
                    let sampleChunk = [];
                    const sampleIdChunk = sampleIds.slice(i, i + batch);
                    i = i + batch;

                    const sampleResponse = await this.opencgaSession.opencgaClient.samples().info(sampleIdChunk.join(","), {study: this.opencgaSession.study.fqn, includeIndividual: true});

                    sampleChunk = sampleResponse.getResults();
                    for (const sample of sampleChunk) {
                        sample.attributes.OPENCGA_VARIANT = variantSampleInfo[sample.id];
                    }

                    // Fetch clinical analysis to display the Case ID
                    const caseResponse = await this.opencgaSession.opencgaClient.clinical().search(
                        {
                            individual: sampleChunk.map(sample => sample.individualId).join(","),
                            limit: batch,
                            study: this.opencgaSession.study.fqn,
                            exclude: "proband.samples,interpretation,files"
                        });
                    // We store the Case ID in the individual attribute
                    // Note clinical search results are not sorted
                    // FIXME at the moment we only search by proband
                    const map = {};
                    for (const clinicalAnalysis of caseResponse.responses[0].results) {
                        if (!map[clinicalAnalysis.proband.id]) {
                            map[clinicalAnalysis.proband.id] = [];
                        }
                        map[clinicalAnalysis.proband.id].push(clinicalAnalysis);
                    }
                    for (const sample of sampleResponse.responses[0].results) {
                        sample.attributes.OPENCGA_CLINICAL_ANALYSIS = map[sample.individualId];
                    }
                    samples.push(...sampleChunk);
                }

                this.requestUpdate();

                return samples;
            } else {
                await Promise.reject("No samples found");
            }
        } catch (e) {
            await Promise.reject(e);
        }
    }

    getColumns() {
        return [
            [
                {
                    title: "Sample ID",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    // formatter: this.variantFormatter,
                    halign: "center"
                },
                {
                    title: "Genotype",
                    field: "attributes.OPENCGA_VARIANT",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.genoypeFormatter,
                    halign: "center"
                },
                {
                    title: "Variant Data",
                    field: "attributes.OPENCGA_VARIANT",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantFormatter,
                    halign: "center"
                },
                {
                    title: "Individual",
                    rowspan: 1,
                    colspan: 4,
                    // formatter: this.variantFormatter,
                    halign: "center"
                },
                {
                    title: "Case ID",
                    field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.individualId, this.opencgaSession),
                    halign: "center"
                }
            ],
            [
                {
                    title: "ID",
                    field: "individualId",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.individualFormatter,
                    halign: "center"
                },
                {
                    title: "Sex",
                    field: "attributes.OPENCGA_INDIVIDUAL",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.sexFormatter,
                    halign: "center"
                },
                {
                    title: "Disorders",
                    field: "attributes.OPENCGA_INDIVIDUAL.disorders",
                    colspan: 1,
                    rowspan: 1,
                    formatter: disorders => {
                        const result = disorders?.map(disorder => CatalogGridFormatter.disorderFormatter(disorder)).join("<br>");
                        return result ? result : "-";
                    },
                    halign: "center"
                },
                {
                    title: "Phenotypes",
                    field: "attributes.OPENCGA_INDIVIDUAL.phenotypes",
                    colspan: 1,
                    rowspan: 1,
                    formatter: CatalogGridFormatter.phenotypesFormatter,
                    halign: "center"
                }
            ]
        ];
    }

    async onDownload(e) {
        try {
            this.toolbarConfig = {...this.toolbarConfig, downloading: true};
            await this.requestUpdate();
            // batch size for sample query
            const BATCH_SIZE = 100;
            const query = {
                variant: this.variantId,
                study: this.opencgaSession.study.fqn,
                limit: 1000,
                genotype: "0/1,1/1,0/2,1/2,2/2"
            };

            const samples = await this.fetchData(query, BATCH_SIZE);
            const header = ["Sample ID", "Genotype", "Variant Data", "Individual ID", "Individual Sex", "Phenotypes", "Disorders", "Case ID"];
            const rows = samples.map(sample => {
                return [
                    sample.id,
                    sample?.attributes?.OPENCGA_VARIANT?.data[0] ?? "-",
                    this.variantFormatter(sample?.attributes?.OPENCGA_VARIANT),
                    sample.individualId,
                    this.sexFormatter(sample?.attributes?.OPENCGA_INDIVIDUAL),
                    sample?.attributes?.OPENCGA_INDIVIDUAL?.phenotypes?.map(p => p.id) ?? "-",
                    sample?.attributes?.OPENCGA_INDIVIDUAL?.disorders?.map(d => d.id) ?? "-",
                    sample?.attributes?.OPENCGA_CLINICAL_ANALYSIS?.id ?? "-"
                ].join("\t");
            });
            if (e.detail.option.toLowerCase() === "tab") {
                const dataString = [
                    header.join("\t"),
                    rows.join("\n")];
                UtilsNew.downloadData(dataString, "variant_samples_" + this.opencgaSession.study.id + ".txt", "text/plain");
            } else {
                UtilsNew.downloadData(JSON.stringify(samples, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
            }
        } catch (e) {
            UtilsNew.notifyError(e);
        }
        this.toolbarConfig = {...this.toolbarConfig, downloading: false};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false
        };
    }

    render() {
        return html`
            <div style="padding: 20px">
                <div style="margin: 10px">
                    ${this.responseAttributes?.approximateCount === false 
                        || (this.responseAttributes?.approximateCount && this.numSamples === this.responseAttributes.numTotalSamples)
                            ? html`
                                Number of samples found is <span style="font-weight: bold">${this.numSamples}</span>, you can view all samples for this variant.
                                Notice that you might now have permission to view all samples for any variant.
                            `
                            : html`
                                Number of samples found is <span style="font-weight: bold">${this.numSamples}</span>, and
                                your user account has permission over <span style="font-weight: bold">${this.responseAttributes?.numTotalSamples} samples</span>.
                                Notice that you might now have permission to view all samples for any variant.
                            `
                    }
                </div>
                
                <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                     @columnChange="${this.onColumnChange}"
                                     @download="${this.onDownload}"
                                     @sharelink="${this.onShare}">
                </opencb-grid-toolbar>
                
                <div>
                    <table id="${this._prefix}SampleTable"></table>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-variant-samples", OpencgaVariantSamples);
