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
import UtilsNew from "./../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-variant-grid.js";
import "./opencga-variant-filter.js";
import "../opencga/commons/opencga-facet-result-view.js";
import "../opencga/commons/facet-filter.js";
import "../opencga/opencga-active-filters.js";
import "./opencga-variant-detail-view.js";
import "../commons/filters/select-field-filter.js";
import "../../loading-spinner.js";


export default class OpencgaVariantBrowser extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
            populationFrequencies: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            query: {
                type: Object
            },
            search: {
                type: Object
            },
            config: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: { //TODO naming change: preparedQueryFacet (selectedFacet), preparedQueryFacetFormatted (selectedFacetFormatted), executedQueryFacet (queryFacet) (also in opencga-browser)
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + Utils.randomString(6);

        this.checkProjects = false;

        this.activeFilterAlias = {
            "annot-xref": "XRef",
            "biotype": "Biotype",
            "annot-ct": "Consequence Types",
            "alternate_frequency": "Population Frequency",
            "annot-functional-score": "CADD",
            "protein_substitution": "Protein Substitution",
            "annot-go": "GO",
            "annot-hpo": "HPO"
        };

        this.fixedFilters = ["studies"];

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.results = [];
        this._showInitMessage = true;


        this.facetConfig = {a: 1};
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;

        this.checkProjects = false;
        this._collapsed = false;
        this.genotypeColor = {
            "0/0": "#6698FF",
            "0/1": "#FFA500",
            "1/1": "#FF0000",
            "./.": "#000000",
            "0|0": "#6698FF",
            "0|1": "#FFA500",
            "1|0": "#FFA500",
            "1|1": "#FF0000",
            ".|.": "#000000"
        };
        this.variantId = "No variant selected";

        this._sessionInitialised = false;
        this.detailActiveTabs = [];

        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        console.error("this.opencgaSession",this.opencgaSession)
        this.endpoint = this.opencgaClient.variants(); // to keep methods consistent with opecnga-facet
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
        console.error("this.opencgaSession",this.opencgaSession)

        // console.log("this.query from BROWSER", this.query)
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("selectedFacet")) {
            this.selectedFacetObserver();
        }
    }

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        let _query = {};
        if (UtilsNew.isEmpty(this.query) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            _query = {
                study: this.opencgaSession.study.fqn
            };
        }

        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = {..._query, ...this.query};
            this.executedQuery = {..._query, ...this.query};
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.dispatchEvent(new CustomEvent("queryChange", {detail: this.preparedQuery}));
        this.requestUpdate();
    }

    opencgaSessionObserver() {
        //console.log("this._config", this._config, this.opencgaSession.project);
        // debugger
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            // Update cohorts from config, this updates the Cohort filter MAF
            for (const section of this._config.filter.sections) {
                for (const subsection of section.fields) {
                    if (subsection.id === "cohort") {
                        const projectFields = this.opencgaSession.project.alias.split("@");
                        const projectId = (projectFields.length > 1) ? projectFields[1] : projectFields[0];
                        this.cohorts = subsection.cohorts[projectId];
                        // this.set('cohorts', subsection.cohorts[projectId]);
                        // debugger
                    }
                }
            }

            this.checkProjects = true;
            this.requestUpdate().then(() => $(".bootstrap-select", this).selectpicker());
        } else {
            this.checkProjects = false;
        }
    }

    onCollapse() {
        if (this._collapsed) {
            $("#" + this._prefix + "FilterMenu").show(400);
            $("#" + this._prefix + "MainWindow").removeClass("browser-center").addClass("col-md-10");
        } else {
            $("#" + this._prefix + "FilterMenu").hide(400);
            $("#" + this._prefix + "MainWindow").removeClass("col-md-10").addClass("browser-center");
        }
        this._collapsed = !this._collapsed;
    }

    /**
     * Apply the 'config' properties on the default
     */
    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
    }

    async onRun() {
        // this event keeps in sync the query object in variant-browser with the general one in iva-app (this.queries)
        // it is also in charge of update executedQuery (through queryObserver()).
        // if we want to dismiss the general query feature replace the following line with:
        // this.executedQuery = {...this.preparedQuery}; this.requestUpdate();
        this.notifySearch(this.preparedQuery);

        if(Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                // sid: this.opencgaClient._config.sessionId,
                study: this.opencgaSession.study.fqn,
                timeout: 60000,
                fields: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        }
    }

    _initTooltip() {
        // TODO move to Utils
        $("a[tooltip-title]", this).each(function() {
            $(this).qtip({
                content: {
                    title: $(this).attr("tooltip-title"),
                    text: $(this).attr("tooltip-text")
                },
                position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
                style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
                show: {delay: 200},
                hide: {fixed: true, delay: 300}
            });
        });
    }

    onFilterChange(e) {
        this.query = e.detail;
        // TODO remove search field everywhere. use query instead
        this.search = e.detail;
    }

    onHistogramChart(e) {
        this.highlightActivePlot(e.target.parentElement);
        const id = e.target.dataId;
        // TODO Refactor
        this.renderHistogramChart("#" + this._prefix + id + "Plot", id);

        PolymerUtils.hide(this._prefix + id + "Table");
    }

    onPieChart(e) {
        this.highlightActivePlot(e.target.parentElement);
        const id = e.target.dataId;
        this.renderPieChart("#" + this._prefix + id + "Plot", id);
        PolymerUtils.hide(this._prefix + id + "Table");
    }

    onTabularView(e) {
        this.highlightActivePlot(e.target.parentElement);
        const id = e.target.dataId;
        PolymerUtils.innerHTML(this._prefix + id + "Plot", "");
        PolymerUtils.show(this._prefix + id + "Table", "table");
    }

    highlightActivePlot(button) {
        // PolymerUtils.removeClass(".plots", "active");
        // PolymerUtils.addClass(button, "active");
    }

    onClickPill(e){
        //e.preventDefault();
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).hide();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on variant facet", e.detail);
        // TODO FIXME! studies prop have to be wiped off. use study instead
        this.preparedQuery = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
    }

    onFacetQueryChange(e) {
        this.selectedFacetFormatted = e.detail.value;
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        // console.log("selectedFacet",Object.keys(this.selectedFacet))
        $("#" + this._prefix + "FacetField", this).selectpicker("val", Object.keys(this.selectedFacet));
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        $("#" + this._prefix + "FacetField", this).selectpicker("val", "deselectAll");
        this.requestUpdate();
    }

    onClickRow(e) {
        console.log(e);
        this.detail = {...this.detail, [e.detail.resource]: e.detail.data};
        this.requestUpdate();
        console.log("this.detail", this.detail);
    }

    onSampleChange(e) {
        this.samples = e.detail.samples;
        this.dispatchEvent(new CustomEvent("samplechange", {detail: {samples: this.samples}, bubbles: true, composed: true}));
    }

    _changeBottomTab(e) {
        const _activeTabs = {};
        for (const detail of this.config.detail) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
        this.requestUpdate();
    }

    onGenomeBrowserPositionChange(e) {
        $(".variant-browser-content").hide(); // hides all content divs

        // Show genome browser div
        PolymerUtils.getElementById(this._prefix + "GenomeBrowser").style.display = "block";

        // Show the active button
        $(".variant-browser-view-buttons").removeClass("active");
        PolymerUtils.addClass(this._prefix + "GenomeBrowserButton", "active");

        this._genomeBrowserActive = true;
        this.region = e.detail.genomeBrowserPosition;
    }

    checkVariant(variant) {
        return variant.split(":").length > 2;
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.variant;
        const genes = [];
        for (let i = 0; i < e.detail.variant.annotation.consequenceTypes.length; i++) {
            const gene = e.detail.variant.annotation.consequenceTypes[i].geneName;
            if (UtilsNew.isNotEmpty(gene) && genes.indexOf(gene) === -1) {
                genes.push(gene);
            }
        }
        this.genes = genes;

        this.requestUpdate();
    }

    selectedGene(e) {
        this.dispatchEvent(new CustomEvent("propagate", {gene: e.detail.gene}));
    }

    getDefaultConfig() {
        return {
            title: "Variant Browser",
            active: false,
            populationFrequencies: true,
            filter: {

                // from OLD variant-browser
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        // "genotype": "Sample Genotypes",
                    },
                    complexFields: ["genotype"],
                    hiddenFields: ["study"]
                },
                genomeBrowser: {
                    showTitle: false
                },


                // from tools.js
                title: "Variant Browser",
                active: false,
                showSummary: true,
                showGenomeBrowser: false,
                sections: [
                    // sections and subsections, structure and order is respected
                    {
                        title: "Study and Cohorts",
                        collapsed: false,
                        fields: [
                            {
                                id: "study",
                                title: "Studies Filter",
                                tooltip: "Only considers variants from the selected studies"
                            }
                            // cohortFileMenu // TODO expose common data
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        fields: [
                            {
                                id: "location",
                                title: "Chromosomal Location",
                                tooltip: "Filter out variants falling outside the genomic interval(s) defined"
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs, ...)",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: "Filter out variants falling outside the genomic intervals (typically genes) defined by the panel(s) chosen"
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: [
                                    "3prime_overlapping_ncrna", "IG_C_gene", "IG_C_pseudogene", "IG_D_gene", "IG_J_gene", "IG_J_pseudogene",
                                    "IG_V_gene", "IG_V_pseudogene", "Mt_rRNA", "Mt_tRNA", "TR_C_gene", "TR_D_gene", "TR_J_gene", "TR_J_pseudogene",
                                    "TR_V_gene", "TR_V_pseudogene", "antisense", "lincRNA", "miRNA", "misc_RNA", "non_stop_decay",
                                    "nonsense_mediated_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript",
                                    "protein_coding", "pseudogene", "rRNA", "retained_intron", "sense_intronic", "sense_overlapping", "snRNA",
                                    "snoRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene",
                                    "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"
                                ],
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"],
                                tooltip: "Only considers variants of the selected type"
                            }
                        ]
                    },
                    {
                        title: "Population Frequency",
                        collapsed: true,
                        fields: [
                            {
                                id: "populationFrequency",
                                title: "Select Population Frequency",
                                // tooltip: populationFrequencies.tooltip, // TODO expose common data
                                showSetAll: true
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        fields: [
                            {
                                id: "consequenceType",
                                title: "Select SO terms",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            }
                        ]
                    },
                    {
                        title: "Deleteriousness",
                        collapsed: true,
                        fields: [
                            {
                                id: "proteinSubstitutionScore",
                                title: "Protein Substitution Score",
                                tooltip: "<strong>SIFT score:</strong> Choose either a Tolerated/Deleterious qualitative score or provide below a " +
                                        "quantitative impact value. SIFT scores <0.05 are considered deleterious. " +
                                        "<strong>Polyphen:</strong> Choose, either a Benign/probably damaging qualitative score or provide below a " +
                                        "quantitative impact value. Polyphen scores can be Benign (<0.15), Possibly damaging (0.15-0.85) or Damaging (>0.85)"
                            },
                            {
                                id: "cadd",
                                title: "CADD",
                                tooltip: "Raw values have relative meaning, with higher values indicating that a variant is more likely to be " +
                                        "simulated (or not observed) and therefore more likely to have deleterious effects. If discovering causal variants " +
                                        "within an individual, or small groups, of exomes or genomes te use of the scaled CADD score is recommended"
                            }
                        ]
                    },
                    {
                        title: "Conservation",
                        collapsed: true,
                        fields: [
                            {
                                id: "conservation",
                                title: "Conservation Score",
                                tooltip: "<strong>PhyloP</strong> scores measure evolutionary conservation at individual alignment sites. The scores " +
                                        "are interpreted as follows compared to the evolution expected under neutral drift: positive scores (max 3.0) mean " +
                                        "conserved positions and negative scores (min -14.0) indicate positive selection. PhyloP scores are useful to " +
                                        "evaluate signatures of selection at particular nucleotides or classes of nucleotides (e.g., third codon positions, " +
                                        "or first positions of miRNA target sites).<br>" +
                                        "<strong>PhastCons</strong> estimates the probability that each nucleotide belongs to a conserved element, based on " +
                                        "the multiple alignment. The phastCons scores represent probabilities of negative selection and range between 0 " +
                                        "(non-conserved) and 1 (highly conserved).<br>" +
                                        "<strong>Genomic Evolutionary Rate Profiling (GERP)</strong> score estimate the level of conservation of positions." +
                                        " Scores ≥ 2 indicate evolutionary constraint to and ≥ 3 indicate purifying selection."
                            }
                        ]
                    },
                    {
                        title: "Gene Ontology",
                        collapsed: true,
                        fields: [
                            {
                                id: "go",
                                title: "GO Accessions (max. 100 terms)",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            }
                        ]
                    },
                    {
                        title: "Phenotype-Disease",
                        collapsed: true,
                        fields: [
                            {
                                id: "hpo",
                                title: "HPO Accessions",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "clinvar",
                                title: "ClinVar Accessions",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "fullTextSearch",
                                title: "Full-text search on HPO, ClinVar, protein domains or keywords. Some OMIM and Orphanet IDs are also supported",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            }
                        ]
                    }

                ],
                examples: [
                    {
                        name: "Example BRCA2",
                        active: false,
                        query: {
                            gene: "BRCA2",
                            conservation: "phylop<0.001"
                        }
                    },
                    {
                        name: "Example OR11",
                        query: {
                            gene: "OR11H1",
                            conservation: "phylop<=0.001"
                        }
                    },
                    {
                        name: "Full Example",
                        query: {
                            "studies": "exomes_grch37:corpasome;opencga@exomes_grch37:ceph_trio",
                            "region": "3:444-555",
                            "xref": "BRCA1,DDEF",
                            "panel": "Albinism_or_congenital_nystagmus-PanelAppId-511,Amyloidosis-PanelAppId-502",
                            "biotype": "IG_C_gene,IG_C_pseudogene",
                            "type": "INDEL",
                            "ct": "frameshift_variant,incomplete_terminal_codon_variant,inframe_deletion,inframe_insertion,3_prime_UTR_variant,5_prime_UTR_variant,intron_variant,non_coding_transcript_exon_variant,non_coding_transcript_variant",
                            "populationFrequencyAlt": "1kG_phase3:ALL<1;1kG_phase3:AFR<1;1kG_phase3:AMR<1;1kG_phase3:EAS<1;1kG_phase3:EUR<1;1kG_phase3:SAS<1;GNOMAD_GENOMES:ALL<1;GNOMAD_GENOMES:AFR<1;GNOMAD_GENOMES:AMR<1;GNOMAD_GENOMES:EAS<1;GNOMAD_GENOMES:FIN<1;GNOMAD_GENOMES:NFE<1;GNOMAD_GENOMES:SAS<1",
                            "protein_substitution": "sift>5,polyphen>4",
                            "annot-functional-score": "cadd_raw>2,cadd_scaled<4",
                            "conservation": "phylop>1;phastCons>2;gerp<=3"
                        }
                    }
                ],
                result: {
                    grid: {}
                },
                detail: []
            },
            aggregation: {
                default: ["studies"],
                sections: [
                    {
                        name: "terms",
                        fields: [
                            {
                                name: "Chromosome", id: "chromosome", type: "string"
                            },
                            {
                                id: "studies", name: "studies", type: "string"
                            },
                            {
                                name: "Variant Type", id: "type", type: "category", allowedValues: ["A", "B", "C"]
                            },
                            {
                                name: "Genes", id: "genes", type: "string"
                            },
                            {
                                name: "Biotypes", id: "biotypes", type: "string"
                            },
                            {
                                name: "Consequence Type", id: "soAcc", type: "string"
                            }
                        ]
                    },
                    {
                        name: "Conservation & Deleteriousness Ranges",
                        fields: [
                            {
                                name: "PhastCons", id: "phastCons", defaultValue: "[0..1]:0.1", type: "string"
                            },
                            {
                                name: "PhyloP", id: "phylop", defaultValue: "", type: "string"
                            },
                            {
                                name: "Gerp", id: "gerp", defaultValue: "[-12.3..6.17]:2", type: "string"
                            },
                            {
                                name: "CADD Raw", id: "caddRaw", defaultValue: "", type: "string"
                            },
                            {
                                name: "CADD Scaled", id: "caddScaled", defaultValue: "", type: "string"
                            },
                            {
                                name: "Sift", id: "sift", defaultValue: "[0..1]:0.1", type: "string"
                            },
                            {
                                name: "Polyphen", id: "polyphen", defaultValue: "[0..1]:0.1", type: "string"
                            }
                        ]
                    },
                    {
                        name: "Population frequency Ranges",
                        fields: [
                            ...this.populationFrequencies.studies.map(study =>
                                study.populations.map(population => (
                                    {
                                        id: `popFreq__${study.id}__${population.id}`,
                                        value: `popFreq__${study.id}__${population.id}`,
                                        name: `pop Freq | ${study.id} | ${population.id}`,
                                        type: "string"
                                    }
                                )
                                )
                            ).flat()
                        ]
                    }
                ]
            }

        };
    }

    render() {
        return html`
        <style include="jso-styles">
        </style>

        ${this.checkProjects ? html`
            <div class="page-title">
                <h2>
                    <i class="${this._config.icon}" aria-hidden="true"></i>&nbsp;${this._config.title}
                </h2>
            </div>
            
            <!-- 
            <div class="panel" style="margin-bottom: 15px">
                <h3 style="margin: 10px 10px 10px 15px">
                    <i class="${this._config.icon}" aria-hidden="true"></i>&nbsp;${this._config.title}
                </h3>
            </div> -->

            <div class="row" style="padding: 0px 10px">
                <div class="col-md-2 left-menu">
                
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> Run
                        </button>
                    </div>
                    <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                        <li role="presentation" class="active"><a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a></li>
                        <li role="presentation"><a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a></li>
                    </ul>
                    
                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane active" id="filters_tab">
                            <opencga-variant-filter .opencgaSession=${this.opencgaSession}
                                                        .opencgaClient="${this.opencgaClient}"
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .populationFrequencies="${this.populationFrequencies}"
                                                        .consequenceTypes="${this.consequenceTypes}"
                                                        .query="${this.query}"
                                                        .config="${this._config.filter}"
                                                        .searchButton="${false}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                            </opencga-variant-filter>
                        </div>
                        
                        <div role="tabpanel" class="tab-pane" id="facet_tab">
                            <facet-filter .config="${this._config.aggregation}"
                                          .selectedFacet="${this.selectedFacet}"
                                          @facetQueryChange="${this.onFacetQueryChange}">
                            </facet-filter>
                        </div>
                    </div>
                </div>

                <div class="col-md-10">
                
                    <!-- tabs buttons -->
                    <div>
                        <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                            <div class="btn-group" role="group" style="margin-left: 0px">
                                <button type="button" class="btn btn-success active ripple content-pills" @click="${this.onClickPill}" data-id="table-tab">
                                    <i class="fa fa-table icon-padding" aria-hidden="true"></i> Table Result
                                </button>
                                <button type="button" class="btn btn-success ripple content-pills" @click="${this.onClickPill}" data-id="facet-tab">
                                    <i class="fas fa-chart-bar icon-padding" aria-hidden="true"></i> Aggregation stats
                                </button>
                                <button type="button" class="btn btn-success ripple content-pills" @click="${this.onClickPill}" data-id="comparator-tab">
                                    <i class="fa fa-users icon-padding" aria-hidden="true"></i> Comparator
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <opencga-active-filters facetActive
                                                filterBioformat="VARIANT"
                                                .opencgaSession="${this.opencgaSession}"
                                                .defaultStudy="${this.opencgaSession.study.alias}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .facetQuery="${this.selectedFacetFormatted}"
                                                .alias="${this.activeFilterAlias}"
                                                .config="${this._config.activeFilters}"
                                                .filters="${this._config.filter.examples}"
                                                @activeFacetChange="${this.onActiveFacetChange}"
                                                @activeFacetClear="${this.onActiveFacetClear}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>
                        
                        <div id="table-tab" class="content-tab">
                            <opencga-variant-grid .opencgaSession="${this.opencgaSession}"
                                                  .query="${this.executedQuery}"
                                                  .cohorts="${this.cohorts}"
                                                  .cellbaseClient="${this.cellbaseClient}"
                                                  .populationFrequencies="${this.populationFrequencies}"
                                                  .active="${this.active}" 
                                                  .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                  .consequenceTypes="${this.consequenceTypes}"
                                                  .config="${this._config.filter}"
                                                  @selected="${this.selectedGene}"
                                                  @selectvariant="${this.onSelectVariant}"
                                                  @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                            </opencga-variant-grid>
            
            
                            <!-- Bottom tabs with specific variant information -->
                            <opencga-variant-detail-view    .opencgaSession="${this.opencgaSession}" 
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .variantId="${this.variantId}">
                            </opencga-variant-detail-view>
                            
                        </div>
                        
                        <div id="facet-tab" class="content-tab">
                            <opencb-facet-results .opencgaSession="${this.opencgaSession}" 
                                                   .active="${this.activeTab["facet-tab"]}"
                                                  .query="${this.facetQuery}"
                                                  .data="${this.facetResults}"
                                                  .error="${this.errorState}">
                            </opencb-facet-results>
                        </div>
                    </div>
                </div>
            </div>
        ` : html`
            <div class="guard-page">
                <i class="fas fa-lock fa-5x"></i>
                <h3>No public projects available to browse. Please login to continue</h3>
            </div>
        `}
    `;
    }

}


customElements.define("opencga-variant-browser", OpencgaVariantBrowser);
