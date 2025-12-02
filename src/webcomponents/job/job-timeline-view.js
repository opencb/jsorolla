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
import {RestResponse} from "../../core/clients/rest-response.js";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../loading-spinner.js";
import JobTimelinePlot from "./job-timeline-plot.js";
import Pedigree from "../../core/visualisation/pedigree";

class JobTimelineView extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            query: {
                type: Object
            },
            jobs: {
                type: Array
            },
            active: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.facet = {};
        this.preparedFacetQueryFormatted = {};
        this.facetResults = [];
        this.loading = false;

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("query") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("jobs") && this.active) {
            this.jobsObserver();
        }
        if (changedProperties.has("active") && this.active) {
            this.queryObserver()
        }
        if (changedProperties.has("opencgaSession") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onAggregationFieldChange(e) {
        this.preparedFacetQueryFormatted = e.detail.value;
        this.requestUpdate();
    }

    queryObserver() {
        this.query = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            include: "id,tool.id,creationDate,execution.start,execution.end,internal.status",
            limit: 100,
        };

        this.loading = true;
        this.errorState = null;
        this.requestUpdate();

        this.opencgaSession.opencgaClient.jobs()
            .search(this.query)
            .then(restResponse => {
                this.errorState = null;


                this.jobs = restResponse.responses[0].results;
                const results = restResponse.responses[0].results;
                if (results.length === 0) {
                    this.stats = [];
                    this.facetResults = [];
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                        title: "No results",
                        message: "No jobs found for the given query.",
                    });
                } else {
                    console.log(results[0])
                    this.stats = results.map(job => (
                        {
                            id: job.id,
                            x: job.creationDate,
                            y: (job.execution?.end - job.execution?.start) || 0,
                            toolId: job.tool?.id || "",
                            status: job.internal?.status?.id || "",
                        }
                    ));

                    const shape = {
                        DONE: "circle",
                        PENDING: "triangle",
                        ABORTED: "diamond",
                        ERROR: "cross",
                    };
                    const color = {
                        "variant-index": "blue",
                        "variant-secondary-annotation-index": "orange",
                    };
                    const _series = {
                        DONE: {
                            id: "DONE",
                            name: "DONE",
                            marker: {
                                symbol: shape.DONE
                            },
                            // color: "green",
                            data: []
                        },
                        PENDING: {
                            id: "PENDING",
                            name: "PENDING",
                            marker: {
                                symbol: shape.PENDING
                            },
                            // color: "blue",
                            data: []
                        },
                        ABORTED: {
                            id: "ABORTED",
                            name: "ABORTED",
                            marker: {
                                symbol: shape.ABORTED
                            },
                            // color: "orange",
                            data: []
                        },
                        ERROR: {
                            id: "ERROR",
                            name: "ERROR",
                            marker: {
                                symbol: shape.ERROR
                            },
                            // color: "red",
                            data: []
                        }
                    };
                    for (const job of results) {
                        const jobToolId = job.tool?.id || "UNKNOWN";
                        const jobStatus = job.internal?.status?.id || "UNKNOWN";
                        const durationHours = (job.execution?.end - job.execution?.start) / 3600000; // Convert milliseconds to hours
                        // if (!_series[jobToolId + "_" + jobStatus]) {
                        //     _series[jobToolId + "_" + jobStatus] = {
                        //         id: jobStatus,
                        //         name: jobStatus,
                        //         marker: {
                        //             symbol: shape[jobStatus] || "circle",
                        //         },
                        //         color: color[jobStatus] || "grey",
                        //         data: []
                        //     }
                        // }
                        // _series[jobToolId + "_" + jobStatus]?.data.push([job.creationDate, durationHours || 0, 5]);
                        // _series[jobStatus]?.data.push([job.creationDate, durationHours || 0, 5]);
                        _series[jobStatus]?.data.push(
                            {
                                // x: Number.parseInt(job.creationDate),
                                x: job.creationDate,
                                y: durationHours || 0,
                                // z: 2, // This is the bubble size
                                toolId: jobToolId,
                                status: jobStatus,
                                name: job.id,
                                // marker: {
                                //     symbol: shape[jobStatus] || "cross",
                                // },
                                color: color[jobToolId] || "blue",
                            }
                        );
                    }

                    this.series = Object.values(_series);

                    debugger
                }
            })
            .catch(response => {
                // this.facetResults = [];
                if (response instanceof RestResponse || response instanceof Error) {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                } else {
                    this.errorState = [{name: "Aggregation Error", message: JSON.stringify(response)}];
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                        title: this.errorState[0].name,
                        message: this.errorState[0].message,
                    });
                }
            })
            .finally(() => {
                this.loading = false;
                this.requestUpdate();
            });
    }

    jobsObserver() {
        if (this.jobs?.length > 0) {
            const querySelector = this.querySelector(`#${this._prefix}JobsTimelineView`);
            const timelinePlot = new JobTimelinePlot(this.jobs, {});

            this.svg = timelinePlot.render({}, {
                width: querySelector.offsetWidth,
                height: this._config.height || 100,
            });

            querySelector.appendChild(this.svg);
            this.requestUpdate();
        }
    }

    render() {
        return html`
            <style>
                #loading {
                    text-align: center;
                    margin-top: 40px;
                }
            </style>

            <div class="row">
                <div class="col-md-2">
                    <button type="button" class="btn btn-primary w-50 mx-auto d-block my-3" @click="${this.queryObserver}">
                        <strong>Run</strong>
                    </button>
                </div>

                <div class="col-md-10">
                    <simple-chart
                        .active="${true}"
                        type="bubble"
                        title="VCF Filter"
                        .data="${this.series || []}">
                    </simple-chart>
                </div>

                <div id="${this._prefix}JobsTimelineView" class="col-md-12">

                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            // colors: [
            //     'rgba(5,141,199,0.5)', 'rgba(80,180,50,0.5)', 'rgba(237,86,27,0.5)'
            // ],
            // series: [
            //     {
            //         id: 'DONE',
            //         name: 'DONE',
            //         marker: {
            //             symbol: 'circle'
            //         }
            //     },
            //     {
            //         name: 'PENDING',
            //         id: 'PENDING',
            //         marker: {
            //             symbol: 'triangle'
            //         }
            //     },
            //     {
            //         name: 'ABORTED',
            //         id: 'ABORTED',
            //         marker: {
            //             symbol: 'square'
            //         }
            //     }
            // ]
        };
    }

}

customElements.define("job-timeline-view", JobTimelineView);
