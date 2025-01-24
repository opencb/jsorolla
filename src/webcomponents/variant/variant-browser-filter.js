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
import "../commons/filters-toolbar.js";
import "../commons/filters/cadd-filter.js";
import "../commons/filters/biotype-filter.js";
import "../commons/filters/variant-filter.js";
import "../commons/filters/region-filter.js";
import "../commons/filters/clinvar-accessions-filter.js";
import "../commons/filters/clinical-annotation-filter.js";
import "../commons/filters/cohort-stats-filter.js";
import "../commons/filters/consequence-type-filter.js";
import "../commons/filters/consequence-type-select-filter.js";
import "../commons/filters/role-in-cancer-filter.js";
import "../commons/filters/conservation-filter.js";
import "../commons/filters/disease-panel-filter.js";
import "../commons/filters/feature-filter.js";
import "../commons/filters/variant-file-format-filter.js";
import "../commons/filters/fulltext-search-accessions-filter.js";
import "../commons/filters/go-accessions-filter.js";
import "../commons/filters/hpo-accessions-filter.js";
import "../commons/filters/population-frequency-filter.js";
import "../commons/filters/protein-substitution-score-filter.js";
import "../commons/filters/sample-genotype-filter.js";
import "../commons/filters/individual-hpo-filter.js";
import "./family-genotype-modal.js";
import "../commons/filters/study-filter.js";
import "../commons/filters/variant-file-filter.js";
import "../commons/filters/variant-file-info-filter.js";
import "../commons/filters/variant-type-filter.js";
import "../commons/filters/variant-ext-svtype-filter.js";
import "../commons/filters/variant-caller-info-filter.js";

export default class VariantBrowserFilter extends LitElement {

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
            preparedQuery: {
                type: Object,
            },
            executedQuery: {
                type: Object,
            },
            resource: {
                type: String,
            },
            toolId: {
                type: String,
            },
            searchActive: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            const defaultConfig = this.getDefaultConfig();
            this._config = {
                ...defaultConfig,
                ...this.config,
                activeFilters: {
                    ...defaultConfig.activeFilters,
                    ...this.config.activeFilters,
                },
            };
        }

        super.update(changedProperties);
    }

    renderFilter(subsection, onFilterChange, preparedQuery, opencgaSession, disabled) {
        let content = nothing;
        switch (subsection.id) {
            case "study":
                const sampleSelected = !!preparedQuery?.sample;
                content = html`
                    ${sampleSelected ? html`
                        <div class="alert alert-warning" role="alert">
                            You can not select multiple studies if at least one sample has been selected in <b>Sample Filter</b>.
                        </div>
                    ` : nothing}
                    <study-filter
                        .value="${preparedQuery.study}"
                        .opencgaSession="${opencgaSession}"
                        .config="${{disabled: sampleSelected}}"
                        @filterChange="${e => onFilterChange("study", e.detail.value)}">
                    </study-filter>
                `;
                break;
            case "sample":
                const multiStudySelected = preparedQuery?.study?.split(/[,;]/)?.length > 1;
                content = html`
                    ${multiStudySelected ? html`
                        <div class="alert alert-warning" role="alert">
                            You cannot select samples if more than one study has been selected in <b>Study Filter</b>.
                        </div>
                    ` : nothing}
                    <catalog-search-autocomplete
                        title="${multiStudySelected ? "You cannot select samples with more than one study" : ""}"
                        .value="${preparedQuery.sample}"
                        .opencgaSession="${opencgaSession}"
                        .resource="${"SAMPLE"}"
                        .config="${{multiple: true, maxItems: 3, disabled: multiStudySelected}}"
                        @filterChange="${e => onFilterChange("sample", e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
                break;
            case "cohort":
                // FIXME subsection.cohorts must be renamed to subsection.studies
                if (subsection.onlyCohortAll === true || subsection.studies?.[0].cohorts?.length > 0) {
                    content = html`
                        <cohort-stats-filter
                            .opencgaSession="${opencgaSession}"
                            .cohorts="${subsection.studies}"
                            .onlyCohortAll=${subsection.onlyCohortAll}
                            .cohortStatsAlt="${preparedQuery.cohortStatsAlt}"
                            @filterChange="${e => onFilterChange("cohortStatsAlt", e.detail.value)}">
                        </cohort-stats-filter>`;
                } else {
                    content = "No cohort stats available.";
                }
                break;
            case "family-genotype":
                content = html`
                    <family-genotype-modal
                        .opencgaSession="${opencgaSession}"
                        .clinicalAnalysis="${subsection.clinicalAnalysis}"
                        .genotype="${preparedQuery.sample}"
                        @filterChange="${e => onFilterChange({sample: "sample"}, e.detail.value)}">
                    </family-genotype-modal>
                `;
                break;
            case "sample-genotype":
                // Josemi Note 20240730 - We had to change the value of the falsy expression to 'null' to prevent unnecesary
                // renders, as if we keep an empty object '{}' as falsy expression Lit will treat it as a new configuration object
                // and will force the select-field-filter to load the genotypes as a new data, even the genotypes list is the same.
                const sampleConfig = subsection.params?.genotypes ? {genotypes: subsection.params.genotypes} : null;
                content = html`
                    <sample-genotype-filter
                        .sample="${preparedQuery.sample}"
                        .config="${sampleConfig || {}}"
                        @filterChange="${e => onFilterChange("sample", e.detail.value)}">
                    </sample-genotype-filter>    
                `;
                break;
            case "individual-hpo":
                content = html`
                    <individual-hpo-filter
                        .individual="${subsection.params?.individual}"
                        .value="${preparedQuery?.["annot-hpo"]}"
                        .disabled="${disabled}"
                        @filterChange="${e => onFilterChange("annot-hpo", e.detail.value)}">
                    </individual-hpo-filter>
                `;
                break;
            case "variant-file":
                content = html`
                    <variant-file-filter
                        .files="${subsection.params?.files}"
                        .value="${preparedQuery.file}"
                        @filterChange="${e => onFilterChange("file", e.detail.value)}">
                    </variant-file-filter>
                `;
                break;
            case "file-quality":
            case "variant-file-sample-filter":
                content = html`
                    <variant-file-format-filter
                        .sampleData="${preparedQuery.sampleData}"
                        .opencgaSession="${opencgaSession}"
                        @filterChange="${e => onFilterChange("sampleData", e.detail.value)}">
                    </variant-file-format-filter>
                `;
                break;
            case "variant-file-info-filter":
                content = html`
                    <variant-file-info-filter
                        .files="${subsection.params?.files}"
                        .visibleCallers="${subsection.params?.visibleCallers}"
                        .study="${subsection.params?.study || opencgaSession.study}"
                        .fileData="${preparedQuery.fileData}"
                        .opencgaSession="${subsection.params?.opencgaSession || opencgaSession}"
                        @filterChange="${e => onFilterChange("fileData", e.detail.value)}">
                    </variant-file-info-filter>
                `;
                break;
            case "variant":
                content = html`
                    <variant-filter
                        .id="${preparedQuery.id}"
                        @filterChange="${e => onFilterChange("id", e.detail.value)}">
                    </variant-filter>
                `;
                break;
            case "region":
                content = html`
                    <region-filter
                        .cellbaseClient="${opencgaSession.cellbaseClient}"
                        .region="${preparedQuery.region}"
                        @filterChange="${e => onFilterChange("region", e.detail.value)}">
                    </region-filter>
                `;
                break;
            case "feature":
                content = html`
                    <feature-filter
                        .query=${preparedQuery}
                        .cellbaseClient="${opencgaSession.cellbaseClient}"
                        @filterChange="${e => onFilterChange("xref", e.detail.value)}">
                    </feature-filter>
                `;
                break;
            case "biotype":
                content = html`
                    <biotype-filter
                        .biotype=${preparedQuery.biotype}
                        .config="${subsection}"
                        @filterChange="${e => onFilterChange("biotype", e.detail.value)}">
                    </biotype-filter>
                `;
                break;
            case "type":
                content = html`
                    <variant-type-filter
                        .type="${preparedQuery.type}"
                        .config="${subsection.params?.types ? {types: subsection.params.types} : {}}"
                        .disabled="${disabled}"
                        @filterChange="${e => onFilterChange("type", e.detail.value)}">
                    </variant-type-filter>
                `;
                break;
            case "populationFrequency":
                content = html`
                    <population-frequency-filter
                        .populationFrequencies="${subsection.params?.populationFrequencies}"
                        .allowedFrequencies="${subsection.params?.allowedFrequencies}"
                        .populationFrequencyIndexConfiguration="${subsection.params?.populationFrequencyIndexConfiguration}"
                        ?showSetAll="${subsection.params?.showSetAll}"
                        .populationFrequencyAlt="${preparedQuery.populationFrequencyAlt}"
                        @filterChange="${e => onFilterChange("populationFrequencyAlt", e.detail.value)}">
                    </population-frequency-filter>
                `;
                break;
            case "consequence-type":
            case "consequenceTypeSelect":
                content = html`
                    <consequence-type-select-filter
                        .ct="${preparedQuery.ct}"
                        .config="${subsection.params?.consequenceTypes || CONSEQUENCE_TYPES}"
                        @filterChange="${e => onFilterChange("ct", e.detail.value)}">
                    </consequence-type-select-filter>
                `;
                break;
            case "role-in-cancer":
                content = html`
                    <role-in-cancer-filter
                        .config="${subsection.params?.rolesInCancer || ROLE_IN_CANCER}"
                        .roleInCancer="${preparedQuery.geneRoleInCancer}"
                        .disabled="${disabled}"
                        @filterChange="${e => onFilterChange("geneRoleInCancer", e.detail.value)}">
                    </role-in-cancer-filter>
                `;
                break;
            case "proteinSubstitutionScore":
                content = html`
                    <protein-substitution-score-filter
                        .proteinSubstitution="${preparedQuery.proteinSubstitution}"
                        @filterChange="${e => onFilterChange("proteinSubstitution", e.detail.value)}">
                    </protein-substitution-score-filter>
                `;
                break;
            case "cadd":
                content = html`
                    <cadd-filter
                        .annot-functional-score="${preparedQuery["annot-functional-score"]}"
                        @filterChange="${e => onFilterChange("annot-functional-score", e.detail.value)}">
                    </cadd-filter>
                `;
                break;
            case "conservation":
                content = html`
                    <conservation-filter
                        .conservation="${preparedQuery.conservation}"
                        @filterChange="${e => onFilterChange("conservation", e.detail.value)}">
                    </conservation-filter>
                `;
                break;
            case "go":
                content = html`
                    <go-accessions-filter
                        .go="${preparedQuery.go}"
                        .cellbaseClient="${opencgaSession.cellbaseClient}"
                        @ontologyModalOpen="${this.onOntologyModalOpen}"
                        @filterChange="${e => this.onFilterChange("go", e.detail.value)}">
                    </go-accessions-filter>
                `;
                break;
            case "hpo":
                content = html`
                    <hpo-accessions-filter
                        .annot-hpo="${preparedQuery["annot-hpo"]}"
                        .cellbaseClient="${opencgaSession.cellbaseClient}"
                        @ontologyModalOpen="${this.onOntologyModalOpen}"
                        @filterChange="${e => onFilterChange("annot-hpo", e.detail.value)}">
                    </hpo-accessions-filter>
                `;
                break;
            case "diseasePanels":
                const diseaseFilterKeys = {
                    panel: "panel",
                    panelFeatureType: "panelFeatureType",
                    panelModeOfInheritance: "panelModeOfInheritance",
                    panelConfidence: "panelConfidence",
                    panelRoleInCancer: "panelRoleInCancer",
                    panelIntersection: "panelIntersection",
                };
                content = html`
                    <disease-panel-filter
                        .opencgaSession="${opencgaSession}"
                        .diseasePanels="${opencgaSession.study.panels}"
                        .panel="${preparedQuery.panel}"
                        .panelFeatureType="${preparedQuery.panelFeatureType}"
                        .panelModeOfInheritance="${preparedQuery.panelModeOfInheritance}"
                        .panelConfidence="${preparedQuery.panelConfidence}"
                        .panelRoleInCancer="${preparedQuery.panelRoleInCancer}"
                        .panelIntersection="${preparedQuery.panelIntersection}"
                        .showPanelTitle="${true}"
                        .disabled="${disabled}"
                        .showExtendedFilters="${true}"
                        @filterChange="${e => onFilterChange(diseaseFilterKeys, e.detail.query)}">
                    </disease-panel-filter>
                `;
                break;
            case "clinical-annotation":
                const clinicalFilterKeys = {
                    clinical: "clinical",
                    clinicalSignificance: "clinicalSignificance",
                    clinicalConfirmedStatus: "clinicalConfirmedStatus",
                };
                content = html`
                    <clinical-annotation-filter
                        .clinical="${preparedQuery.clinical}"
                        .clinicalSignificance="${preparedQuery.clinicalSignificance}"
                        .clinicalConfirmedStatus="${preparedQuery.clinicalConfirmedStatus}"
                        @filterChange="${e => onFilterChange(clinicalFilterKeys, e.detail)}">
                    </clinical-annotation-filter>
                `;
                break;
            // case "clinvar": // Deprecated: use clinical instead
            //     content = html`
            //         <clinvar-accessions-filter
            //             .clinvar="${this.preparedQuery.clinvar}"
            //             .clinicalSignificance="${this.preparedQuery.clinicalSignificance}"
            //             @filterChange="${
            //                 e => this.onFilterChange({
            //                     clinvar: "xref",
            //                     clinicalSignificance: "clinicalSignificance"
            //                 }, e.detail.value)}">
            //         </clinvar-accessions-filter>`;
            //     break;
            case "fullTextSearch":
                content = html`
                    <fulltext-search-accessions-filter
                        .traits="${preparedQuery.traits}"
                        @filterChange="${e => onFilterChange("traits", e.detail.value)}">
                    </fulltext-search-accessions-filter>
                `;
                break;
            // case "ext-svtype":
            //     content = html`
            //         <variant-ext-svtype-filter
            //             @filterChange="${e => onVariantCallerInfoFilter(subsection.params.fileId, e.detail.value)}">
            //         </variant-ext-svtype-filter>`;
            //     break;
            // case "caveman":
            // case "strelka":
            // case "pindel":
            // case "ascat":
            // case "canvas":
            // case "brass":
            // case "manta":
            // case "tnhaplotyper2":
            // case "pisces":
            // case "craft":
            //     content = html`
            //         <variant-caller-info-filter
            //             .caller="${subsection.id}"
            //             .fileId="${subsection.params.fileId}"
            //             .fileData="${this.preparedQuery.fileData}"
            //             @filterChange="${e => this.onVariantCallerInfoFilter(subsection.params.fileId, e.detail.value, subsection.callback)}">
            //         </variant-caller-info-filter>`;
            //     break;
            default:
                console.error("Filter component not found: " + subsection.id);
        }

        return content;
    }

    render() {
        return html`
            <filters-toolbar
                .opencgaSession="${this.opencgaSession}"
                .toolId="${this.toolId}"
                .resource="${this.resource}"
                .preparedQuery="${this.preparedQuery}"
                .executedQuery="${this.executedQuery}"
                .searchActive="${this.searchActive}"
                .renderFilter="${this.renderFilter}"
                .config="${this._config}">
            </filters-toolbar>
        `;
    }

    getDefaultConfig() {
        return {
            activeFilters: {
                alias: {
                    "region": "Region",
                    "gene": "Gene",
                    "genotype": "Sample Genotype",
                    "sample": "Sample",
                    "maf": "Cohort Stat MAF",
                    "cohortStatsAlt": "Cohort Stats",
                    "xref": "XRef",
                    "panel": "Disease Panel",
                    "file": "Files",
                    "qual": "QUAL",
                    "filter": "FILTER",
                    "biotype": "Biotype",
                    "ct": "Consequence Type",
                    "annot-functional-score": "CADD",
                    "populationFrequencyAlt": "Population Frequency",
                    "proteinSubstitution": "Protein Substitution",
                    "annot-go": "GO",
                    "annot-hpo": "HPO"
                },
                complexFields: [
                    {id: "sample", separator: ";"},
                    {id: "fileData", separator: ","},
                ],
                hiddenFields: [],
                lockedFields: [],
            },
            sections: [],
            examples: [],
            defaultFilter: {},
        };
    }

}

customElements.define("variant-browser-filter", VariantBrowserFilter);
