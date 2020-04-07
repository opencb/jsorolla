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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../utils.js";
import UtilsNew from "../../utilsNew.js";
import "./opencga-variant-filter.js";
import "./opencga-variant-interpretation-grid.js";
import "./opencga-variant-interpretation-detail.js";
import "../commons/opencga-active-filters.js";

export default class OpencgaVariantFamilyAnalysis extends LitElement {

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
            query: {
                type: Object
            },
            mode: {
                type: String
            },
            cellbaseClient: {
                type: Object
            },
            active: {
                type: Boolean
            },
            consequenceTypes: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "ovdna" + Utils.randomString(6) + "_";

        this.existParent = true;
        this._samples = [];
        this._sampleIds = [];
        this._individualToSampleIds = {};

        // Initially we set the default config, this will be overridden if 'config' is passed
        // this._config = this.getDefaultConfig();

        // this.mode = "interactive";
        this.active = true;
    }

    // TODO RECHECK
    // ADD FLAG to avoid repeated calls
    connectedCallback() {
        super.connectedCallback();
        // since _config.filter.menu.skipSubsections in going to be edited, a deep copy of this.config is required
        const _config = $.extend( true, this.getDefaultConfig(), this.config, {
            title: this.getDefaultConfig().title,
            tooltip: this.getDefaultConfig().tooltip
        } );
        if (this.mode !== "interactive") {
            _config.filter.skipSubsections.push("sample");
        }
        this._config = _config;
        this._addTooltip();
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("active")) {
            this.activeObserver();
        }
    }

    firstUpdated(_changedProperties) {

    }

    clinicalAnalysisObserver() {

        console.log("clinicalAnalysisObserver", this.clinicalAnalysis);

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis)) {
            this._calculateSamples();

            if (this.mode !== "interactive" && UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.roleToProband)) {
                let _existParent = false;
                debugger;
                for (const individualId of Object.keys(this.clinicalAnalysis.roleToProband)) {
                    if (this.clinicalAnalysis.roleToProband[individualId] === "FATHER" ||
                        this.clinicalAnalysis.roleToProband[individualId] === "MOTHER") {

                        // if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.files) &&
                        //     UtilsNew.isNotEmptyArray(this.clinicalAnalysis.files[this._individualToSampleIds[individualId]])) {
                        //     for (const file of this.clinicalAnalysis.files[this._individualToSampleIds[individualId]]) {
                        //
                        //         if (file.format === "VCF" && UtilsNew.isNotUndefinedOrNull(file.internal.index.status) &&
                        //             file.internal.index.status.name === "READY") {
                        //             _existParent = true;
                        //             break;
                        //         }
                        //     }
                        // }

                        _existParent = true;
                    }
                }
                this.existParent = _existParent;
            }

            // Init query objects every time there is a new session or clinical analysis
            const _query = Object.assign({}, this.query, {
                study: this.opencgaSession.study.fqn,
                includeSample: this._sampleIds.join(",")
            });
            switch (this.mode) {
                case "interactive":
                    const _genotypes = [];
                    for (const sampleId of this._sampleIds) {
                        if (this.clinicalAnalysis.proband.samples[0].id === sampleId) {
                            _genotypes.push(sampleId + ":0/1,1/1");
                        } else {
                            _genotypes.push(sampleId + ":0/0,0/1,1/1");
                        }
                    }
                    _query.genotype = _genotypes.join(";");
                    break;
                case "compoundHeterozygous":
                // _query.biotype = "protein_coding";
                    _query.ct = "missense_variant," + this._config.filter.lof.join(",");
                    break;
            }

            // Reset query when new session or clinical analysis is provided
            this.query = {...this.query, ..._query};
        }
        console.log(this.clinicalAnalysis);
        debugger;
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = this._prepareQuery(this.query);
            this.executedQuery = {...this.preparedQuery};
        }
        this.requestUpdate();
    }

    activeObserver() {
        if (this.active) {
            // this.executedQuery = Object.assign({}, this.executedQuery);
        }
    }


    onVariantFilterChange(e) {
        this.preparedQuery = this._prepareQuery(e.detail.query);
        // console.log("onVariantFilterChange preparedQuery", this.preparedQuery)
        this.preparedQuery = {...this.preparedQuery};
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = this._prepareQuery(e.detail.query);
        this.executedQuery = {...this.preparedQuery};
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        // console.log("onActiveFilterChange", e.detail)
        this.query = {...e.detail};
        this.preparedQuery = {...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
        this.requestUpdate();
    }

    onSelectVariant(e) {
        this.variant = e.detail.variant;
    }

    onCheckVariant(e) {
        this.dispatchEvent(new CustomEvent("checkvariant", {
            detail: e.detail
        }));
    }

    _prepareQuery(query) {
        let _query = Object.assign({}, query, {
            study: this.opencgaSession.study.fqn
            // includeSample: this._sampleIds.join(",")
        });

        if (this.mode === "interactive") {
            if (UtilsNew.isNotUndefinedOrNull(_query.genotype)) {
                delete _query.sample;
            } else {
                if (UtilsNew.isUndefinedOrNull(_query.sample)) {
                    _query.sample = this._sampleIds.join(",");
                }
            }
            delete _query.family;
            return _query;
        } else {
            if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis) && UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family)) {
                _query = Object.assign({}, _query, {
                    family: this.clinicalAnalysis.family.id,
                    familyDisorder: this.clinicalAnalysis.disorder.id,
                    familySegregation: this.mode,
                    familyProband: this.clinicalAnalysis.proband.samples[0].id
                });
                delete _query.genotype;
                delete _query.sample;

                if (this.mode === "compoundHeterozygous") {
                    _query.biotype = "protein_coding";
                }

                return _query;
            }
        }
    }

    _calculateSamples() {
        const _samples = [];
        const _sampleIds = [];
        const _individualToSampleIds = {};
        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family) &&
            UtilsNew.isNotEmptyArray(this.clinicalAnalysis.family.members)) {
            this.clinicalAnalysis.family.members.forEach(individual => {
                if (UtilsNew.isNotEmptyArray(individual.samples)) {
                    _samples.push(individual.samples[0]);
                    _sampleIds.push(individual.samples[0].id);
                    _individualToSampleIds[individual.id] = individual.samples[0].id;
                }
            });
        }
        this._samples = _samples;
        this._sampleIds = _sampleIds;
        this._individualToSampleIds = _individualToSampleIds;
    }

    _addTooltip() {
        $("#" + this._prefix + "family-info-icon").qtip({
            content: {
                title: "information",
                text: this._config.tooltip
            },
            position: {
                target: "mouse",
                // my: (config !== undefined && config.position !== undefined && config.position.my !== undefined) ? config.position.my : "top left",
                adjust: {
                    x: 2, y: 2,
                    mouse: false
                }
            },
            style: {
                classes: "qtip-light qtip-rounded qtip-shadow qtip-family-class",
                width: "480px"
            },
            show: {
                delay: 250
            },
            hide: {
                fixed: true,
                delay: 300
            }
        });
    }

    getDefaultConfig() {
        switch (this.mode) {
            case "interactive":
                return {
                    title: "Interactive Variant Interpretation Analysis",
                    tooltip: `<p>
                                        <span style="font-weight: bold">Interactive Variant</span> analysis allows clinicians to filter
                                        variants from the left menu and perform a clinical analysis. Results can be stored as an Interpretation.
                                      </p>`,
                    activeFilters: {
                        alias: {
                        // Example:
                        // "region": "Region",
                        },
                        complexFields: ["genotype"],
                        hiddenFields: ["study", "includeSample"],
                        lockedFields: [
                            {id: "sample", message: "'sample' filter is mandatory in Compound Heterozygous analysis"}
                        ]
                    },
                    genomeBrowser: {
                        showTitle: false
                    }
                };
            case "compoundHeterozygous":
                return {
                    title: "Compound Heterozygous Variant Analysis",
                    tooltip: `<p>
                                        <span style="font-weight: bold">Compound Heterozygous Variant</span> in medical genetics is the
                                        condition of having two heterozygous recessive alleles at a particular gene locus that can cause a
                                        genetic disease in a heterozygous state, one on each chromosome of a pair. You can find more
                                        information at <a href="https://en.wikipedia.org/wiki/Compound_heterozygosity" target="_blank">Wikipedia</a>
                                      </p>
                                      <p>
                                        Compound Heterozygous variant analysis sets automatically the <span style="font-weight: bold">genotype</span>
                                        and <span style="font-weight: bold">biotype (protein_coding)</span> filters. However,
                                        you can use any other selected filter from the left menu. Note that finding Compound Heterozygous variants
                                        can take few seconds depending on the OpenCGA server installation.
                                      </p>`,
                    activeFilters: {
                        alias: {
                        // "region": "Region",
                        },
                        complexFields: ["genotype"],
                        hiddenFields: ["familyDisorder", "familySegregation", "familyProband", "includeSample"],
                        lockedFields: [
                            {id: "biotype", message: "'biotype' filter is mandatory in Compound Heterozygous analysis"},
                            {id: "family", message: "'biotype' filter is mandatory in Compound Heterozygous analysis"}
                        ]
                    }
                };
            case "deNovo":
                return {
                    title: "de Novo Variant Analysis",
                    tooltip: `<p>
                                        <span style="font-weight: bold">de Novo Variant</span> is a genetic alteration that is present
                                        for the first time in one family member as a result of a variant (or mutation) in a germ cell (egg or sperm)
                                        of one of the parents, or a variant that arises in the fertilized egg itself during early embryogenesis.
                                    </p>
                                    <p>
                                        de Novo variant analysis sets automatically the <span style="font-weight: bold">genotype</span> filter.
                                        However, you can use any other selected filter from the left menu. Note that finding de Novo variants can take few seconds
                                        depending on the OpenCGA server installation.
                                    </p>`,
                    activeFilters: {
                        alias: {
                        // "region": "Region",
                        },
                        complexFields: ["genotype"],
                        hiddenFields: ["familyDisorder", "familySegregation", "familyProband", "includeSample"]
                    }
                };
        }
    }

    render() {
        return html`
        <style>
            .qtip-family-class {
                max-width: 480px;
                font-size: 12px;
            }
        </style>

        <div class="row">
            <div class="col-md-12">
                <h4 id="${this._prefix}Title" class="form-section-title" style="margin: 5px 0px;padding: 0px 10px">
                    ${this._config.title}
                    <span id="${this._prefix}family-info-icon" style="color: #337ab7; padding-left: 20px">
                        <i class='fa fa-info-circle' aria-hidden='true'></i>
                    </span>
                </h4>
            </div>

            ${this.existParent ? html`
            <div class="col-md-12" style="padding: 10px 0px">
                    <div class="col-md-2">
                        <opencga-variant-filter .opencgaSession="${this.opencgaSession}"
                                                .query="${this.query}"
                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                .cellbaseClient="${this.cellbaseClient}"
                                                .populationFrequencies="${this.populationFrequencies}"
                                                .consequenceTypes="${this.consequenceTypes}"
                                                .config="${this._config.filter}"
                                                @queryChange="${this.onVariantFilterChange}"
                                                @querySearch="${this.onVariantFilterSearch}"
                                                @samplechange="${this.onSampleChange}"
                                                @inheritancemode="${this._onInheritanceMode}">
                        </opencga-variant-filter>
                    </div>

                    <div class="col-md-10">
                        <opencga-active-filters .opencgaSession="${this.opencgaSession}"
                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                .defaultStudy="${this.opencgaSession.study.alias}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .filters="${this._config.filter.examples}"
                                                .filterBioformat="VARIANT"
                                                .alias="${this._config.activeFilterAlias}"
                                                .genotypeSamples="${this.genotypeSamples}"
                                                .modeInheritance="${this.modeInheritance}"
                                                .config="${this._config.activeFilters}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">

                        </opencga-active-filters>

                        <div style="padding-top: 5px">
                            <opencga-variant-interpretation-grid .opencgaSession="${this.opencgaSession}"
                                                                 .query="${this.executedQuery}"
                                                                 .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                 .consequenceTypes="${this.consequenceTypes}"
                                                                 .populationFrequencies="${this.populationFrequencies}"
                                                                 .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                 .config="${this.config.grid}"
                                                                 @selected="${this.onSelectedGene}"
                                                                 @selectvariant="${this.onSelectVariant}"
                                                                 @checkvariant="${this.onCheckVariant}"
                                                                 @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                            </opencga-variant-interpretation-grid>

                            <!-- Bottom tabs with detailed variant information -->
                            <opencga-variant-interpretation-detail .opencgaSession="${this.opencgaSession}"
                                                                   .cellbaseClient="${this.cellbaseClient}"
                                                                   .variant="${this.variant}"
                                                                   .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                   .consequenceTypes="${this.consequenceTypes}"
                                                                   .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                   .config=${this.config.detail}>
                            </opencga-variant-interpretation-detail>
                        </div>
                    </div>
                </div>
            ` : html`
                <div class="col-md-8 col-md-offset-2" style="padding: 20px">
                    <div class="alert alert-warning" role="alert" id="${this._prefix}Warning" style="font-size: 14px;margin-bottom: 10px">
                        <span style="font-style: italic; font-weight: bold">${this._config.title} </span> require at least one parent,
                        no parents found for proband <b>${this.clinicalAnalysis.proband.id}</b>.
                    </div>
                </div>
            `}
        </div>
        `;
    }

}

customElements.define("opencga-variant-family-analysis", OpencgaVariantFamilyAnalysis);
