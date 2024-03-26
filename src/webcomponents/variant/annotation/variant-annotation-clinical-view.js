/*
 * Copyright 2015-2024 OpenCB
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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";

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
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            variantId: {
                type: String
            },
            traitAssociation: {
                type: Array
            },
            geneTraitAssociation: {
                type: Array
            }
        };
    }

    _init() {
        this._prefix = "vacv" + UtilsNew.randomString(6);
    }

    firstUpdated(_changedProperties) {
        // super.firstUpdated(_changedProperties);
        this.renderVariantTraitTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("traitAssociation")) {
            this.renderVariantTraitTable();
        }

        if (changedProperties.has("geneTraitAssociation")) {
            this.renderGeneTraitTable();
        }
    }

    variantIdObserver() {
        // console.log("variantIdObserver", this.variantId, this.cellbaseClient);
        if (this.cellbaseClient) {
            if (this.variantId) {
                this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                    .then(restResponse => {
                        this.populationFrequencies = restResponse.getResult(0).populationFrequencies;
                        // this.variant = {id: this.variantId, annotation: response.responses[0].results[0]};
                        this.variantAnnotation = restResponse.getResult(0);
                        this.numberConsequenceTypes = 0;
                        this.numberPopulationFrequencies = 0;
                        this.numberVTA = 0;
                        this.numberGTA = 0;

                        // TODO review
                        if (this.variantAnnotation.geneTraitAssociation != null) {

                            this.geneTraitAssociation = this.variantAnnotation.geneTraitAssociation;
                            this.traitAssociation = this.variantAnnotation.traitAssociation;

                            this.numberConsequenceTypes = this.variantAnnotation.consequenceTypes.length;
                            this.numberPopulationFrequencies = UtilsNew.isNotEmptyArray(this.variantAnnotation.populationFrequencies) ? this.variantAnnotation.populationFrequencies.length : 0;
                            this.numberVTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.traitAssociation) ? this.variantAnnotation.traitAssociation.length : 0;
                            this.numberGTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.geneTraitAssociation) ? this.variantAnnotation.geneTraitAssociation.length : 0;
                        }
                        // this.requestUpdate();

                    });
            } else {

            }
        }
    }

    idFormatter(value, row, index) {
        let html = "-";
        if (row) {
            switch (row.source.name.toLowerCase()) {
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
            switch (value.name) {
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
        const genes = [];
        if (value) {
            for (const geneIndex in value) {
                if (value[geneIndex].featureType === "gene") {
                    genes.push(value[geneIndex].xrefs.symbol);
                }
            }
        }
        if (genes.length === 0) {
            return "-";
        } else {
            return genes.join(", ");
        }
    }

    heritableTraitsFormatter(value, row, index) {
        const traits = [];
        if (value) {
            for (const traitIndex in value) {
                if (value[traitIndex].trait !== "not specified" && value[traitIndex].trait !== "not provided") {
                    traits.push(value[traitIndex].trait);
                }
            }
        }
        if (traits.length === 0) {
            return "-";
        } else {
            return traits.join("<br>");
        }
    }

    clinicalSignificanceFormatter(value, row, index) {
        // clinvar - ClinicalSignificance_in_source_file
        // cosmic - FATHMM_PREDICTION
        let result = "-";
        if (value && value.clinicalSignificance) {
            result = value.clinicalSignificance;
        } else {
            const name = row?.source?.name;
            let data;
            switch (name) {
                case "cosmic":
                    data = row?.additionalProperties?.filter(item => item.id === "FATHMM_PREDICTION");
                    result = UtilsNew.isNotEmptyArray(data) ? data[0].value : "-";
                    break;
                case "clinvar":
                    data = row?.additionalProperties?.filter(item => item.id === "ClinicalSignificance_in_source_file");
                    result = UtilsNew.isNotEmptyArray(data) ? data[0].value : "-";
                    break;
                default:
                    result = "-";
                    break;
            }
        }
        return result;
    }

    inheritanceModeFormatter(value, row, index) {
        let result = "-";
        if (value) {
            for (const moi of value) {
                if (moi.inheritanceMode) {
                    result += moi.inheritanceMode + "<br>";
                }
            }
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
            const primary = value.primarySite ? value.primarySite : "";
            const subtype = value.siteSubtype ? value.siteSubtype : "";
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
            const primary = value.primaryHistology ? value.primaryHistology : "";
            const subtype = value.histologySubtype ? value.histologySubtype : "";
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

        $("#" + this._prefix + "ConsequenceTypeTable").bootstrapTable("destroy");
        $("#" + this._prefix + "ConsequenceTypeTable").bootstrapTable({
            data: this.traitAssociation,
            pagination: false,
            columns: [
                [
                    {
                        title: "ID",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.idFormatter,
                        halign: "center"
                    },
                    {
                        title: "Source",
                        field: "source",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.sourceFormatter,
                        halign: "center"
                    },
                    {
                        title: "Gene",
                        field: "genomicFeatures",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.geneFormatter,
                        halign: "center"
                    },
                    {
                        title: "Heritable Traits",
                        field: "heritableTraits",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.heritableTraitsFormatter,
                        halign: "center"
                    },
                    {
                        title: "Mode of Inheritance",
                        field: "heritableTraits",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.inheritanceModeFormatter,
                        halign: "center"
                    },
                    {
                        title: "Clinical Significance",
                        field: "variantClassification",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.clinicalSignificanceFormatter,
                        halign: "center"
                    },
                    {
                        title: "Origin Type",
                        field: "alleleOrigin",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.alleleOriginFormatter,
                        halign: "center"
                    },
                    {
                        title: "Cancer",
                        rowspan: 1,
                        colspan: 3,
                        halign: "center"
                    }
                ], [
                    {
                        title: "Tumour Site",
                        field: "somaticInformation",
                        formatter: this.tumourSiteFormatter,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Tumour Histology",
                        field: "somaticInformation",
                        formatter: this.tumourHistologyFormatter,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Tumour Origin",
                        field: "somaticInformation.tumourOrigin",
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    }
                ]
            ]
        });
    }

    renderGeneTraitTable() {

    }

    render() {
        return html`
            <div style="padding: 20px">
                <table id="${this._prefix}ConsequenceTypeTable"></table>
            </div>
        `;
    }

}

customElements.define("variant-annotation-clinical-view", VariantAnnotationClinicalView);
