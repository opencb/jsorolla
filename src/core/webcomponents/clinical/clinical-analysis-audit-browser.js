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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/tool-header.js";
import "../variant/interpretation/variant-interpreter-grid.js";
import "../variant/interpretation/variant-interpreter-detail.js";
import "../variant/opencga-variant-filter.js";
import GridCommons from "../commons/grid-commons.js";

class ClinicalAnalysisAuditBrowser extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "ia-" + UtilsNew.randomString(6);
        this.gridId = this._prefix + "int-audit";
        this.timeline = {};
        this._timeline = {};
        this.activeTab = {timeline: true};
        this.timelinePageSize = 20;
        this.timelineEnd = this.timelinePageSize;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }

        if ((changedProperties.has("clinicalAnalysis") || changedProperties.has("active")) && this.active) {
            this.clinicalAnalysisObserver();
            // this.requestUpdate();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
    }


    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    //this.clinicalAnalysisObserver();
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if(this.clinicalAnalysis) {
            if(this.clinicalAnalysis.audit?.length) {
                let dates = this.clinicalAnalysis.audit.map(event => moment(event.date, "YYYYMMDDHHmmss"));
                $("#" + this._prefix + "PickerDate").datetimepicker({
                    format: "DD/MM/YYYY",
                    //defaultDate: moment.max(dates),
                    enabledDates: dates,
                    showClear: true
                }).on("dp.change", e => this.onDateFilterChange(e));

                this._audit = [...this.clinicalAnalysis.audit].sort((a,b) => b - a);
                this._timeline = {...this.timeline};
                this.renderLocalTable(this._audit);
                this.requestUpdate();
            }
        } else {
            this.timeline = {};
            this._timeline = {};
            this.requestUpdate();
        }
    }

    _changeTab(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;
        //the selectors are strictly defined to avoid conflics in tabs in children components
        $("#interpretation-audit .buttons-wrapper > .view-button", this).removeClass("active");
        $("#interpretation-audit .content-tab-wrapper > .content-tab", this).hide();
        $("#" + this._prefix + tabId, this).show();
        $("#" + this._prefix + tabId).addClass("active");
        for (const tab in this.activeTab) {
            this.activeTab[tab] = false;
        }
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    renderTimeline(data = []) {
        const timeline = {};
        data.slice(0, this.timelineEnd).forEach(event => {
            const d = timeline[event.date.substr(0,8)];
            if (d) {
                d.push(event);
            } else {
                timeline[event.date.substr(0,8)] = [event];
            }
        });
        return html`
            ${Object.keys(timeline).sort().reverse().map( date => html`
                <ul class="">
                ${timeline[date].length ? html`
                    <li class="date">${moment(date, "YYYYMMDD").format("D MMM YYYY")}</li>
                    ${timeline[date].map( entry => html`
                        <li class="event" data-date="${UtilsNew.dateFormatter(entry.date, "h:mm:ss a")}">
                            <span class="author">${entry.author}</span>
                            <h3>${entry.action}</h3>
                            <p>${entry.message}</p>
                        </li>
                    `)}
                ` : null}
            </ul>
        `)}`;

    }

    onDateFilterChange(e) {
        let date;
        this.timelineEnd = this.timelinePageSize;
        if (e.date) {
            // custom event fired by datepicker
            date = e.date.format("YYYYMMDD")
        } else if (e.target.value) {
            // native @input event
            date = moment(e.target.value, "DD/MM/YYYY").format("YYYYMMDD")
        }
        //console.log("date", date)
        if (date) {
            this._audit = this.clinicalAnalysis.audit.filter( event => {
                return ~event.date.toLowerCase().indexOf(date)
            });
        } else {
            this._audit = this.clinicalAnalysis.audit;
        }
        this.renderLocalTable(this._audit);
        this.requestUpdate();
    }

    filter(e) {
        this.timelineEnd = this.timelinePageSize;
        let keyword = e.target.value ? e.target.value.trim().toLowerCase() : null;
        if (keyword) {
            this._audit = this.clinicalAnalysis.audit.filter( event => {
                return ~event.author.toLowerCase().indexOf(keyword)
                    || ~event.action.toLowerCase().indexOf(keyword)
                    || ~event.message.toLowerCase().indexOf(keyword)
                    || ~event.author.toLowerCase().indexOf(keyword)
                    || ~event.date.toLowerCase().indexOf(keyword)
            });
        } else {
            this._audit = this.clinicalAnalysis.audit;
        }
        this.renderLocalTable(this._audit);
        this.requestUpdate();
    }

    showNextEvents() {
        this.timelineEnd += this.timelinePageSize;
        this.requestUpdate();
    }

    renderLocalTable(data = []) {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: data,
            columns: this._initTableColumns(),
            sidePagination: "local",
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement)
        });
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "Date",
                field: "date",
                sortable: true,
                formatter: date => UtilsNew.dateFormatter(date, "D MMM YYYY, h:mm:ss a")
            },
            {
                title: "User",
                field: "author",
                sortable: true,
            },
            {
                title: "Event Type",
                field: "action",
                sortable: true,
            },
            {
                title: "Message",
                field: "message"
            },

        ];
        return this._columns;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 25,
            pageList: [25, 50, 100],
        }
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            ${this.clinicalAnalysis.audit?.length ? html`
                <style>
                    .load-next-event-button {
                        display: block;
                        margin-left: 100px;
                    }
                </style>
                <div class="row" id="interpretation-audit">
                    <div class="col-md-8">
                        <div class="form-inline control-bar-wrapper">
                            <div class="btn-group view-button-wrapper">
                                <span data-id="timeline" class="view-button btn btn-default ${classMap({active: this.activeTab["timeline"] || UtilsNew.isEmpty(this.activeTab)})}" @click="${this._changeTab}">
                                    <i class="fas fa-th-list icon-padding"></i>
                                </span>
                                <span data-id="table" class="view-button btn btn-default ${classMap({active: this.activeTab["table"]})}" @click="${this._changeTab}">
                                    <i class="fas fa-table icon-padding"></i>
                                </span>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <div class="input-group-addon"><i class="fas fa-search"></i></div>
                                    <input type="text" class="form-control" placeholder="Filter events.." @input="${this.filter}">
                                </div>
                            </div>
                            <div class='input-group date' id="${this._prefix}PickerDate" data-field="${1}">
                                <input type='text' id="${this._prefix}DueDate" class="${this._prefix}Input form-control" placeholder="Date">
                                <span class="input-group-addon">
                                        <span class="fa fa-calendar"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">   
                        <div class="interpretation-audit">
                            <div class="content-tab-wrapper">
                                <div id="${this._prefix}timeline" role="tabpanel" class="active tab-pane content-tab">
                                    <div class="interpretation-audit-timeline">
                                        ${this.renderTimeline(this._audit)}
                                    </div>
                                    ${this._audit && this._audit.length > this.timelineEnd ? html`<div><a href="javascript: void 0" class="btn btn-default ripple load-next-event-button" @click="${this.showNextEvents}"> Load next ${this._audit.length - this.timelinePageSize > this.timelineEnd ? this.timelinePageSize : this._audit.length - this.timelineEnd} events..</a></div>` : null}
                                </div>
                                <div id="${this._prefix}table" role="tabpanel" class="tab-pane content-tab">
                                    <table id="${this.gridId}"></table>
                                </div>
                            </div>
                        </div> 
                    </div>
                </div>` : html`
            <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No Audit available yet.</div>
            `}
        `;
    }
}

customElements.define("clinical-analysis-audit-browser", ClinicalAnalysisAuditBrowser);
