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
import {NotificationQueue} from "../Notification.js";


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

        this.resourceMap = {
            "VARIANT": "variants",
            "FILE": "files",
            "SAMPLE": "samples",
            "INDIVIDUAL": "individuals",
            "COHORT": "cohorts",
            "FAMILY": "families",
            "CLINICAL_ANALYSIS": "clinical",
            "JOB": "jobs"
        };

        this.mode = "sync";
        this.format = "tab";
        this.query = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // this._config = {...this.getDefaultConfig(), ...this.config};

    }

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {


        }
        if (changedProperties.has("query") || changedProperties.has("config")) {
            // this._config = {...this.getDefaultConfig(), ...this.config};
            if (this.config?.resource) {
                document.querySelectorAll("code").forEach(block => {
                    // hljs.highlightBlock(block);
                });

                new ClipboardJS(".clipboard-button");
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

    generateCode(language) {

        if (!this.config?.resource) {
            return "Resource not defined";
        }
        if (!this.opencgaSession?.study) {
            return "OpencgaSession not available";
        }

        let q = {...this.query, study: this.opencgaSession.study.fqn, sid: this.opencgaSession.token};
        if (this.config.resource === "FILE") {
            q = {...q, type: this.config.resource};
        }

        let ws = `${this.resourceMap[this.config.resource]}/${this.method}`;
        if (this.config.resource === "VARIANT") {
            this.method = "query";
            ws = "analysis/variant/query";
        } else {
            this.method = "search";
        }

        switch (language) {
            case "url":
                return `${this.opencgaSession.server.host}/webservices/rest/v2/${ws}?${UtilsNew.encodeObject(q)}`;
            case "curl":
                return `curl -X GET --header "Accept: application/json" --header "Authorization: Bearer ${this.opencgaSession.token}" "${this.opencgaSession.server.host}/webservices/rest/v2/${ws}?${UtilsNew.encodeObject({...this.query, study: this.opencgaSession.study.fqn})}/"`;
            case "wget":
                return `wget -O ${this.resourceMap[this.config.resource]}.txt "${this.opencgaSession.server.host}/webservices/rest/v2/${ws}?${UtilsNew.encodeObject(q)}"`;
            case "cli":
                return `opencga.sh ${this.resourceMap[this.config.resource]} ${this.method} ${Object.entries(q).map(([k, v]) => `--${k} "${v}"`).join(" ")}`;
            case "js":
                return this.generateJs();
            case "python":
                return this.generatePython();
            case "r":
                return this.generateR();
        }
    }

    generateR() {
        const q = {...this.query, study: this.opencgaSession.study.fqn};
        const clientsName = {
            "VARIANT": "variantClient",
            "FILE": "fileClient",
            "SAMPLE": "sampleClient",
            "INDIVIDUAL": "individualClient",
            "COHORT": "cohortClient",
            "FAMILY": "familyClient",
            "CLINICAL_ANALYSIS": "clinicalAnalysisClient",
            "JOB": "jobClient"
        };
        const str = `library(opencgaR)
con <- initOpencgaR(host = "${this.opencgaSession.server.host}", version = "v2")
con <- opencgaLogin(opencga = con, userid = "", passwd = "")
${this.resourceMap[this.config.resource]} = ${clientsName[this.config.resource]}(OpencgaR = con, endpointName = "${this.method}", params = list(${Object.entries(q).map(([k, v]) => `${k}='${v}'`).join(", ")}, limit=10, include="id"))`;
        return this.lineSplitter(str);
    }

    generatePython() {
        const q = {...this.query, study: this.opencgaSession.study.fqn};
        const str = `
from pyopencga.opencga_config import ClientConfiguration
from pyopencga.opencga_client import OpencgaClient

config = ClientConfiguration({"rest": {"host": "${this.opencgaSession.server.host}"}})
oc = OpencgaClient(config, token="${this.opencgaSession.token}")
${this.resourceMap[this.config.resource]} = oc.${this.resourceMap[this.config.resource]}.${this.method}(include='id', limit=10, ${Object.entries(q).map(([k, v]) => `${k}='${v}'`).join(", ")})
print(${this.resourceMap[this.config.resource]}.get_responses())`;
        return this.lineSplitter(str);
    }

    generateJs() {
        const str = `
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
        const restResponse = await session.opencgaClient.${this.resourceMap[this.config.resource]}().search(${JSON.stringify({...this.query, study: this.opencgaSession.study.fqn})});
        console.log(restResponse.getResults());
    } catch (e) {
        console.error(e)
    }
})();`;
        return this.lineSplitter(str);
    }

    async launchJob(e) {
        if (this.config.resource === "VARIANT") {
            try {
                const data = {...this.query,
                    study: this.opencgaSession.study.fqn,
                    summary: true,
                    outputFileName: "variants"
                };
                let params = {study: this.opencgaSession.study.fqn};
                if (this.jobId) {
                    params = {...params, jobId: this.jobId};
                }
                const restResponse = await this.opencgaSession.opencgaClient.variants().runExport(data, params);
                const job = restResponse.getResult(0);
                new NotificationQueue().push(`Job ${job.id} is now PENDING`, null, "info");
            } catch (e) {
                console.error(e);
                UtilsNew.notifyError(e);
            }
        } else {

        }
    }

    lineSplitter(multilineStr) {
        return multilineStr.split(/[\r\n]/g).filter(Boolean).map(line => html`<div class="code-line">${line}</div>`);
    }

    changeJobId(e) {
        this.jobId = e.target.value;
    }

    clipboard(e) {
        new NotificationQueue().push("Code has been copied to Clipboard", null, "success");
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

    onDownloadClick() {
        this.dispatchEvent(new CustomEvent("export", {
            detail: {
                option: this.format
            }
        }));
    }

    render() {
        return html`
            <style>

                
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
                                                <input type="text" class="form-control" placeholder="job id" @input="${this.changeJobId}">
                                            </div>
                                        </div>
                                    </div>` :
                                        html`
                                    <div class="form-group">
                                        <div class="col-md-12">
                                            <h4 class="export-section-title">Format</h4>
                                            <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "tab"})}" data-format="tab" @click="${this.changeFormat}">
                                                <i class="fas fa-file-export fa-2x"></i>
                                                <span class="export-buttons-text">CSV</span>
                                            </button>
                                            <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "json"})}" data-format="json" @click="${this.changeFormat}">
                                                <i class="fas fa-file-export fa-2x"></i>
                                                <span class="export-buttons-text">JSON</span>
                                            </button>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>

                        
                    </form>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default ripple" data-dismiss="modal">Close</button>
                            ${this.mode === "sync" ? html`
                                <button type="button" class="btn btn-primary btn-lg ripple" @click="${this.onDownloadClick}">
                                    ${this.config?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null} <i class="fa fa-download icon-padding" aria-hidden="true"></i> Download
                                </button>` : html`
                                <button type="button" class="btn btn-primary btn-lg ripple" @click="${this.launchJob}">Launch job</button>`
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
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-url" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-url">
                                    ${this.generateCode("url")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}curl" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-curl" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-curl">
                                    ${this.generateCode("curl")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}wget" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-wget" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-wget">
                                    ${this.generateCode("wget")}
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default ripple" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>


                <div id="code" class="tab-pane">
                    <h3>Code</h3>
                    <div class="btn-group" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["python"]})}" @click="${this._changeTab}" data-view-id="code"
                                data-tab-id="python">Python
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["cli"]})}" @click="${this._changeTab}" data-view-id="code"
                                data-tab-id="cli">CLI
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
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-python" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-python">
                                    ${this.generateCode("python")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}r" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-r" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-r">
                                    ${this.generateCode("r")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}cli" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-r" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-cli">
                                    ${this.generateCode("cli")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}js" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-javascript" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-javascript">
                                    ${this.generateCode("js")}
                                </div>
                            </div>
                            
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-default ripple" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-export", OpencgaExport);
