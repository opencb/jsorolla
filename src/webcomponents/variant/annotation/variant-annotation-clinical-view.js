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

export default class VariantAnnotationClinicalView extends LitElement {

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
            traitAssociation: {
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
    }

    firstUpdated() {
        this.renderVariantTraitTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }
        if (changedProperties.has("traitAssociation")) {
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
                        this.traitAssociation = this.variantAnnotation.traitAssociation;
                    });
            }
        }
    }

    idFormatter(value, row) {
        let html = "-";
        if (row) {
            switch (row.source.name.toLowerCase()) {
                case "clinvar":
                    if (row.id.startsWith("RCV")) {
                        html = `<a href="https://www.ncbi.nlm.nih.gov/clinvar/${row.id}" target="_blank">${row.id}</a>`;
                    } else {
                        html = `<a href="${BioinfoUtils.getClinvarVariationLink(row.id)}" target="_blank">${row.id}</a>`;
                    }
                    break;
                case "cosmic":
                    html = `<a href="${BioinfoUtils.getCosmicVariantLink(row.id)}" target="_blank">${row.id}</a>`;
                    break;
            }
        }
        return html;
    }

    sourceFormatter(value) {
        if (value) {
            switch (value.name) {
                case "clinvar":
                    return "ClinVar";
                case "cosmic":
                    return "COSMIC";
                default:
                    console.error("Source not valid: " + value.name);
                    return "-";
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

    heritableTraitsFormatter(value) {
        const traits = [];
        if (value) {
            for (const heritableTrait of value) {
                if (heritableTrait.trait !== "not specified" && heritableTrait.trait !== "not provided") {
                    traits.push(`<div style="margin: 5px 0">${heritableTrait.trait}</div>`);
                }
            }
        }
        if (traits.length > 0) {
            return traits.join("");
        } else {
            return "-";
        }
    }

    inheritanceModeFormatter(value) {
        if (value) {
            const inheritanceModes = value
                .filter(v => v.inheritanceMode)
                .map(v => `<div style="margin: 5px 0">${v.inheritanceMode}</div>`);
            return inheritanceModes.join("") || "-";
        }
        return "-";
    }

    clinicalSignificanceFormatter(value, row) {
        const germlineStarRating = {
            "practice guideline": 4,
            "reviewed by expert panel": 3,
            "criteria provided, multiple submitters, no conflicts": 2,
            "criteria provided, conflicting classifications": 1,
            "criteria provided, single submitter": 1,
            "CRITERIA_PROVIDED_SINGLE_SUBMITTER": 1,
        };

        let result, data;
        const name = row?.source?.name;
        switch (name.toLowerCase()) {
            case "cosmic":
                data = row?.additionalProperties?.filter(item => item.id === "FATHMM_PREDICTION");
                result = `
                    <div>
                        <label>FATHMM Prediction:</label><span style="padding-left: 5px">${Number.parseFloat(data?.[0]?.value) || "NA"}</span>
                    </div>
                `;
                break;
            case "clinvar":
                data = row?.additionalProperties?.filter(item => item.name === "ClinicalSignificance_in_source_file");
                // Prepare star rating HTML
                const starRating = row?.additionalProperties?.filter(item => item.name === "ReviewStatus_in_source_file");
                const starRatingHtml = [];
                for (let i = 0; i < 4; i++) {
                    if (i < germlineStarRating[starRating?.[0]?.value]) {
                        starRatingHtml.push(`<i class="fas fa-star" style="color: darkgoldenrod"></i>`);
                    } else {
                        starRatingHtml.push(`<i class="far fa-star" style="color: darkgoldenrod"></i>`);
                    }
                }
                result = `
                    <div>
                        ${data?.[0]?.value || "-"}
                    </div>
                    <div title="${starRating?.[0]?.value || ""}">
                        ${starRatingHtml?.length > 0 ? starRatingHtml.join("") : ""}
                    </div>
                `;
                break;
            default:
                result = "-";
                break;
        }
        return result;
    }

    alleleOriginFormatter(value) {
        if (value) {
            return value.join("<br>");
        }
        return "-";
    }

    tumourSiteFormatter(value) {
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

    tumourHistologyFormatter(value) {
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

        $("#" + this._prefix + "VariantTraitAssociation").bootstrapTable("destroy");
        $("#" + this._prefix + "VariantTraitAssociation").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
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

    render() {
        return html`
            <h3>Variant Trait Association</h3>
            <div style="padding: 10px">
                <table id="${this._prefix}VariantTraitAssociation"></table>
            </div>
        `;
    }

}

customElements.define("variant-annotation-clinical-view", VariantAnnotationClinicalView);
