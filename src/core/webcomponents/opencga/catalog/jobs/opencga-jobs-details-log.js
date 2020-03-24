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
import Utils from "../../../../utils.js";


export default class OpencgaJobsDetailsLog extends LitElement {

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
            job: {
                type: Object
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.content = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("job")) {
            if (this.active) {
                this.fetchContent(this.job);
            }

        }
        if (changedProperties.has("active")) {
            console.log("active", this.active);
            //todo this should call fetchContent iff the job has changed
            if (this.active) {
                this.fetchContent(this.job);
            }
        }
    }

    fetchContent(job) {
        this.opencgaSession.opencgaClient.jobs().tailLog(job.id, {
            study: this.opencgaSession.study.fqn,
            lines: 50
        }).then( restResponse => {
            const result = restResponse.getResult(0);
            this.content = result.content;

        }).catch( restResponse => {
            if (restResponse.getEvents("ERROR").length) {
                this.content = restResponse.getEvents("ERROR").map(error => error.message).join("\n");
                console.log("ERRORRR", restResponse.getEvents("ERROR"))
            } else {
                this.content = "Unknown error";
            }
        }).finally( () => this.requestUpdate());
    }

    render() {
        return html`
        <style> 
            pre.cmd {
                background: black;
                font-family: "Courier New", monospace;
                padding: 15px;
                color: #a5a5a5;
                font-size: .9em;
                min-height: 150px;
            }
            .wrapper {
                height: 35px;
                margin-top: 5px;
            }
            
            .wrapper fieldset {
                width: 150px;
            }
            
            .wrapper fieldset.autoreload {
                float: right;
            }
            
            .wrapper fieldset.log-type {
                float: left;
            }
            
            .wrapper-label {
                color: grey;
                vertical-align: text-bottom;
            }
            
            opencga-jobs-details-log .switch-toggle {
                display: inline-block;
            }
        </style>
        <div class="wrapper">
            <fieldset class="log-type">
                    <div class="switch-toggle text-white">
                        <input type="radio" name="log-type" id="log-head" value="false" checked @change="${this.calculateFilters}">
                        <label for="log-head" >Head</label>
                    
                        <input type="radio" name="log-type" id="log-tail" value="true" @change="${this.calculateFilters}">
                        <label for="log-tail">Tail</label>
                        <a class="btn btn-primary ripple btn-small"></a>
                    </div>
            </fieldset> 
            
            <fieldset class="autoreload">
                    <label class="wrapper-label">Autoreload</label>
                    <div class="switch-toggle text-white">
                        <input type="radio" name="autoreload" id="autoreload-false" value="false" checked @change="${this.calculateFilters}">
                        <label for="autoreload-false" ><span class="${this._prefix}-text">Off</span></label>
                    
                        <input type="radio" name="autoreload" id="autoreload-true" value="true" @change="${this.calculateFilters}">
                        <label for="autoreload-true" ><span class="${this._prefix}-text">On</span></label>
                        <a class="btn btn-primary ripple btn-small"></a>
                    </div>
            </fieldset> 
        </div>
        <pre class="cmd">${this.content}</pre>
        `;
    }

}

customElements.define("opencga-jobs-details-log", OpencgaJobsDetailsLog);
