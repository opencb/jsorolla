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
            jobId: {
                type: String
            },
            active: {
                type: Boolean
            }
        }
    }

    _init(){
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.content = []
    }

    updated(changedProperties) {
        if(changedProperties.has("jobId")) {
            console.log("jobId in details-log", this.jobId, this.active)
            if(this.active) {
                this.fetchContent(this.jobId);
            }

        }
        if(changedProperties.has("active")) {
            console.log("active", this.active)
        }
    }

    fetchContent(jobId) {
        this.opencgaSession.opencgaClient.jobs().tailLog(jobId).then( restResponse => {
            const content = restResponse.getResults()
            console.log(content)
        })
    }

    render() {
        return html`
        <style> 
            .cmd {
                background: black;
                font-family: "Courier New", monospace;
                padding: 15px;
                color: #a5a5a5;
                font-size: .9em;
            }
            .wrapper {
                width: 130px;
                float: right;
                height: 30px;
            }
            .wrapper-label {
                color: grey;
                vertical-align: text-bottom;
            }
            
            opencga-jobs-details-log .switch-toggle {
                display: inline-block;
            }
        </style>
        
        <div class="cmd">
        <fieldset class="wrapper">
                <label class="wrapper-label">Autoreload</label>
                <div class="switch-toggle text-white">
                    <input type="radio" name="autoreload" id="autoreload-false" value="false" checked @change="${this.calculateFilters}">
                    <label for="autoreload-false" ><span class="${this._prefix}-text">Off</span></label>
                
                    <input type="radio" name="autoreload" id="autoreload-true" value="true" @change="${this.calculateFilters}">
                    <label for="autoreload-true" ><span class="${this._prefix}-text">On</span></label>
                    <a class="btn btn-primary ripple btn-small"></a>
                </div>
        </fieldset> 
            this.opencgaSession.opencgaClient.jobs().tailLog<BR>
            this.opencgaSession.opencgaClient.jobs().tailLog<BR>
            this.opencgaSession.opencgaClient.jobs().tailLog<BR>
            this.opencgaSession.opencgaClient.jobs().tailLog<BR>
            this.opencgaSession.opencgaClient.jobs().tailLog<BR>
        </div>
        `;
    }
}

customElements.define("opencga-jobs-details-log", OpencgaJobsDetailsLog);
