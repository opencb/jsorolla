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
            cellbaseClient: {
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
        this.activeTab = {url: true};
        this.mode = "sync";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        document.querySelectorAll("pre code").forEach(block => {
            hljs.highlightBlock(block);
        });
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    getDefaultConfig() {
        return {};
    }

    _changeTab(e) {
        const tabId = e.currentTarget.dataset.id;
        $("#code > .content-pills", this).removeClass("active");
        $("#code > .content-tab-wrapper > .content-tab", this).hide();
        $("#" + this._prefix + tabId, this).show();
        $("#" + this._prefix + tabId, this).addClass("active");
        for (const tab in this.activeTab) {
            this.activeTab[tab] = false;
        }
        this.activeTab[tabId] = true;
        this.requestUpdate();

    }

    generateCode(params, language) {
        switch (language) {
            case "url":
            case "curl":
            case "wget":
                return `http://localhost:3000/src/?inlineRadioOptions=sync#file/cancer37/test`;
            case "js":
                return `function $initHighlight(block, cls) {
try {
if (cls.search(/\\bno\\-highlight\\b/) != -1)
  return process(block, true, 0x0F) +
       
} catch (e) {
/* handle exception */
}
for (var 
}

export  $initHighlight;`;
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

    changeMode(e) {
        this.mode = e.currentTarget.value;
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

                .export-buttons i {
                    color: grey;
                }

                .export-buttons-text {

                }

                .export-section.mode {
                    height: 80px;
                }

                .export-section-title {

                }
            </style>
            <div>
                <ul class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#plain_text">Home</a></li>
                    <li><a data-toggle="tab" href="#code">Code</a></li>
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
                                        <input type="radio" name="inlineRadioOptions" id="mode_immediate" value="sync" checked @click="${this.changeMode}"> Immediate
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
                                <div class="export-buttons ripple active">
                                    <i class="fas fa-file-export fa-2x"></i>
                                    <span class="export-buttons-text">CSV</span>
                                </div>
                                <div class="export-buttons ripple">
                                    <i class="fas fa-file-export fa-2x"></i>
                                    <span class="export-buttons-text">JSON</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div id="code" class="tab-pane">
                    <h3>Code</h3>
                    <div class="btn-group" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["url"]})}" @click="${this._changeTab}" data-id="url">URL</button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["curl"]})}" @click="${this._changeTab}" data-id="curl">cURL</button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["wget"]})}" @click="${this._changeTab}" data-id="wget">wGET</button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["js"]})}" @click="${this._changeTab}" data-id="js">Javascript</button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["r"]})}" @click="${this._changeTab}" data-id="r">R</button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["python"]})}" @click="${this._changeTab}" data-id="python">Python</button>
                    </div>

                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}url" class="content-tab active">
                            <pre>
                                <code class="language-bash">${this.generateCode({}, "url")}</code>
                            </pre>
                        </div>
                        <div id="${this._prefix}curl" class="content-tab">
                            <pre>
                                <code class="language-bash">${this.generateCode({}, "curl")}</code>
                            </pre>
                        </div>
                        <div id="${this._prefix}wget" class="content-tab">
                            <pre>
                                <code class="language-bash">${this.generateCode({}, "wget")}</code>
                            </pre>
                        </div>
                        <div id="${this._prefix}js" class="content-tab">
                            <pre>
                                <code class="language-javascript">${this.generateCode({}, "js")}</code>
                            </pre>
                        </div>
                        <div id="${this._prefix}r" class="content-tab">
                            <pre>
                                <code class="language-r">${this.generateCode({}, "r")}</code>
                            </pre>
                        </div>
                        <div id="${this._prefix}python" class="content-tab">
                            <pre>
                                <code class="language-python">${this.generateCode({}, "python")}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-export", OpencgaExport);
