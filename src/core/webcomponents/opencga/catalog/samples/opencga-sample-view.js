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

export default class OpencgaSampleView extends LitElement {

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
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        // this.prefix = "osv" + Utils.randomString(6);

        this.samples = [];
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if(changedProperties.has("opencgaClient")) {
            this.renderAnalysisTable();
        }
        if(changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if(changedProperties.has("sample")) {
            this.sampleObserver();
        }
        if(changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    sampleIdObserver() {
        if (this.sampleId !== undefined && this.sampleId !== "") {
            let params = {
                study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
                includeIndividual: true
            };
            let _this = this;
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, params)
                .then(function (response) {
                    if (response.response[0].id === undefined) {
                        response.response[0].id = response.response[0].name;
                    }
                    _this.sample = response.response[0].result[0];
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        }

    }

    sampleObserver() {
        if (this.sample !== undefined && this.sample.attributes !== undefined) {
            this.individual = this.sample.attributes.OPENCGA_INDIVIDUAL;
        }
    }

    getDefaultConfig() {
        return {
            title: "Sample",
            showTitle: true,
        };
    }

    render() {
        return html`
        <style include="jso-styles">
            .section-title {
                border-bottom: 2px solid #eee;
            }
            .label-title {
                text-align: left;
                padding-left: 5px;
                padding-right: 10px;
            }
        </style>

        ${this._config.showTitle ? html`
            <div class="panel" style="margin-bottom: 10px">
                <h2 >&nbsp;${this._config.title}: ${this.sample.id}</h2>
            </div>
        ` : null}
        
        <div class="row" style="padding: 0px 10px">
            <div class="col-md-12">
                <div class="col-md-8" style="padding-left: 0px">
                    <!--<h2 style="margin-bottom: 5px"> Summary Sample: {{sample.id}}</h2>-->
                    <!--<hr style="margin: 2px 0px;border-top: 2px solid #eee">-->

                    <h3 class="section-title">Summary</h3>

                    <div class="col-md-6">
                        <!--<label>Sample</label>-->
                        <!--<hr style="margin: 2px 0px;border-top: 2px solid #eee">-->
                        <form class="form-horizontal">
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Sample ID</label>
                                <span class="col-md-9">${this.sample.id}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Version</label>
                                <span class="col-md-9">${this.sample.version}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">UUID</label>
                                <span class="col-md-9">${this.sample.uuid}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Release</label>
                                <span class="col-md-9">${this.sample.release}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Status</label>
                                <span class="col-md-9">${this.sample.status.name}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Creation Date</label>
                                <span class="col-md-9">${this.sample.creationDate}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Modification Date</label>
                                <span class="col-md-9">${this.sample.modificationDate}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Description</label>
                                <span class="col-md-9">${this.sample.description}</span>
                            </div>
                        </form>
                    </div>

                    <div class="col-md-6">
                        <form class="form-horizontal">
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">File</label>
                                <span class="col-md-9">${this.sample.source}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Type</label>
                                <span class="col-md-9">${this.sample.type}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Somatic</label>
                                <span class="col-md-9">${this.sample.somatic}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Phenotypes</label>
                                <span class="col-md-9">
                                ${this.sample.phenotypes && this.sample.phenotypes.length ? this.sample.phenotypes.map( item => html`
                                    <span>${this.item.name} (<a href="http://compbio.charite.de/hpoweb/showterm?id=${this.item.id}" target="_blank">${this.item.id}</a>)</span>
                                    <br>
                                `) : null}
                            </span>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="col-md-4" style="padding-left: 0px">
                    <h3 class="section-title">Individual</h3>
                    <div class="col-md-12">
                        <form class="form-horizontal">
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">ID</label>
                                <span class="col-md-9">${this.individual.id}aaa</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Name</label>
                                <span class="col-md-9">${this.individual.name}bbb</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Version</label>
                                <span class="col-md-9">${this.individual.version}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">UUID</label>
                                <span class="col-md-9">${this.individual.uuid}</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Sex (Karyotype)</label>
                                <span class="col-md-9">${this.individual.sex}MALE (${this.individual.karyotypicSex}XY)</span>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-3 label-title">Phenotypes</label>
                                <span class="col-md-9">
                                ${this.individual.phenotypes && this.individual.phenotypes.length ? this.individual.phenotypes.map( item => html`
                                    <span>${this.item.name} (<a href="http://compbio.charite.de/hpoweb/showterm?id=${this.item.id}" target="_blank">${this.item.id}</a>)</span>
                                    <br>
                                `) : null }
                            </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-md-12">
                <h3 class="section-title">Annotations</h3>

            </div>
        </div>
        `;
    }
}

customElements.define("opencga-sample-view", OpencgaSampleView);

