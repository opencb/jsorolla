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

    statusFormatter(status) {
        return {
            "PENDING": `<span class="text-primary"><i class="far fa-clock"></i> ${status}</span>`,
            "QUEUED": `<span class="text-primary"><span class=""> <i class="far fa-clock"></i> ${status}</span>`,
            "RUNNING": `<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${status}</span>`,
            "DONE": `<span class="text-success"><i class="fas fa-check-circle"></i> ${status}</span>`,
            "ERROR": `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`,
            "UNKNOWN": `<span class="text-warning"><i class="fas fa-question-circle"></i> ${status}</span>`,
            "REGISTERING": `<span class="text-info"><i class="far fa-clock"></i> ${status}</span>`,
            "UNREGISTERED": `<span class="text-muted"><i class="far fa-clock"></i> ${status}</span>`,
            "ABORTED": `<span class="text-warning"><i class="fas fa-ban"></i> ${status}</span>`,
            "DELETED": `<span class="text-primary"><i class="fas fa-trash-alt"></i> ${status}</span>`
        }[status];
    }

    renderHTML(html) {
        return document.createRange().createContextualFragment(`${html}`);
    }

    render() {
        return this.job ? html`
        <style>
            .detail-row{
                padding: 5px;
            }
        </style>
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
                                <div class="form-group detail-row">
                                    <label for="" class="col-sm-2 control-label">Id</label>
                                    <div class="col-sm-10">
                                    ${this.job.id} (${this.job.uuid})
                                    </div>
                                </div>         
                                
                                <div class="form-group detail-row">
                                    <label for="" class="col-sm-2 control-label">User</label>
                                    <div class="col-sm-10">
                                    ${this.job.userId}
                                    </div>
                                </div>
                                
                                <div class="form-group detail-row">
                                    <label for="" class="col-sm-2 control-label">creationDate</label>
                                    <div class="col-sm-10">
                                    ${this.job.creationDate}
                                    </div>
                                </div>         
                                
                            </div>
                            <div class="col-md-6">
                                <div class="form-group detail-row">
                                    <label for="" class="col-sm-2 control-label">priority</label>
                                    <div class="col-sm-10">
                                    ${this.job.priority}
                                    </div>
                                </div>
                                <div class="form-group detail-row">
                                    <label for="" class="col-sm-2 control-label">outDir</label>
                                    <div class="col-sm-10">
                                    ${this.job.outDir.uri}
                                    </div>
                                </div>
                                ${this.job.dependsOn && this.job.dependsOn.length ? html`
                                    <div class="form-group detail-row">
                                        <label for="" class="col-sm-2 control-label">dependsOn</label>
                                        <div class="col-sm-10">
                                            <ul>
                                            ${this.job.dependsOn.map( job => html`
                                                <li>${job.id} (${job.uuid}) (${this.renderHTML(this.statusFormatter(job.internal.status.name))})</li>
                                            `) }
                                            </ul>
                                        </div>
                                    </div>
                                ` : null}
                                                                                                                            
                            </div>
                        </div>
                    </div>
                </div>
                <div id="${this._prefix}log" role="tabpanel" class="tab-pane">
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
