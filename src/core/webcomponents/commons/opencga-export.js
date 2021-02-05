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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import UtilsNew from "../../utilsNew.js";


export default class OpencgaExport extends LitElement {

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
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this.activeTab = {
            link: {url: true},
            code: {python: true}
        };
        this.mode = "sync";
        this.format = "csv";
        this.query = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
        }
        if (changedProperties.has("query") || changedProperties.has("config")) {
            // this._config = {...this.getDefaultConfig(), ...this.config};
            if (this.config?.resource) {
                document.querySelectorAll("code").forEach(block => {
                    // hljs.highlightBlock(block);
                });

                new ClipboardJS(".clipboard");
            }
            this.requestUpdate();

        }
    }

    getDefaultConfig() {
        return {};
    }

    _changeTab(e) {
        const {viewId, tabId} = e.currentTarget.dataset;
        $(`#${viewId} > .content-pills`, this).removeClass("active");
        $(`#${viewId} > .content-tab-wrapper > .content-tab`, this).removeClass("active");
        $("#" + this._prefix + tabId, this).addClass("active");
        for (const tab in this.activeTab[viewId]) {
            this.activeTab[viewId][tab] = false;
        }
        this.activeTab[viewId][tabId] = true;
        this.requestUpdate();

    }

    generateCode(params, language) {
        const resourceMap = {
            "FILE": "files",
            "SAMPLE": "samples",
            "INDIVIDUAL": "individuals",
            "COHORT": "cohorts",
            "FAMILY": "families",
            "CLINICAL_ANALYSIS": "clinical",
            "JOB": "jobs"
        };
        if (!this.config?.resource) {
            return "Resource not defined";
        }
        switch (language) {
            case "url":
                // TODO FIXME in case of FILE add in query `type: this.config.resource`
                return `${this.opencgaSession.server.host}/webservices/rest/v2/${resourceMap[this.config.resource]}/search?${UtilsNew.encodeObject({...this.query, study: this.opencgaSession.study.fqn, sid: this.opencgaSession.token})}`;
            case "curl":
            case "wget":
                return `${this.opencgaSession.server.host}/webservices/rest/v2/${resourceMap[this.config.resource]}/search?${UtilsNew.encodeObject({id: 2, count: false})}`;
            case "js":
                return `
import {OpenCGAClient} from "./opencga-client.js";
const client = new OpenCGAClient({
    host: "${this.opencgaSession.server.host}",
    version: "v2",
    cookies: {active: false}
});
(async () => {
    try {
        await client.login(user, password)
        const session = await client.createSession();
        const restResponse = await session.opencgaClient.${resourceMap[this.config.resource]}().search(${JSON.stringify({...this.query, study: this.opencgaSession.study.fqn})});
        console.log(restResponse.getResults());
    } catch (e) {
        console.error(e)
    }
})();
                
                `;
            case "python":
                return `def somefunc(param1='', param2=0):
    r'''A docstring'''
    if param1 > param2: # interesting
        print 'Greater'
    return (param2 - param1 + 1 + 0b10l) or None

class SomeClass:
    pass`;
            case "r":
                return `library(ggplot2)
models <- tibble::tribble(
  ~model_name,    ~ formula,
  "length-width", Sepal.Length ~ Petal.Width + Petal.Length,
  "interaction",  Sepal.Length ~ Petal.Width * Petal.Length
)
            `;
        }
    }

    clipboard(e) {

    }
    changeMode(e) {
        this.mode = e.currentTarget.value;
        this.requestUpdate();
    }

    changeFormat(e) {
        e.preventDefault();
        this.format = e.currentTarget.dataset.format;
        this.requestUpdate();
    }

    render() {
        return html`
            <style>

                .export-buttons {
                    width: 100px;
                    height: 100px;
                    margin: 0 10px 0 0;
                    flex-direction: column;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                }

                .export-buttons.active i {
                    color: grey;
                }

                .export-buttons i {
                    color: #cbcbcb;
                }

                .export-buttons-text {

                }

                .export-section.mode {
                    height: 80px;
                }

                .export-section-title {

                }

                opencga-export code {
                    white-space: pre;
                }
            </style>
            <div>
                <ul class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#plain_text">Plain text</a></li>
                    <li><a data-toggle="tab" href="#link">Link</a></li>
                    <li><a data-toggle="tab" href="#code">Opencga Client</a></li>
                </ul>
            </div>

            <div class="tab-content">
                <div id="plain_text" class="tab-pane active">
                    <form class="form-horizontal">
                        <div class="form-group">
                            <div class="col-md-12">
                                <h4 class="export-section-title">Mode</h4>
                                <div class="">
                                    <label class="radio-inline">
                                        <input type="radio" name="inlineRadioOptions" id="mode_immediate" value="sync" checked @click="${this.changeMode}"> Download
                                    </label>
                                    <label class="radio-inline">
                                        <input type="radio" name="inlineRadioOptions" id="mode_job" value="async" @click="${this.changeMode}"> Schedule a job
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-md-12">
                                <div class="alert alert-info">
                                    <i class="fa fa-info-circle url"></i>
                                    ${this.mode === "sync" ? "The download is immediate, but the results are limited to the first 1000." : "An async job will be scheduled. [...]"}
                                </div>
                                ${this.mode === "async" ? html`
                                    <div class="form-horizontal">
                                        <div class="form-group">
                                            <label for="inputPassword" class="col-sm-2 control-label">Job Id</label>
                                            <div class="col-sm-10">
                                                <input type="text" class="form-control" placeholder="job id" @change="${this.changeJobId}">
                                            </div>
                                        </div>
                                    </div>` : null}
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-12">
                                <h4 class="export-section-title">Format</h4>
                                <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "csv"})}" data-format="csv" @click="${this.changeFormat}">
                                    <i class="fas fa-file-export fa-2x"></i>
                                    <span class="export-buttons-text">CSV</span>
                                </button>
                                <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "json"})}" data-format="json" @click="${this.changeFormat}">
                                    <i class="fas fa-file-export fa-2x"></i>
                                    <span class="export-buttons-text">JSON</span>
                                </button>
                            </div>
                        </div>
                    </form>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            ${this.mode === "sync" ? html`<button type="button" class="btn btn-primary">Download</button>` : html`
                                <button type="button" class="btn btn-primary">Launch job</button>`
                            }
                    </div>
                    
                </div>


                <div id="link" class="tab-pane">
                    <h3>Links</h3>
                    <div class="btn-group" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.link["url"]})}" @click="${this._changeTab}" data-view-id="link"
                                data-tab-id="url">URL
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.link["curl"]})}" @click="${this._changeTab}" data-view-id="link"
                                data-tab-id="curl">cURL
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.link["wget"]})}" @click="${this._changeTab}" data-view-id="link"
                                data-tab-id="wget">wGET
                        </button>
                    </div>

                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}url" class="content-tab active">
                            <code class="language-bash">${this.generateCode({}, "url")}</code>
                        </div>
                        <div id="${this._prefix}curl" class="content-tab">
                            <code class="language-bash">${this.generateCode({}, "curl")}</code>
                        </div>
                        <div id="${this._prefix}wget" class="content-tab">
                            <code class="language-bash">${this.generateCode({}, "wget")}</code>
                        </div>
                    </div>
                </div>


                <div id="code" class="tab-pane">
                    <h3>Code</h3>
                    <div class="btn-group" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["python"]})}" @click="${this._changeTab}" data-view-id="code"
                                data-tab-id="python">Python
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["r"]})}" @click="${this._changeTab}" data-view-id="code"
                                data-tab-id="r">R
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["js"]})}" @click="${this._changeTab}" data-view-id="code"
                                data-tab-id="js">Javascript
                        </button>
                    </div>

                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}python" class="content-tab active">
                            <code class="language-python">${this.generateCode({}, "python")}</code>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Start Export</button>
                            </div>
                            
                        </div>
                        <div id="${this._prefix}r" class="content-tab">
                            <code class="language-r">${this.generateCode({}, "r")}</code>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Start Export</button>
                            </div>
                            
                        </div>
                        <div id="${this._prefix}js" class="content-tab">
                            <button class="clipboard" data-clipboard-target="code.language-javascript" @click="${this.clipboard}"><i class="far fa-copy"></i></button>
                            <code class="language-javascript">${this.generateCode({}, "js")}</code>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Start Export</button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-export", OpencgaExport);
