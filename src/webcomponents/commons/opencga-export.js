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

import {LitElement, html, nothing} from "lit";
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../core/utilsNew.js";
import NotificationUtils from "./utils/notification-utils.js";

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
        this._prefix = UtilsNew.randomString(8);
        this.activeTab = {
            link: {url: true},
            code: {cli: true}
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

        this.tabs = ["download", "export", "link", "script"]; // default tabs to show
    }

    connectedCallback() {
        super.connectedCallback();
        // this._config = {...this.getDefaultConfig(), ...this.config};
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
            if (this.config.gridColumns) {
                this.buildExportFieldList();
            }
            if (this.config.exportTabs) {
                this.tabs = this.config.exportTabs;
            }
            this.requestUpdate();
        }
    }

    /*
     * Build this.exportFields, which is a 1 or 2 dimensional array to keep track of the fields to include/exclude in TSV files.
     */
    buildExportFieldList() {

        // avoid rebuilding of exportFields. That would make lose the current state.
        if (this.exportFields) return;

        let subIndx = 0; // offset in second row
        const [firstRow, secondRow] = this.config.gridColumns;
        this.exportFields = [];

        firstRow.filter(f => f?.visible !== false).forEach((c, i) => {
            if (c.rowspan !== 2 || !c.rowspan) {
                // add sub Level
                const subFields = secondRow.filter(f => f?.visible !== false).slice(subIndx, subIndx + c.colspan);
                subIndx += c.colspan ? c.colspan : 0;
                this.exportFields.push({id: c.id, export: true, children: subFields.map(s => ({id: s.id, export: true}))});
            } else {
                if (c.rowspan !== 2 || !c.rowspan) {
                    subIndx += c.colspan ? c.colspan : 0;
                }
                this.exportFields.push({id: c.id, export: true});
            }
        });
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

        let q = {...this.query, study: this.opencgaSession.study.fqn, sid: this.opencgaSession.token, limit: 10};
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
        const q = {...this.query, study: this.opencgaSession.study.fqn, limit: 10};
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
${this.resourceMap[this.config.resource]} = ${clientsName[this.config.resource]}(OpencgaR = con, endpointName = "${this.method}", params = list(${Object.entries(q).map(([k, v]) => `${k}='${v}'`).join(", ")}, include="id"))`;
        return this.lineSplitter(str);
    }

    generatePython() {
        const q = {...this.query, study: this.opencgaSession.study.fqn, limit: 10};
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
        const q = {...this.query, study: this.opencgaSession.study.fqn, limit: 10};
        const str = `
import {OpenCGAClient} from "./opencga-client.js";
const username = "${this.opencgaSession.user.id}";
const password = ""; // your password here
const client = new OpenCGAClient({
    host: "${this.opencgaSession.server.host}",
    version: "v2",
    cookies: {active: false}
});
(async () => {
    try {
        await client.login(username, password)
        const session = await client.createSession();
        const restResponse = await session.opencgaClient.${this.resourceMap[this.config.resource]}().${this.method}(${JSON.stringify(q)});
        console.log(restResponse.getResults());
    } catch (e) {
        console.error(e);
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
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                    message: `Job ${job.id} is now PENDING`,
                });
            } catch (e) {
                // console.error(e);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            }
        }
    }

    lineSplitter(multilineStr) {
        return multilineStr.split(/[\r\n]/g).filter(Boolean).map(line => html`<div class="code-line">${line}</div>`);
    }

    changeJobId(e) {
        this.jobId = e.target.value;
    }

    clipboard(e) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Code has been copied to Clipboard"
        });
    }

    changeMode(e) {
        e.preventDefault();
        this.mode = e.currentTarget.dataset.mode;
        this.requestUpdate();
    }

    changeFormat(e) {
        e.preventDefault();
        this.exportFieldsVisible = false;
        this.format = e.currentTarget.dataset.format;
        this.requestUpdate();
    }

    toggleExportField(e) {
        this.exportFieldsVisible = !this.exportFieldsVisible;
        this.requestUpdate();
    }

    /**
     * Update exportFields array which keeps track of the fields to include/exclude in TSV files.
     * @param {Object} e Event
     * @param {Number} index Index of the field to update
     * @param {Number} parentIndex Index of the parent of the field to update
     * @returns {undefined}
     */
    changeExportField(e, index, parentIndex) {
        const {checked} = e.currentTarget;
        if (parentIndex) {
            this.exportFields[parentIndex].children[index].export = checked;
        } else {
            this.exportFields[index].export = checked;
            // select all children when you click on a parent, and the other way around
            if (this.exportFields[index].children) {
                this.exportFields[index].children = this.exportFields[index].children.map(li => ({...li, export: checked}));
            }
        }
        this.exportFields = [...this.exportFields];
        /* this.dispatchEvent(new CustomEvent("changeExportField", {
            detail: this.exportFields
        })); */
        this.requestUpdate();
    }

    onDownloadClick() {
        this.dispatchEvent(new CustomEvent("export", {
            detail: {
                option: this.format,
                exportFields: this.exportFields
            }
        }));
    }

    render() {
        return html`
            <div>
                <ul class="nav nav-tabs">
                    ${~this.tabs.indexOf("download") ? html`<li class="active"><a data-toggle="tab" href="#${this._prefix}download">Download Table</a></li>` : nothing}
                    ${~this.tabs.indexOf("export") ? html`<li><a data-toggle="tab" href="#${this._prefix}export">Export Query</a></li>` : nothing}
                    ${~this.tabs.indexOf("link") ? html`<li><a data-toggle="tab" href="#link">Link</a></li>` : nothing}
                    ${~this.tabs.indexOf("code") ? html`<li><a data-toggle="tab" href="#code">Opencga Script Code</a></li>` : nothing}
                </ul>
            </div>

            <div class="tab-content">
                <div id="${this._prefix}download" class="tab-pane ${classMap({active: this.tabs[0] === "download"})}">
                    <form class="form-horizontal">
                        <div class="form-group" style="margin-top: 10px">
                            <div class="col-md-12">
                                <div class="alert alert-warning" style="margin-bottom: 10px">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>
                                        <span style="font-weight: bold">Note: </span>This option will
                                        <span style="font-weight: bold">automatically download</span>
                                        the table, note that only first <span style="font-weight: bold">1,000 records</span> are downloaded.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-12">
                                <h4 class="export-section-title">Select Output Format</h4>
                                <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "tab"})}" data-format="tab" @click="${this.changeFormat}">
                                    <i class="fas fa-table fa-2x"></i>
                                    <span class="export-buttons-text">TSV</span>
                                </button>
                                <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "json"})}" data-format="json" @click="${this.changeFormat}">
                                    <i class="fas fa-file-code fa-2x"></i>
                                    <span class="export-buttons-text">JSON</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            ${this.format === "tab" && this.exportFields?.length ? html`
                                <span data-toggle="collapse" class="export-fields-button collapsed" data-target="#exportFields">
                                    Customise export fields
                                </span>
                                <div id="exportFields" class="collapse">
                                    <ul>
                                        ${this.exportFields.map((li, i) => html`
                                        <li>
                                            <label><input type="checkbox" .checked=${li.export} @change="${e => this.changeExportField(e, i)}"> ${li.id} </label>
                                            ${li.children ? html`
                                                <ul>
                                                    ${li.children.map((s, y) => html`<li><label><input type="checkbox" @change="${e => this.changeExportField(e, y, i)}" .checked=${s.export}>  ${s.id}</label></li>`)}
                                                </ul>
                                            ` : ""}
                                        </li>
                                        `)}
                                    </ul>
                                </div>
                            ` : ""}
                        </div>
                    </form>

                    <div class="modal-footer" style="padding-top: 25px">
                        <button type="button" class="btn btn-default ripple" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary ripple" @click="${this.onDownloadClick}">
                            ${this.config?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                            <i class="fa fa-download icon-padding" aria-hidden="true"></i> Download
                        </button>
                    </div>
                </div>

                <div id="${this._prefix}export" class="tab-pane ${classMap({active: this.tabs[0] === "export"})}">
                    <form class="form-horizontal">
                        <div class="form-group" style="margin-top: 10px">
                            <div class="col-md-12">
                                <div class="alert alert-warning" style="margin-bottom: 10px">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>
                                        <span style="font-weight: bold">Note: </span>This option will launch an
                                        <span style="font-weight: bold">async job</span> in the server to export all records, note that no limit is applied.
                                        This might take few minutes depending on the data size and cluster load.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-12">
                                <h4 class="export-section-title">Select Output Format</h4>
                                <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "tab"})}" data-format="tab" @click="${this.changeFormat}">
                                    <i class="fas fa-table fa-2x"></i>
                                    <span class="export-buttons-text">${this.config.resource === "VARIANT" ? "VCF" : "CSV"}</span>
                                </button>
                                ${this.config.resource === "VARIANT" ? html`
                                    <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "vep"})}" data-format="vep" @click="${this.changeFormat}">
                                        <i class="fas fa-file-code fa-2x"></i>
                                        <span class="export-buttons-text">Ensembl VEP</span>
                                    </button>` : null
                                }
                                <button type="button" class="btn export-buttons ripple ${classMap({active: this.format === "json"})}" data-format="json" @click="${this.changeFormat}">
                                    <i class="fas fa-file-code fa-2x"></i>
                                    <span class="export-buttons-text">JSON</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-12">
                                <h4 class="export-section-title">Job Info</h4>
                                <label for="inputPassword" class="col-md-2 control-label">Job ID</label>
                                <div class="col-md-10">
                                    <input type="text" class="form-control" placeholder="Enter Job ID, leave empty for default."
                                           value="${this.config.resource?.toLowerCase()}_export_${UtilsNew.dateFormatter(new Date(), "YYYYMMDDhhmm")}" @input="${this.changeJobId}">
                                </div>
                            </div>
                        </div>
                    </form>

                    <div class="modal-footer" style="padding-top: 25px">
                        <button type="button" class="btn btn-default ripple" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary ripple" @click="${this.launchJob}">Launch job</button>
                    </div>
                </div>

                <div id="link" class="tab-pane ${classMap({active: this.tabs[0] === "link"})}">
                    <div class="btn-group btn-group-tab" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.link["url"]})}" @click="${this._changeTab}" data-view-id="link"
                                data-tab-id="url">URL
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.link["curl"]})}" @click="${this._changeTab}" data-view-id="link"
                                data-tab-id="curl">cURL
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.link["wget"]})}" @click="${this._changeTab}" data-view-id="link"
                                data-tab-id="wget">WGET
                        </button>
                    </div>

                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}url" class="content-tab active">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-url" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-url" contentEditable="true">
                                    ${this.generateCode("url")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}curl" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-curl" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-curl" contentEditable="true">
                                    ${this.generateCode("curl")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}wget" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-wget" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-wget" contentEditable="true">
                                    ${this.generateCode("wget")}
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-default ripple" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>


                <div id="code" class="tab-pane ${classMap({active: this.tabs[0] === "code"})}">
                    <div class="btn-group btn-group-tab" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["cli"]})}"
                                @click="${this._changeTab}" data-view-id="code" data-tab-id="cli">CLI
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["python"]})}"
                                @click="${this._changeTab}" data-view-id="code" data-tab-id="python">Python
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["r"]})}"
                                @click="${this._changeTab}" data-view-id="code" data-tab-id="r">R
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab.code["js"]})}"
                                @click="${this._changeTab}" data-view-id="code" data-tab-id="js">Javascript
                        </button>
                    </div>

                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}cli" class="content-tab active">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-r" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-cli" contentEditable="true">
                                    ${this.generateCode("cli")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}python" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-python" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-python" contentEditable="true">
                                    ${this.generateCode("python")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}r" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-r" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-r" contentEditable="true">
                                    ${this.generateCode("r")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}js" class="content-tab">
                            <div class="code-wrapper">
                                <div class="clipboard-button" data-clipboard-target="div.language-javascript" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-javascript" contentEditable="true">
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
