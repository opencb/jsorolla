/*
 * Copyright 2015-2023 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import VariantGridFormatter from "./variant-grid-formatter.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";

export default class VariantClinicalEvidenceView extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalVariant: {
                type: Object
            },
            review: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.newEvidences = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalVariant")) {
            this.renderClinicalEvidenceTable();
        }

        // this._config = {
        //     ...this.getDefaultConfig(),
        //     ...this.config,
        // };
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalVariant")) {
            console.log("init variant.....");
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        BioinfoUtils.sort(this.clinicalVariant.evidences, v => v.genomicFeature?.geneName);
        const transcriptMap = new Map();
        const evidences = [];
        this.clinicalVariant.annotation.consequenceTypes.forEach(ct => transcriptMap.set(ct.transcriptId, ct));
        this.clinicalVariant.evidences.forEach((evidence, index) => {
            // we are missing regulatory variants
            if (evidence.genomicFeature?.transcriptId) {
                const newEvidence = {
                    index,
                    ...evidence,
                    ...transcriptMap.get(evidence.genomicFeature.transcriptId)
                };
                evidences.push(newEvidence);
            }
        });
        // const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(newEvidences, this.config).indexes;
        this.newEvidences = [...evidences];
    }

    getCtByTranscriptId(evidence) {
        return this.clinicalVariant.annotation?.consequenceTypes
            ?.find(ct => ct.ensemblTranscriptId === evidence.genomicFeature.transcriptId || ct.transcriptId === evidence.genomicFeature.transcriptId);
    }

    geneFormatter(value, row, index) {
        if (row.genomicFeature.geneName) {
            return `
                <div>
                    <a href="${BioinfoUtils.getGeneNameLink(row.genomicFeature.geneName)}" target="_blank">
                        ${row.genomicFeature.geneName}
                    </a>
                </div>
                <div style="margin: 5px 0px">
                    <a href="${BioinfoUtils.getGeneLink(row.genomicFeature.id)}" target="_blank">
                        ${row.genomicFeature.id || ""}
                    </a>
                </div>`;
        } else {
            return "-";
        }
    }

    transcriptFormatter(value, row, index) {
        const ct = this.getCtByTranscriptId(row);
        if (row.genomicFeature.transcriptId) {
            return `
                <div style="">
                    <span>${ct?.biotype ? ct.biotype : "-"}</span>
                </div>
                <div style="margin: 5px 0px">
                    <span>
                        ${row.genomicFeature.transcriptId ? `
                            <div style="margin: 5px 0px">
                                ${VariantGridFormatter.getHgvsLink(row.genomicFeature.transcriptId, this.clinicalVariant.annotation.hgvs) || ""}
                            </div>
                            <div style="margin: 5px 0px">
                                ${VariantGridFormatter.getHgvsLink(ct?.proteinVariantAnnotation?.proteinId, this.clinicalVariant.annotation.hgvs) || ""}
                            </div>` : ""
                        }
                    </span>
                </div>`;
        } else {
            return "-";
        }
    }

    consequenceTypesFormatter(value, row, index) {
        if (row.genomicFeature.consequenceTypes?.length > 0) {
            return row.genomicFeature.consequenceTypes.map(so => {
                const color = CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black";
                return `
                    <div style="color: ${color}; margin-bottom: 5px">
                        <span style="padding-right: 5px">${so.name}</span>
                        <a title="Go to Sequence Ontology ${so.accession} term"
                            href="${BioinfoUtils.getSequenceOntologyLink(so.accession)}" target="_blank">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>`;
            });
        } else {
            return "-";
        }
    }

    transcriptFlagFormatter(value, row, index) {
        const ct = this.getCtByTranscriptId(row);
        if ((ct?.transcriptId || ct?.ensemblTranscriptId) && (ct?.transcriptFlags?.length > 0 || ct?.transcriptAnnotationFlags?.length > 0)) {
            return ct.transcriptFlags ?
                ct.transcriptFlags.map(flag => `<div style="margin-bottom: 5px">${flag}</div>`).join("") :
                ct.transcriptAnnotationFlags.map(flag => `<div style="margin-bottom: 5px">${flag}</div>`).join("");
        } else {
            return "-";
        }
    }

    diseasePanelFormatter(value, row, index) {
        if (row.panelId) {
            // TODO should we fetch the panel from the case instead the study?
            const panel = this.opencgaSession?.study?.panels?.find(panel => panel.id === row.panelId);
            if (panel) {
                const gene = panel.genes.find(gene => gene.id === row.genomicFeature.geneName || gene.name === row.genomicFeature.geneName);
                const confidenceColor = gene.confidence === "HIGH" ? "green" : gene.confidence === "MEDIUM" ? "darkorange" : "red";
                return `
                    <div style="margin: 5px 0">
                        ${panel.source?.project?.toUpperCase() === "PANELAPP" ? `
                            <div>
                                <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" title="Panel ID: ${panel.id}" target="_blank">
                                    ${panel.name} (${panel.source.project} v${panel.source.version})
                                </a>
                            </div>` : `
                                <div style="margin: 5px 0">${panel.id}</div>`
                        }
                    </div>
                    ${gene.modesOfInheritance ? `
                        <div class="help-block" style="margin: 5px 0" title="Panel Mode of Inheritance of gene ${gene.name}">${gene.modesOfInheritance.join(", ")}</div>
                        ` : ""
                    }
                    ${gene.confidence ? `
                        <div style="color: ${confidenceColor}" title="Panel Confidence of gene ${gene.name}">${gene.confidence}</div>
                        ` : ""
                    }
                `;
            } else {
                return row.panelId;
            }
        } else {
            return "-";
        }
    }

    roleInCancerFormatter(value, row, index) {
        if (row.rolesInCancer) {
            return row.rolesInCancer
                .map(v => v.match(/^TUMOR_SUP{1,2}RESSOR_GENE$/) ? "TSG" : v)
                .join(", ");
        } else {
            return "-";
        }
    }

    acmgPredictionFormatter(value, row, index) {
        if (row.classification?.clinicalSignificance || row.classification?.acmg?.length > 0) {
            return ` ${row.classification?.clinicalSignificance ? `
                        <div style="margin: 5px 0; color: ${CLINICAL_SIGNIFICANCE_SETTINGS[row.classification.clinicalSignificance].color}">
                            ${CLINICAL_SIGNIFICANCE_SETTINGS[row.classification.clinicalSignificance].id}
                        </div>
                    ` : ""}
                <div class="help-block">${row.classification.acmg?.map(acmg => acmg.classification || acmg)?.join(", ")}</div>`;
        } else {
            return "-";
        }
    }

    acmgCustomFormatter(value, row, index) {
        if (row.review?.clinicalSignificance || row.review?.acmg?.length > 0) {
            return `
                ${row.review?.clinicalSignificance ? `
                    <div style="margin: 5px 0; color: ${CLINICAL_SIGNIFICANCE_SETTINGS[row.review.clinicalSignificance].color}">
                        ${CLINICAL_SIGNIFICANCE_SETTINGS[row.review.clinicalSignificance].id}
                    </div>
                ` : ""
            }
                <div class="help-block">${row.review.acmg?.map(acmg => acmg.classification)?.join(", ")}</div>
            `;
        } else {
            return "-";
        }
    }


    tierFormatter(value, row, index) {
        let color = "black";
        if (row.review?.tier) {
            const tierClassification = row.review.tier?.toUpperCase();
            color = (tierClassification === "TIER1" || tierClassification === "TIER 1") ? "red" : color;
            color = (tierClassification === "TIER2" || tierClassification === "TIER 2") ? "darkorange" : color;
            color = (tierClassification === "TIER3" || tierClassification === "TIER 3") ? "blue" : color;
            return `<span style="color: ${color}">${row.review.tier}</span>`;
        } else {
            return "-";
        }
    }


    renderClinicalEvidenceTable() {
        // debugger;
        // if (!this.newEvidences) {
        //     this.newEvidences = [];
        // }

        $("#" + this._prefix + "ClinicalEvidence").bootstrapTable("destroy");
        $("#" + this._prefix + "ClinicalEvidence").bootstrapTable({
            data: this.newEvidences,
            pagination: false,
            columns: [
                [
                    {
                        title: "Gene",
                        field: "genomicFeatures.geneName",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row, index) => this.geneFormatter(value, row, index),
                        halign: "center"
                    },
                    {
                        title: "Transcript",
                        field: "genomicFeatures.transcriptId",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row, index) => this.transcriptFormatter(value, row, index),
                        halign: "center"
                    },
                    {
                        title: "Consequence Type",
                        field: "genomicFeatures.consequenceTypes",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row, index) => this.consequenceTypesFormatter(value, row, index),
                        halign: "center"
                    },
                    {
                        title: "Transcript Flags",
                        field: "genomicFeatures.transcriptId",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row, index) => this.transcriptFlagFormatter(value, row, index),
                        halign: "center"
                    },
                    {
                        title: "Disease Panel",
                        field: "genomicFeatures.panelId",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row, index) => this.diseasePanelFormatter(value, row, index),
                        halign: "center"
                    },
                    {
                        title: "Automatic Prediction",
                        field: "classification.clinicalSignificance",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row, index) => this.acmgPredictionFormatter(value, row, index),
                        halign: "center"
                    },
                    {
                        title: "User Classification",
                        rowspan: 1,
                        colspan: 4,
                        halign: "center"
                    }
                ], [
                    {
                        title: "ACMG",
                        field: "classification.clinicalSignificance",
                        formatter: (value, row, index) => this.acmgCustomFormatter(value, row, index),
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Tier",
                        field: "review.tier",
                        formatter: (value, row, index) => this.tierFormatter(value, row, index),
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Select",
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Edit",
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
            <div style="padding: 20px">
                <table id="${this._prefix}ClinicalEvidence"></table>
            </div>
        `;
    }

}

customElements.define("variant-clinical-evidence-view", VariantClinicalEvidenceView);
