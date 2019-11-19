import {LitElement, html} from '/web_modules/lit-element.js';


import './../variableSets/opencga-annotation-filter.js';
import './../opencga-date-filter.js';
import "../../commons/opencga-facet-view.js";


export default class OpencgaSampleFilter extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            samples: {
                type: Array,
                notify: true //todo check notify and replace with _didRender() https://github.com/Polymer/lit-element/issues/81
            },
            query: {
                type: Object,
                notify: true, //todo check notify
            },
            search: {
                type: Object,
                notify: true //todo check notify
            },
            variableSets: {
                type: Array
            },
            variables: {
                type: Array,
            },
            minYear: {
                type: Number
            },
            compact: {
                type: Boolean
            },
            config: {
                type: Object
            }
        }
    }

    updated(changedProperties) {
        if(changedProperties.has("query")) {
            this.onQueryUpdate()
        }
        if(changedProperties.has("variables")) {
            //this.variablesChanged()
        }
    }
    _init() {
        // super.ready();
        this._prefix = "osf-" + Utils.randomString(6) + "_";

        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        };

        this.dateFilterConfig = {
            recentDays: 10
        };
        this.minYear = 1920;

        this.query = {aaa:22};
    }

    onSearch() {
        this.search = {...this.query};
    }

    addAnnotation(e) {
        if (typeof this._annotationFilter === "undefined") {
            this._annotationFilter = {};
        }
        let split = e.detail.value.split("=");
        this._annotationFilter[split[0]] = split[1];

        let _query = {};
        Object.assign(_query, this.query);
        let annotations = [];
        for (let key in this._annotationFilter) {
            annotations.push(`${key}=${this._annotationFilter[key]}`)
        }
        _query['annotation'] = annotations.join(";");

        this._reset = false;
        this.query = _query;
        this._reset = true;
    }

    onDateChanged(e) {
        let query = {};
        Object.assign(query, this.query);
        if (UtilsNew.isNotEmpty(e.detail.date)) {
            query["creationDate"] = e.detail.date;
        } else {
            delete query["creationDate"];
        }

        this._reset = false;
        this.set("query", query);
        this._reset = true;
    }

    onQueryUpdate() {
        if (this._reset) {
            console.log("onQueryUpdate: calling to 'renderQueryFilters()'");
            this.renderQueryFilters();
        } else {
            this._reset = true;
        }
    }

    renderQueryFilters() {
        // Empty everything before rendering
        this._clearHtmlDom();

        // Sample
        if (UtilsNew.isNotUndefined(this.query.name)) {
            PolymerUtils.setValue(`${this._prefix}-sample-input`, this.query.name);
        }

        // Individual
        if (UtilsNew.isNotUndefined(this.query.individual)) {
            PolymerUtils.setValue(`${this._prefix}-individual-input`, this.query.individual);
        }

        // Source
        if (UtilsNew.isNotUndefined(this.query.source)) {
            PolymerUtils.setValue(`${this._prefix}-source-input`, this.query.source);
        }

        // Phenotypes
        if (UtilsNew.isNotUndefined(this.query.phenotypes)) {
            PolymerUtils.setValue(`${this._prefix}-phenotypes-input`, this.query.phenotypes);
        }

        // Somatic checkbox
        if (UtilsNew.isNotUndefined(this.query.somatic)) {
            PolymerUtils.setPropertyById(`${this._prefix}-somatic-option-${this.query.somatic}`, 'checked', true);
        } else {
            PolymerUtils.setPropertyById(`${this._prefix}-somatic-option-none`, 'checked', true);
        }
    }

    calculateFilters(e) {
        let _query = {};

        console.log("this.query", this.query)

        let name = PolymerUtils.getValue(`${this._prefix}-sample-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.name = name;
        }

        let individual = PolymerUtils.getValue(`${this._prefix}-individual-input`);
        if (UtilsNew.isNotEmpty(individual)) {
            _query.individual = individual;
        }

        let source = PolymerUtils.getValue(`${this._prefix}-source-input`);
        if (UtilsNew.isNotEmpty(source)) {
            _query.source = source;
        }

        let phenotypes = PolymerUtils.getValue(`${this._prefix}-phenotypes-input`);
        if (UtilsNew.isNotEmpty(phenotypes)) {
            _query.phenotypes = phenotypes;
        }

        // keep annotation filter
        if (UtilsNew.isNotEmpty(this.query.annotation)) {
            _query.annotation = this.query.annotation;
        }

        // keep date filters
        if (UtilsNew.isNotEmpty(this.query.creationDate)) {
            _query.creationDate = this.query.creationDate;
        }

        let somatic = $(`input[name=${this._prefix}-somatic-options]:checked`, `#${this._prefix}-somatic`).val();
        if (somatic !== "None") {
            _query.somatic = somatic === "True";
        }

        // To prevent to call renderQueryFilters we set this to false
        this._reset = false;
        this.query =_query;
        this._reset = true;
    }

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", 'value', '');
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", 'disabled');
        // Uncheck checkboxes
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterCheckBox", 'checked', false);
        // Set first option and make it active
        PolymerUtils.setAttributeByClassName(this._prefix + "FilterSelect", 'selectedIndex', 0);
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterSelect", 'disabled');
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterRadio", 'checked', false);

        // TODO Refactor
        // $("." + this._prefix + "FilterRadio").filter('[value="or"]').prop('checked', true);
    }

    render() {
        return html`
            <style include="jso-styles">
                .label-opencga-sample-filter {
                    padding-top: 10px;
                }
            
                span + span {
                    margin-left: 10px;
                }
            
                .browser-ct-scroll {
                    /*max-height: 450px;*/
                    /*overflow-y: scroll;*/
                    overflow-x: scroll;
                }
            
                .browser-ct-tree-view,
                .browser-ct-tree-view * {
                    padding: 0;
                    margin: 0;
                    list-style: none;
                }
            
                .browser-ct-tree-view li ul {
                    margin: 0 0 0 22px;
                }
            
                .browser-ct-tree-view * {
                    vertical-align: middle;
                }
            
                .browser-ct-tree-view {
                    /*font-size: 14px;*/
                }
            
                .browser-ct-tree-view input[type="checkbox"] {
                    cursor: pointer;
                }
            
                .browser-ct-item {
                    white-space: nowrap;
                    display: inline
                }
            
                div.block {
                    overflow: hidden;
                }
            
                div.block label {
                    width: 80px;
                    display: block;
                    float: left;
                    text-align: left;
                    font-weight: normal;
                }
            
                select + select {
                    margin-left: 10px;
                }
            
                select + input {
                    margin-left: 10px;
                }
            
                .browser-subsection {
                    font-size: 1.35rem;
                    font-weight: bold;
                    padding: 5px 0px;
                    color: #444444;
                    border-bottom: 1px solid rgba(221, 221, 221, 0.8);
                }
            
                .subsection-content {
                    margin: 5px 5px;
                }
            
                span.searchingSpan {
                    background-color: #286090;
                }
            
                .searchingButton {
                    color: #fff;
                }
            
                .notbold {
                    font-weight: normal;
                }
            
                .bootstrap-select {
                    width: 100% !important;
                }
            </style>
            
            <div style="width: 60%;margin: 0 auto">
                <button type="button" class="btn btn-lg btn-primary" style="width: 100%" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true" style="padding: 0px 5px"></i> Search
                </button>
            </div>
            <!--<br>-->
            
            <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true"
                 style="padding-top: 20px">
            
                <!-- Sample field attributes -->
                <div class="panel panel-default">
                    <div class="panel-heading" role="tab" id="${this._prefix}SampleSelectionHeading">
                        <h4 class="panel-title">
                            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                               href="#${this._prefix}SampleSelection" aria-expanded="true"
                               aria-controls="${this._prefix}SampleSelection">
                                Sample
                                <!--<div style="float: right" class="tooltip-div">-->
                                <!--<a data-toggle="tooltip" title="Sample selection">-->
                                <!--<i class="fa fa-info-circle" aria-hidden="true"></i>-->
                                <!--</a>-->
                                <!--</div>-->
                            </a>
                        </h4>
                    </div>
            
                    <div id="${this._prefix}SampleSelection" class="panel-collapse collapse in" role="tabpanel"
                         aria-labelledby="${this._prefix}SampleSelectionHeading">
                        <div class="panel-body">
            
                            <div class="form-group">
                                <div class="browser-subsection">Id
                                </div>
                                <div id="${this._prefix}-name" class="subsection-content form-group">
                                    <input type="text" id="${this._prefix}-sample-input"
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           placeholder="HG01879, HG01880, HG01881..." @keyup="${this.calculateFilters}">
                                </div>
                            </div>
            
                            <div class="form-group">
                                <div class="browser-subsection">Individual
                                </div>
                                <div id="${this._prefix}-individual" class="subsection-content form-group">
                                    <input type="text" id="${this._prefix}-individual-input"
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           placeholder="LP-1234, LP-4567 ..." @keyup="${this.calculateFilters}">
                                </div>
                            </div>
            
                            <div class="form-group">
                                <div class="browser-subsection">Source
                                </div>
                                <div id="${this._prefix}-source" class="subsection-content form-group">
                                    <input type="text" id="${this._prefix}-source-input"
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           placeholder="Blood, Liver ..." @keyup="${this.calculateFilters}">
                                </div>
                            </div>
            
                            <div class="form-group">
                                <div class="browser-subsection" id="${this._prefix}-annotationss">Sample annotations
                                    <div style="float: right" class="tooltip-div">
                                        <a><i class="fa fa-info-circle" aria-hidden="true"
                                              id="${this._prefix}-annotations-tooltip"></i></a>
                                    </div>
                                </div>
                                <div id="${this._prefix}-annotations" class="subsection-content">
                                    <opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                               .opencgaClient="${this.opencgaClient}"
                                                               entity="SAMPLE"
                                                               .config="${this.annotationFilterConfig}"
                                                               @filterannotation="${this.addAnnotation}">
                                    </opencga-annotation-filter>
                                </div>
                            </div>
            
                            <div class="form-group">
                                <div class="browser-subsection">Phenotypes
                                </div>
                                <div id="${this._prefix}-phenotypes" class="subsection-content form-group">
                                    <input type="text" id="${this._prefix}-phenotypes-input"
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           placeholder="Full-text search, e.g. *melanoma*" @keyup="${this.calculateFilters}">
                                </div>
                            </div>
            
                            <div class="form-group">
                                <div class="browser-subsection">Somatic
                                </div>
                                <form id="${this._prefix}-somatic" class="subsection-content form-group">
                                    <input id="${this._prefix}-somatic-option-none"
                                           class="form-group-sm ${this._prefix}FilterRadio"
                                           type="radio" name="${this._prefix}-somatic-options" value="None"
                                           @click="${this.calculateFilters}" checked>
                                    <span class="small">None</span>
                                    <br>
                                    <input id="${this._prefix}-somatic-option-true"
                                           class="form-group-sm ${this._prefix}FilterRadio"
                                           type="radio" name="${this._prefix}-somatic-options" value="True"
                                           @click="${this.calculateFilters}">
                                    <span class="small">True</span>
                                    <br>
                                    <input id="${this._prefix}-somatic-option-false"
                                           class="form-group-sm ${this._prefix}FilterRadio"
                                           type="radio" name="${this._prefix}-somatic-options" value="False"
                                           @click="${this.calculateFilters}">
                                    <span class="small">False</span>
                                </form>
                            </div>
            
                            <div class="form-group">
                                <div class="browser-subsection" id="${this._prefix}-date">Date
                                    <div style="float: right" class="tooltip-div">
                                        <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-date-tooltip"></i></a>
                                    </div>
                                </div>
                                <div id="${this._prefix}-date-content" class="subsection-content">
                                    <opencga-date-filter .config="${this.dateFilterConfig}"
                                                         @datechanged="${this.onDateChanged}"></opencga-date-filter>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("opencga-sample-filter", OpencgaSampleFilter);
