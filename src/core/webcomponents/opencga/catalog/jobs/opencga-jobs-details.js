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


export default class OpencgaJobsDetails extends LitElement {

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
            config: {
                type: Object
            },
            jobId: {
                type: Object
            },
            job: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("job")) {

        }
    }

    render() {
        return this.job ? html`
        <div>
            <ul class="nav nav-tabs" role="tablist">
                ${this.config.detail.length && this.config.detail.map(item => html`
                    ${item.active ? html`
                         <li role="presentation" class="active">
                            <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab"
                               data-id="${item.id}"
                               class="browser-variant-tab-title"
                               @click="${this._changeBottomTab}">${item.title}</a>
                        </li>
                        ` : html`
                        <li role="presentation" class="">
                            <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab"
                               data-id="${item.id}"
                               class="browser-variant-tab-title"
                               @click="${this._changeBottomTab}">${item.title}</a>
                        </li>
                    `}
                `)}
            </ul>
            <div class="tab-content">

                <div id="${this._prefix}job_detail" role="tabpanel" class="tab-pane active">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-6 ">
                                
                                <div class="form-group">
                                    <label for="inputEmail3" class="col-sm-2 control-label">Id</label>
                                    <div class="col-sm-10">
                                        ${this.job.id} (${this.job.uuid})
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="inputEmail3" class="col-sm-2 control-label">Id</label>
                                    <div class="col-sm-10">
                                        Tool ${this.job.tool.id}
                                    </div>
                                </div>                        
                            </div>
                            <div class="col-md-6">
                               id ${this.job.id} (${this.job.uuid})
                                Tool ${this.job.tool.id}
                            </div>
                        </div>
                    </div>
                </div>
                <div id="${this._prefix}log" role="tabpanel" class="tab-pane active">
                    <div>
                        log
                    </div>
                </div>
            </div>
        
        
            

            
        </div>
        ` : null;
    }

}

customElements.define("opencga-jobs-details", OpencgaJobsDetails);
