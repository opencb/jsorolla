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
import UtilsNew from "../../utilsNew.js";


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
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "osv" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("sample")) {
            this.sampleObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
    }

    sampleIdObserver() {
        if (!this.sampleId) {
            const query = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            const _this = this;
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, query)
                .then(function(response) {
                    // if (response.response[0].id === undefined) {
                    //     response.response[0].id = response.response[0].name;
                    // }
                    _this.sample = response.responses[0].results[0];
                    _this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    sampleObserver() {

    }

    getDefaultConfig() {
        return {
            showTitle: false
        };
    }

    _getCollectionHtml() {
        return html`
            <h4>Method</h4>
            <div class="form-group">
                <label class="col-md-3 label-title">Method ID</label>
                <span class="col-md-9">${this.sample.collection}</span>
            </div>
        `;
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
    
            ${this.sample ? html`
                <div>
                    ${this._config.showTitle ? html`<h3 class="section-title">Summary</h3>` : null}
                    <div class="col-md-12">
                        <form class="form-horizontal" style="padding: 20px">
                            <div class="form-group">
                                <label class="col-md-3 label-title">Sample ID</label>
                                <span class="col-md-9">${this.sample.id}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">UUID</label>
                                <span class="col-md-9">${this.sample.uuid}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">Version</label>
                                <span class="col-md-9">${this.sample.version}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">Release</label>
                                <span class="col-md-9">${this.sample.release}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">Status</label>
                                <span class="col-md-9">${this.sample.internal.status.name}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">Creation Date</label>
                                <span class="col-md-9">${this.sample.creationDate}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">Modification Date</label>
                                <span class="col-md-9">${this.sample.modificationDate}</span>
                            </div>
                            <div class="form-group">
                                <label class="col-md-3 label-title">Description</label>
                                <span class="col-md-9">${this.sample.description}</span>
                            </div>
                          <!--   ${this._getCollectionHtml()} -->
                        </form>
                    </div>
    
                    ${this.sample.phenotypes && this.sample.phenotypes.length ? html`
                        <div class="col-md-12">
                            <h3 class="section-title">Phenotypes</h3>
                            <form class="form-horizontal">
                                ${this.sample.phenotypes.map( item => html`
                                    <span>${item.name} (<a href="http://compbio.charite.de/hpoweb/showterm?id=${item.id}" target="_blank">${item.id}</a>)</span>
                                    <br>
                                `)}
                            </form>
                        </div>
                    ` : null }
                </div>
            ` : null }
        `;
    }

}

customElements.define("opencga-sample-view", OpencgaSampleView);
