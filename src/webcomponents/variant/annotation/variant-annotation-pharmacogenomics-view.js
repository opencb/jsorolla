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

import {html, LitElement} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";

export default class VariantAnnotationPharmacogenomicsView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variantId: {
                type: String
            },
            pharmacogenomics: {
                type: Array
            },
            cellbaseClient: {
                type: Object
            },
            assembly: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.pharmacogenomics = [];
    }

    firstUpdated() {
        this.renderVariantTraitTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }
        if (changedProperties.has("pharmacogenomics")) {
            this.renderVariantTraitTable();
        }
    }

    variantIdObserver() {
        if (this.cellbaseClient) {
            if (this.variantId) {
                this.cellbaseClient
                    .get("genomic", "variant", this.variantId, "annotation", {assembly: this.assembly || this.opencgaSession.project.organism.assembly}, {})
                    .then(restResponse => {
                        this.variantAnnotation = restResponse.getResult(0);
                        this.pharmacogenomics = this.variantAnnotation.pharmacogenomics || [];
                    });
            }
        }
    }

    geneFormatter(value) {
        if (value) {
            const genes = value
                .filter(v => v.featureType === "gene")
                .map(v => v.xrefs.symbol);
            return genes?.length > 0 ? genes.join(", ") : "-";
        }
        return "-";
    }

    renderVariantTraitTable() {
        if (!this.pharmacogenomics) {
            this.pharmacogenomics = [];
        }

        $("#" + this._prefix + "Pharmacogenomics").bootstrapTable("destroy");
        $("#" + this._prefix + "Pharmacogenomics").bootstrapTable({
            data: this.pharmacogenomics,
            theadClasses: "table-light",
            buttonsClass: "light",
            pagination: false,
            columns: [
                [
                    {
                        title: "ID",
                        field: "id",
                        rowspan: 2,
                        colspan: 1,
                        formatter: value => `<a target="_blank" href="${BioinfoUtils.getPharmGKBLink(value)}">${value}</a>`,
                        halign: "center"
                    },
                    {
                        title: "Name",
                        field: "name",
                        rowspan: 2,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Type",
                        field: "types",
                        rowspan: 2,
                        colspan: 1,
                        formatter: value => value.join(", "),
                        halign: "center"
                    },
                    // {
                    //     title: "Source",
                    //     field: "source",
                    //     rowspan: 2,
                    //     colspan: 1,
                    //     halign: "center"
                    // },
                    {
                        title: "Annotation",
                        // field: "source",
                        rowspan: 1,
                        colspan: 8,
                        halign: "center"
                    },
                ],
                [
                    {
                        title: "Variant ID",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => v.variantId).join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "PharmGKB Annotation",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => `<a target="_blank" href="${v.url}">View</a>`).join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "Gene",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => v.geneNames?.join(";")).join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "Phenotypes",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => v.phenotypes?.join(";<br>")).join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "Score",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => v.score).join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "Confidence",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => v.confidence).join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "PubMed",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value
                            .map(v => v.pubmed?.map(p => `<a target="_blank" href="${BioinfoUtils.getPubmedLink(p)}">${p}</a>`).join("<br>"))
                            .join("<hr>"),
                        halign: "center"
                    },
                    {
                        title: "Summary",
                        field: "annotations",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => value.map(v => v.summary).join("<hr>"),
                        halign: "center"
                    },
                ]
            ]
        });
    }

    render() {
        return html`
            <h3>Pharmacogenomics</h3>
            <div style="padding: 10px">
                <h4>PharmaGKB</h4>
                <div style="padding: 10px">
                    ${this.pharmacogenomics?.length > 0 ? html`
                        <table id="${this._prefix}Pharmacogenomics"></table>
                    ` : html`<p>No data available</p>`}
                </div>
            </div>
        `;
    }

}

customElements.define("variant-annotation-pharmacogenomics-view", VariantAnnotationPharmacogenomicsView);
