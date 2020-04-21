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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../../utilsNew.js";
import {consequenceTypes, proteinSubstitutionScore} from "../../commons/opencga-variant-contants.js";

export default class VariantAnnotationClinicalView extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            traitAssociation: {
                type: Array
            },
            geneTraitAssociation: {
                type: Array
            }
        }
    }

    _init() {
        this._prefix = "vacv" + UtilsNew.randomString(6);
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);

        this.renderVariantTraitTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("traitAssociation")) {
            this.renderVariantTraitTable();
        }
        if (changedProperties.has("geneTraitAssociation")) {
            this.renderGeneTraitTable();
        }
    }

    idFormatter(value, row, index) {
        let html = "-";
        if (row) {
            switch(row.source.name.toLowerCase()) {
                case "clinvar":
                    if (row.id.startsWith("RCV")) {
                        html = `<a href="https://www.ncbi.nlm.nih.gov/clinvar/${row.id}" target="_blank">${row.id}</a>`;
                    } else {
                        html = `<a href="https://www.ncbi.nlm.nih.gov/clinvar/variation/${row.id}" target="_blank">${row.id}</a>`;
                    }
                    break;
                case "cosmic":
                    html = `<a href="https://cancer.sanger.ac.uk/cosmic/search?q=${row.id}" target="_blank">${row.id}</a>`;
                    break;
            }
        }
        return html;
    }

    sourceFormatter(value, row, index) {
        let name = "-";
        if (value) {
            switch(value.name) {
                case "clinvar":
                    name = "ClinVar";
                    break;
                case "cosmic":
                    name = "COSMIC";
                    break;
            }
        }
        return name;
    }

    geneFormatter(value, row, index) {
        let genes = [];
        if (value) {
            for (let geneIndex in value) {
                if (value[geneIndex].featureType === "gene") {
                    genes.push(value[geneIndex].xrefs.symbol);
                }
            }
        }
        if (genes.length === 0) {
            return "-";
        } else {
            return genes.join(", ")
        }
    }

    heritableTraitsFormatter(value, row, index) {
        let traits = [];
        if (value) {
            for (let traitIndex in value) {
                if (value[traitIndex].trait !== "not specified" && value[traitIndex].trait !== "not provided") {
                    traits.push(value[traitIndex].trait);
                }
            }
        }
        if (traits.length === 0) {
            return "-";
        } else {
            return traits.join("<br>")
        }
    }

    clinicalSignificanceFormatter(value, row, index) {
        let result = "-";
        if (value && value.clinicalSignificance) {
            result = value.clinicalSignificance;
        }
        return result;
    }

    alleleOriginFormatter(value, row, index) {
        if (value) {
            return value.join("<br>");
        }
    }

    tumourSiteFormatter(value, row, index) {
        let result = "-";
        if (value) {
            let primary = value.primarySite ? value.primarySite : "";
            let subtype = value.siteSubtype ? value.siteSubtype : "";
            if (primary !== "") {
                result = primary;
            }
            if (subtype !== "") {
                result += " (" + subtype + ")";
            }
        }
        return result;
    }

    tumourHistologyFormatter(value, row, index) {
        let result = "-";
        if (value) {
            let primary = value.primaryHistology ? value.primaryHistology : "";
            let subtype = value.histologySubtype ? value.histologySubtype : "";
            if (primary !== "") {
                result = primary;
            }
            if (subtype !== "") {
                result += " (" + subtype + ")";
            }
        }
        return result;
    }


    renderVariantTraitTable() {
        if (!this.traitAssociation) {
            this.traitAssociation = [];
        }

        $('#' + this._prefix + 'ConsequenceTypeTable').bootstrapTable('destroy');
        $('#' + this._prefix + 'ConsequenceTypeTable').bootstrapTable({
            data: this.traitAssociation,
            pagination: false,
            columns: [
                [
                    {
                        title: 'ID',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.idFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Source',
                        field: 'source',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.sourceFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Gene',
                        field: 'genomicFeatures',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.geneFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Heritable Traits',
                        field: 'heritableTraits',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.heritableTraitsFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Clinical Significance',
                        field: 'variantClassification',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.clinicalSignificanceFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Origin Type',
                        field: 'alleleOrigin',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.alleleOriginFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Cancer',
                        rowspan: 1,
                        colspan: 3,
                        halign: "center"
                    },
                ], [
                    {
                        title: 'Tumour Site',
                        field: "somaticInformation",
                        formatter: this.tumourSiteFormatter,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: 'Tumour Histology',
                        field: "somaticInformation",
                        formatter: this.tumourHistologyFormatter,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: 'Tumour Origin',
                        field: "somaticInformation.tumourOrigin",
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                ]
            ],
        });
    }

    renderGeneTraitTable() {

    }

    render() {
        return html`
            <div style="padding: 10px 20px">
                <h3>Variant Trait Associations</h3>
                <table id="${this._prefix}ConsequenceTypeTable"></table>
            </div>
        `;
    }
}

customElements.define('variant-annotation-clinical-view', VariantAnnotationClinicalView);
