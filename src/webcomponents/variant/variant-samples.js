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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../loading-spinner.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import GridCommons from "../commons/grid-commons.js";
import "../commons/opencb-grid-toolbar.js";
import NotificationUtils from "../commons/utils/notification-utils.js";


export default class VariantSamples extends LitElement {

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
            variantId: {
                type: String
            },
            active: {
                type: Boolean
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.active = false;
        this.gridId = this._prefix + "SampleTable";

        this.toolbarSettings = {
            showCreate: false,
            showExport: true,
            showSettings: false,
        };
        this.toolbarConfig = {
            resource: "SAMPLE",
            exportLimit: 5000
        };

        this.config = this.getDefaultConfig();
        this.gridCommons = new GridCommons(this.gridId, this, this.config);

        // Nacho: to be more consistent with the rest of the application we are NOT selecting all genotypes by default
        this.selectedGenotypes = "";
        // const selectedGenotypesArray = [];
        // for (const genotype of this.config.genotypes) {
        //     if (genotype.fields) {
        //         selectedGenotypesArray.push(genotype.fields.filter(gt => gt.id).map(gt => gt.id).join(","));
        //     }
        // }
        // this.selectedGenotypes = selectedGenotypesArray.join(",");
    }

    updated(changedProperties) {
        if (changedProperties.size > 0 && this.active) {
            this.renderTable();
        }
    }

    genotypeFormatter(value) {
        if (value?.data?.length > 0) {
            // Color schema:  0/1, 0|1, 1|0 == darkorange; 1, 1/1 == red
            const gt = value.data[0];
            const color = gt === "0/1" || gt === "0|1" || gt === "1|0" ? "darkorange" : "red";
            return `<span style="color: ${color}">${value.data[0]}</span>`;
        } else {
            return "-";
        }
    }

    variantFormatter(value) {
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

    renderTable() {
        if (!this.opencgaSession || !this.variantId) {
            return;
        }
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            pagination: true,
            sidePagination: "server",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            columns: this._getDefaultColumns(),
            formatShowingRows: this.gridCommons.formatShowingRows,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: params => {
                const tableOptions = this.table.bootstrapTable("getOptions");
                this.filters = {
                    variant: this.variantId,
                    study: this.opencgaSession.study.fqn,
                    limit: params.data.limit || tableOptions.pageSize,
                    skip: params.data.offset || 0,
                    count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                };

                if (this.genotypeFilter) {
                    this.filters.genotype = this.genotypeFilter;
                }

                this.fetchData(this.filters)
                    .then(data => params.success(data))
                    .catch(error => {
                        console.error(error);
                        params.error(error);
                    });
            },
            responseHandler: response => ({
                total: response.total,
                rows: response.rows
            }),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onLoadSuccess: data => {
                this.gridCommons.onLoadSuccess(data, 2);
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });
    }

    async fetchData(query, batchSize) {
        try {
            const variantResponse = await this.opencgaSession.opencgaClient.variants()
                .querySample(query);
            const variantSamplesResult = variantResponse.getResult(0);

            // const stats = variantSamplesResult.studies[0].stats;
            // const stats = variantSamplesResult.studies[0].stats;

            this.numUserTotalSamples = 0;
            this.numSamples = variantResponse.responses[0]?.attributes?.numSamplesRegardlessPermissions;

            // Get the total number of samples from stats if OpenCGA does not return them
            // if (typeof this.numSamples !== "number" || isNaN(this.numSamples)) {
            //     this.numSamples = 0;
            //     for (const stat of stats) {
            //         if (stat.cohortId === "ALL") {
            //             for (const gt of Object.keys(stat.genotypeCount)) {
            //                 if (gt !== "0/0" && gt !== "./." && gt !== "./1" && gt !== "./0") {
            //                     this.numSamples += stat.genotypeCount[gt];
            //                 }
            //             }
            //             break;
            //         }
            //     }
            // }

            // Prepare sample variant data for next query
            const variantSamples = variantSamplesResult.studies[0].samples;
            if (variantSamples?.length > 0) {
                const variantSampleInfo = {};
                const sampleIds = [];
                const samples = [];
                for (const variantSample of variantSamples) {
                    sampleIds.push(variantSample.sampleId);
                    variantSampleInfo[variantSample.sampleId] = {
                        id: variantSample.sampleId,
                        file: variantSamplesResult.studies[0].files[variantSample.fileIndex],
                        dataKeys: variantSamplesResult.studies[0].sampleDataKeys,
                        data: variantSample.data
                    };
                }

                const batch = batchSize ?? sampleIds.length;
                for (let i = 0; i < sampleIds.length;) {
                    let sampleChunk = [];
                    const sampleIdChunk = sampleIds.slice(i, i + batch);
                    i = i + batch;

                    const sampleResponse = await this.opencgaSession.opencgaClient.samples()
                        .info(sampleIdChunk.join(","), {study: this.opencgaSession.study.fqn, includeIndividual: true});

                    sampleChunk = sampleResponse.getResults();
                    for (const sample of sampleChunk) {
                        sample.attributes.OPENCGA_VARIANT = variantSampleInfo[sample.id];
                    }

                    // Fetch clinical analysis to display the Case ID
                    const caseResponse = await this.opencgaSession.opencgaClient.clinical()
                        .search({
                            individual: sampleChunk
                                .map(sample => sample.individualId)
                                .filter(id => id && id.length > 0)
                                .join(","),
                            limit: batch,
                            study: this.opencgaSession.study.fqn,
                            include: "id,proband.id,family.members"
                        });

                    sampleResponse.getResults().forEach(sample => {
                        for (const clinicalAnalysis of caseResponse.getResults()) {
                            if (clinicalAnalysis?.proband?.id === sample.individualId || clinicalAnalysis?.family?.members.find(member => member.id === sample.individualId)) {
                                if (sample?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                    sample.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                } else {
                                    sample.attributes.OPENCGA_CLINICAL_ANALYSIS = [clinicalAnalysis];
                                }
                            }
                        }
                    });
                    samples.push(...sampleChunk);
                }

                // Samples the user can see according to permissions
                this.numUserTotalSamples = variantResponse.getResponse(0).attributes.numTotalSamples;
                this.approximateCount = variantResponse.getResponse(0).attributes.approximateCount;
                this.requestUpdate();
                return {
                    total: this.numUserTotalSamples,
                    rows: samples
                };
            } else {
                this.requestUpdate();
                return {
                    total: 0,
                    rows: []
                };
            }
        } catch (error) {
            return error;
        }
    }

    _getDefaultColumns() {
        return [
            [
                {
                    title: "Sample ID",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center"
                },
                {
                    title: "Genotype",
                    field: "attributes.OPENCGA_VARIANT",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.genotypeFormatter,
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
                    formatter: value => value || "-",
                    halign: "center"
                },
                {
                    title: "Sex",
                    field: "attributes.OPENCGA_INDIVIDUAL",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (attributesIndividual, sample) => CatalogGridFormatter.sexFormatter(attributesIndividual.sex, attributesIndividual),
                    halign: "center"
                },
                {
                    title: "Disorders",
                    field: "attributes.OPENCGA_INDIVIDUAL.disorders",
                    colspan: 1,
                    rowspan: 1,
                    formatter: disorders => {
                        const result = disorders?.map(disorder => CatalogGridFormatter.disorderFormatter([disorder])).join("<br>");
                        return result || "-";
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
            this.toolbarConfig = {
                ...this.toolbarConfig,
                downloading: true
            };
            this.requestUpdate();
            await this.updateComplete;

            const query = {
                ...this.filters,
                skip: 0,
                limit: 5000,
            };

            // batch size for sample query
            const BATCH_SIZE = 100;

            const samples = await this.fetchData(query, BATCH_SIZE);
            const header = ["Sample ID", "Genotype", "Variant Data", "Individual ID", "Individual Sex", "Phenotypes", "Disorders", "Case ID"];
            if (samples?.rows?.length) {
                const rows = samples.rows.map(sample => {
                    return [
                        sample.id,
                        sample?.attributes?.OPENCGA_VARIANT?.data[0] ?? "-",
                        this.variantFormatter(sample?.attributes?.OPENCGA_VARIANT),
                        sample.individualId,
                        CatalogGridFormatter.sexFormatter(sample?.attributes?.OPENCGA_INDIVIDUAL?.sex, sample?.attributes?.OPENCGA_INDIVIDUAL),
                        sample?.attributes?.OPENCGA_INDIVIDUAL?.phenotypes?.map(p => p.id) ?? "-",
                        sample?.attributes?.OPENCGA_INDIVIDUAL?.disorders?.map(d => d.id) ?? "-",
                        sample?.attributes?.OPENCGA_CLINICAL_ANALYSIS?.map(d => d.id) ?? "-",
                    ].join("\t");
                });
                if (e.detail.option.toLowerCase() === "tab") {
                    const dataString = [
                        header.join("\t"),
                        rows.join("\n")];
                    UtilsNew.downloadData(dataString, "variant_samples_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                } else {
                    UtilsNew.downloadData(JSON.stringify(samples, null, "\t"), "variant_samples_" + this.opencgaSession.study.id + ".json", "application/json");
                }
            }
        } catch (e) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
        } finally {
            this.toolbarConfig = {
                ...this.toolbarConfig,
                downloading: false
            };
            this.requestUpdate();
        }
    }

    onSelectFilterChange(e) {
        this._genotypeFilter = e.detail?.value;
    }

    onSearch() {
        this.genotypeFilter = this._genotypeFilter;
        this.renderTable();
    }

    render() {
        return html`
            <div>
                ${this.numSamples !== this.numUserTotalSamples ? html`
                    <div class="alert alert-warning">
                        <i class="fas fa-3x fa-exclamation-circle align-middle"></i>
                        Number of samples found is <span style="font-weight: bold">${this.numSamples}</span>
                        ${this.approximateCount === true ? html` (<i>please note this is an estimated number</i>)` : ""}, and
                        your user account has permission to view <span style="font-weight: bold">${this.numUserTotalSamples} samples</span>.
                        Note that you might not have permission to view all samples for any variant.
                    </div>
                ` : nothing}

                <div class="row" style="margin-top: 20px">
                    <div class="col-md-12">
                        <div class="col-md-4"><label>Select genotypes:</label></div>
                    </div>
                    <div class="col-md-12">
                        <div class="col-md-4">
                            <div class="input-group">
                                <select-field-filter
                                    multiple
                                    .data="${this.config.genotypes}"
                                    .value=${this.selectedGenotypes}
                                    .multiple=${"true"}
                                    .selectedTextFormat=${"count > 3"}
                                    @filterChange="${this.onSelectFilterChange}">
                                </select-field-filter>
                                <span class="input-group-btn">
                                <button class="btn btn-default" type="button" @click="${this.onSearch}">
                                    <i class="fas fa-search"></i> Search
                                </button>
                            </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin: 5px 0">
                    <opencb-grid-toolbar
                        .opencgaSession="${this.opencgaSession}"
                        .settings="${this.toolbarSettings}"
                        .config="${this.toolbarConfig}"
                        @columnChange="${this.onColumnChange}"
                        @download="${this.onDownload}"
                        @export="${this.onDownload}">
                    </opencb-grid-toolbar>
                </div>

                <div>
                    <table id="${this._prefix}SampleTable"></table>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            genotypes: [
                {
                    id: "Main Alternate Genotypes",
                    fields: [
                        {
                            id: "0/1", name: "Heterozygous (0/1)"
                        },
                        {
                            id: "1/1", name: "Homozygous Alternate (1/1)"
                        },
                        {
                            id: "1", name: "Haploid (1)"
                        },
                        {
                            id: "1/2", name: "Biallelic (1/2)"
                        },
                    ]
                },
                // {
                //     separator: true
                // },
                {
                    id: "Secondary Alternate Genotypes",
                    fields: [
                        {
                            id: "0/2", name: "Heterozygous (0/2)"
                        },
                        {
                            id: "2/2", name: "Homozygous (2/2)"
                        },
                        {
                            id: "./.", name: "Missing (./0, ./1, ./.)"
                        },
                    ]
                },
            ],

        };
    }

}

customElements.define("variant-samples", VariantSamples);
