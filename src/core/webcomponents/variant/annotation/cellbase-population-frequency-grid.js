/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "./../../../utilsNew.js";

export default class CellbasePopulationFrequencyGrid extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            variantId: {
                type: String
            },
            populationFrequencies: {
                type: Array
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "cpfg-" + UtilsNew.randomString(6);
        this.populationFrequencies = [];
        this.gridId = this._prefix + "populationFreqTable";
    }

    updated(changedProperties) {
        if ((changedProperties.has("populationFrequencies") || changedProperties.has("active")) && this.active) {
            this.renderPlot();
            this.renderTable();
        }
        if ((changedProperties.has("variantId") || changedProperties.has("active")) && this.active) {
            this.variantIdObserver();
        }
    }

    variantIdObserver() {
        console.log("variantIdObserver", this.variantId, this.cellbaseClient);
        if (this.cellbaseClient) {
            if (this.variantId) {
                this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                    .then(restResponse => {
                        this.populationFrequencies = restResponse.getResult(0).populationFrequencies;
                        this.requestUpdate();

                        // this.variant = {id: this.variantId, annotation: response.responses[0].results[0]};
                        // this.variantAnnotation = response.response[0].result[0];
                        /* this.numberConsequenceTypes = 0;
                        this.numberPopulationFrequencies = 0;
                        this.numberVTA = 0;
                        this.numberGTA = 0;

                        if (this.variantAnnotation.geneTraitAssociation != null) {
                            this.numberConsequenceTypes = this.variantAnnotation.consequenceTypes.length;
                            this.numberPopulationFrequencies = UtilsNew.isNotEmptyArray(this.variantAnnotation.populationFrequencies) ? this.variantAnnotation.populationFrequencies.length : 0;
                            this.numberVTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.traitAssociation) ? this.variantAnnotation.traitAssociation.length : 0;
                            this.numberGTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.geneTraitAssociation) ? this.variantAnnotation.geneTraitAssociation.length : 0;
                        }*/
                    });
            } else {
                // this.populationFrequencies = null;
            }
        }
    }

    alleleFormatter(value, row, index) {
        return row.refAllele + "/" + row.altAllele;
    }

    freqFormatter(value, row, index) {
        return (value !== 0 && value !== 1) ? Number(value).toFixed(4) : value;
    }

    renderPlot() {
        const popArray = [];
        const mafArray = [];
        if (typeof this.populationFrequencies !== "undefined") {
            for (let i = 0; i < this.populationFrequencies.length; i++) {
                popArray.push(this.populationFrequencies[i].study + "-" + this.populationFrequencies[i].population);
                mafArray.push(Math.min(Number(this.populationFrequencies[i].refAlleleFreq).toFixed(4), Number(this.populationFrequencies[i].altAlleleFreq).toFixed(4)));
            }
        }

        $("#" + this._prefix + "Container").highcharts({
            chart: {
                type: "bar"
            },
            title: {
                text: "Population Frequencies"
            },
            xAxis: {
                categories: popArray,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: "Minor Allele Frequency (MAF)",
                    align: "high"
                },
                labels: {
                    overflow: "justify"
                },
                max: 0.5
            },
            //                        tooltip: {
            //                            valueSuffix: ' millions'
            //                        },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "top",
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || "#FFFFFF"),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: "Minor Allele Frequency (MAF)",
                data: mafArray
            }]
        });
    }

    renderTable() {
        $("#" + this.gridId).bootstrapTable("destroy");
        $("#" + this.gridId).bootstrapTable({
            data: this.populationFrequencies,
            pageSize: 5,
            showPaginationSwitch: true,
            search: true,
            showColumns: false,
            pagination: true,
            pageList: [5, 10, 25],
            showExport: true,
            columns: [
                [
                    {
                        title: "Study",
                        field: "study",
                        rowspan: 2,
                        colspan: 1,
                        sortable: true
                    },
                    {
                        title: "Population",
                        field: "population",
                        rowspan: 2,
                        colspan: 1
                    },
                    {
                        title: "Ref/Alt",
                        formatter: this.alleleFormatter,
                        rowspan: 2,
                        colspan: 1
                    },
                    {
                        title: "Allele Frequency",
                        rowspan: 1,
                        colspan: 2,
                        formatter: this.alleleFormatter,
                        halign: "center"
                    },
                    {
                        title: "Genotype Frequency",
                        rowspan: 1,
                        colspan: 3,
                        formatter: this.alleleFormatter,
                        halign: "center"
                    }
                ],
                [
                    {
                        title: "Reference",
                        field: "refAlleleFreq",
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: this.freqFormatter,
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: "Alternate",
                        field: "altAlleleFreq",
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: this.freqFormatter,
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: "Ref/Ref",
                        field: "refHomGenotypeFreq",
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: this.freqFormatter,
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: "Ref/Alt",
                        field: "hetGenotypeFreq",
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: this.freqFormatter,
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: "Alt/Alt",
                        field: "altHomGenotypeFreq",
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: this.freqFormatter,
                        halign: "center",
                        align: "right"
                    }
                ]
            ]
        });
    }

    render() {
        if (!this.populationFrequencies) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No population frequencies found.</div>`;
        }
        return html`
            <div style="padding: 20px">
                <table id="${this.gridId}"></table>
                <div id="${this._prefix}Container"></div>
            </div>
        `;
    }

}

customElements.define("cellbase-population-frequency-grid", CellbasePopulationFrequencyGrid);
