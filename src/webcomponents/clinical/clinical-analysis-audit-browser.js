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

import {LitElement, html, nothing} from "lit";
import {classMap} from "lit/directives/class-map.js";

import UtilsNew from "../../core/utils-new.js";
import "../commons/tool-header.js";
import "../variant/interpretation/variant-interpreter-grid.js";
import "../variant/interpretation/variant-interpreter-detail.js";
import "../variant/variant-browser-filter.js";
import GridCommons from "../commons/grid-commons.js";
import {Namespace, TempusDominus} from "@eonasdan/tempus-dominus";

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
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "int-audit";
        this.activeTab = "timeline";
        // this.timelineEnd = 0; // this.timelinePageSize;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.timelineEnd = this._config.timelinePageSize;
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


    // Fetch the CinicalAnalysis object from REST and trigger the observer call.
    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.clinicalAnalysisObserver();
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis && this.clinicalAnalysis.audit) {
            // const dates = this.clinicalAnalysis.audit.map(event => moment(event.date, "YYYYMMDDHHmmss"));
            const dates = this.clinicalAnalysis.audit.map(event => new Date(moment(event.date, "YYYYMMDDHHmmss")));
            // $("#" + this._prefix + "PickerDate").datetimepicker({
            //     format: "DD/MM/YYYY",
            //     // defaultDate: moment.max(dates),
            //     enabledDates: dates,
            //     showClear: true
            // }).on("dp.change", e => this.onDateFilterChange(e));
            const pickerDate = new TempusDominus(document.getElementById(this._prefix + "PickerDate"), {
                display: {
                    theme: "light",
                },
                localization: {
                    format: "dd/MM/yyyy",
                },
                restrictions: {
                    enabledDates: dates,
                }
            });
            pickerDate.subscribe(Namespace.events.change, e => this.onDateFilterChange(e));

            this._audit = [...this.clinicalAnalysis.audit].sort((a, b) => b.date - a.date);
            this.updateTable(); // Manually update table
            this.requestUpdate();
        }
    }

    _changeTab(e) {
        e.preventDefault();
        this.activeTab = e.currentTarget.dataset.id;
        this.requestUpdate();
    }

    renderTimeline() {
        const timeline = {};
        (this._audit || []).slice(0, this.timelineEnd).forEach(event => {
            const date = event.date.substr(0, 8);
            if (!timeline[date]) {
                timeline[date] = [];
            }
            timeline[date].push(event);
        });

        return html`
            ${Object.keys(timeline).sort().reverse().map(date => html`
                <ul class="list-unstyled">
                    <li class="h3 text-body-tertiary">${moment(date, "YYYYMMDD").format("D MMM YYYY")}</li>
                    ${timeline[date].map(entry => html`
                        <li class="event rounded" data-date="${UtilsNew.dateFormatter(entry.date, "h:mm:ss a")}">
                            <div class="d-flex flex-column gap-3">
                                <span class="fw-bold text-body-tertiary">${entry.author}</span>
                                <h3>${entry.action}</h3>
                                <p>${entry.message}</p>
                            </div>
                        </li>
                    `)}
                </ul>
            `)}
        `;
    }

    onDateFilterChange(e) {
        let date;
        if (e.date) {
            // custom event fired by datepicker
            // date = e.date.format("YYYYMMDD");
            date = e.date.format("yyyyMMdd");
        } else if (e.target.value) {
            // native @input event
            date = new Date(moment(e.target.value, "DD/MM/YYYY").format("YYYYMMDD"));
        }
        // console.log("date", date)
        if (date) {
            this._audit = this.clinicalAnalysis.audit.filter(event => {
                return event.date.toLowerCase().includes(date);
            });
        } else {
            this._audit = [...this.clinicalAnalysis.audit];
        }
        // Sort the audit logs by date
        this._audit.sort((a, b) => b.date - a.date);
        this.updateTable();
        this.requestUpdate();
    }

    filter(e) {
        this.timelineEnd = this._config.timelinePageSize;
        const keyword = e.target.value ? e.target.value.trim().toLowerCase() : null;
        if (keyword) {
            this._audit = this.clinicalAnalysis.audit.filter(event => {
                return event.author.toLowerCase().includes(keyword) ||
                        event.action.toLowerCase().includes(keyword) ||
                        event.message.toLowerCase().includes(keyword) ||
                        event.author.toLowerCase().includes(keyword) ||
                        event.date.toLowerCase().includes(keyword);
            });
        } else {
            this._audit = [...this.clinicalAnalysis.audit];
        }
        // Sort the audit logs by date
        this._audit.sort((a, b) => b.date - a.date);
        this.updateTable();
        this.requestUpdate();
    }

    showNextEvents() {
        this.timelineEnd += this._config.timelinePageSize;
        this.requestUpdate();
    }

    updateTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: this._audit,
            columns: this._getTableColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement)
        });
    }

    _getTableColumns() {
        return [
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
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 25,
            pageList: [25, 50, 100],
            timelinePageSize: 20,
        };
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        // Check if we do not have audits yet
        if (!this.clinicalAnalysis.audit?.length) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle"></i> No Audit available yet.
                </div>
            `;
        }

        return html`
            <style>
                .load-next-event-button {
                    display: block;
                    margin-left: 100px;
                }
            </style>
            <div class="row" id="interpretation-audit">
                <div class="col-md-8">
                    <div class="row row-cols-lg-auto g-3 justify-content-end align-items-center mb-3">
                        <div class="col-12">
                            <div class="btn-group">
                                <button class="view-button btn btn-light ${classMap({active: this.activeTab === "timeline"})}" data-id="timeline" @click="${this._changeTab}">
                                    <i class="fas fa-th-list pe-1"></i>
                                </button>
                                <button class="view-button btn btn-light ${classMap({active: this.activeTab === "table"})}"  data-id="table" @click="${this._changeTab}">
                                    <i class="fas fa-table pe-1"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-search"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Filter events.." @input="${this.filter}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class='input-group date' id="${this._prefix}PickerDate" data-field="${1}">
                                <input type='text' id="${this._prefix}DueDate" class="${this._prefix}Input form-control" placeholder="Date">
                                <span class="input-group-text ">
                                    <span class="fa fa-calendar"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                        <div id="${this._prefix}timeline" role="tabpanel" class="${this.activeTab !== "timeline" ? "d-none" : nothing }">
                            <div class="interpretation-audit-timeline">
                                ${this.renderTimeline()}
                            </div>
                            ${this._audit && this._audit.length > this.timelineEnd ? html`
                                <div class="btn btn-light load-next-event-button" @click="${this.showNextEvents}">
                                    Load next ${Math.min(this._config.timelinePageSize, this._audit.length - this.timelineEnd)} events..
                                </div>
                            ` : nothing}
                        </div>
                        <div id="${this._prefix}table" role="tabpanel" class="${this.activeTab !== "table" ? "d-none" : nothing }">
                            <table id="${this.gridId}"></table>
                        </div>
                </div>
            </div>
        `;
    }

}

customElements.define("clinical-analysis-audit-browser", ClinicalAnalysisAuditBrowser);
