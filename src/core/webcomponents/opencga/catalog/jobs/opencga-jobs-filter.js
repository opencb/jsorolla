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
import Utils from "./../../../../utils.js";
import UtilsNew from "../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "../variableSets/opencga-annotation-filter.js";
import "../opencga-date-filter.js";
import "../../../commons/filters/text-field-filter.js";
import "../../../commons/filters/jobs-id-autocomplete.js";


export default class OpencgaJobsFilter extends LitElement {

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
            query: {
                type: Object
            },
            // todo check
            variableSets: {
                type: Array
            },
            variables: {
                type: Array
            },
            minYear: {
                type: Number
            },
            compact: {
                type: Boolean
            },
            config: {
                type: Object
            },
            discriminator: {
                type: String
            }
        };
    }

    _init() {
        // super.ready();
        this._prefix = "osf-" + Utils.randomString(6) + "_";

        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        };

        this.query = {};
        this.preparedQuery = {};
        this.searchButton = true;

    }

    connectedCallback() {
        super.connectedCallback();
        this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this._initTooltip();
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("variables")) {
            this.variablesChanged();
        }
    }

    onSearch() {
        // this.search = {...this.query};
        this.notifySearch(this.preparedQuery);
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

    queryObserver() {
        if (this._reset) {
            console.log("queryObserver: calling to 'renderQueryFilters()'", this.query);
            this.preparedQuery = this.query;
            // this.renderQueryFilters();
            this.requestUpdate();
        } else {
            this._reset = true;
        }
    }

    onFilterChange(key, value) {
        console.log("filterChange", {[key]: value});
        if (value && value !== "") {
            this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
        } else {
            console.log("deleting", key, "from preparedQuery");
            delete this.preparedQuery[key];
            this.preparedQuery = {...this.preparedQuery};
        }
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();
    }

    notifyQuery(query) {
        this.dispatchEvent(new CustomEvent("queryChange", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
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

    _createSection(section) {
        const htmlFields = section.fields && section.fields.length && section.fields.map(subsection => this._createSubSection(subsection));
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    _createSubSection(subsection) {
        let content = "";
        switch (subsection.id) {
            case "id":
                content = html`<jobs-id-autocomplete .config="${subsection}" .opencgaSession="${this.opencgaSession}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></jobs-id-autocomplete>`;
                break;
            case "tool":
            case "tags":
                content = html`<text-field-filter placeholder="${subsection.placeholder}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></text-field-filter>`;
                break;
            case "internal.status.name":
            case "visited":
            case "priority":
                content = html`<select-field-filter multiple .value="${this.preparedQuery[subsection.id]}" .data="${subsection.allowedValues}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></select-field-filter>`;
                break;
            case "creationDate":
                content = html`<opencga-date-filter .config="${this.dateFilterConfig}" @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}"></opencga-date-filter>`;
                break;
            default:
                console.error("Filter component not found");
        }

        return html`
                    <div class="form-group">
                        <div class="browser-subsection" id="${subsection.id}">${subsection.name}
                            ${subsection.description ? html`
                                <div class="tooltip-div pull-right">
                                    <a tooltip-title="${subsection.name}" tooltip-text="${subsection.description}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                                </div>` : null }
                        </div>
                        <div id="${this._prefix}${subsection.id}" class="subsection-content">
                            ${content}
                         </div>
                    </div>
                `;
    }


    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", "disabled");
    }

    isNotEmpty(myArray) {
        return UtilsNew.isNotEmptyArray(myArray);
    }

    render() {
        return html`
        <style include="jso-styles">
            .label-opencga-file-filter {
                padding-top: 10px;
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

            span.searchingSpan{
                background-color: #286090;
            }
            .searchingButton{
                color: #fff;
            }
        </style>

        ${this.searchButton ? html`
            <div class="search-button-wrapper">
                <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> Search
                </button>
            </div>
            ` : null}

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">

            <!-- File field attributes -->
            <div class="">
                ${this.config.sections && this.config.sections.length ? this.config.sections.map( section => this._createSection(section)) : html`No filter has been configured.`}
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-jobs-filter", OpencgaJobsFilter);
