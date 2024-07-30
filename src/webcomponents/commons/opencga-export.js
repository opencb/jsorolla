/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
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
            endpoint: {
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

        this.limit = 10; // fixed limit

        this.resourceMap = {
            "VARIANT": "variants",
            "CLINICAL_VARIANT": "clinical",
            "FILE": "files",
            "SAMPLE": "samples",
            "INDIVIDUAL": "individuals",
            "COHORT": "cohorts",
            "FAMILY": "families",
            "CLINICAL_ANALYSIS": "clinical",
            "JOB": "jobs",
            "DISEASE_PANEL": "panels"
        };
        this.rClients = {
            "VARIANT": "variantClient",
            "CLINICAL_VARIANT": "variantClient",
            "FILE": "fileClient",
            "SAMPLE": "sampleClient",
            "INDIVIDUAL": "individualClient",
            "COHORT": "cohortClient",
            "FAMILY": "familyClient",
            "CLINICAL_ANALYSIS": "clinicalAnalysisClient",
            "JOB": "jobClient",
            "DISEASE_PANEL": "panelClient"
        };

        this.outputFileFormats = {
            "tab": "VCF",
            "vep": "ENSEMBL_VEP",
            "json": "JSON",
        };

        this.excludedVariantQueryFields = [
            // Fields not supported in variant export
            "count",
            "approximateCount",
            "approximateCountSamplingSize",
            "includeInterpretation",
            // Fields used for the pagination and does not apply on export
            "limit",
            "skip",
        ];

        this.mode = "sync";
        this.format = "tab";
        this.query = {};

        this.tabs = ["download", "export", "link", "code"]; // default tabs to show
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("query") || changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };

            if (this.config?.resource) {
                new ClipboardJS(".clipboard-button");
            }
            if (this.config.gridColumns) {
                this.buildExportFieldList();
            }
            if (this.config.exportTabs?.length > 0) {
                this.tabs = this.config.exportTabs;
            } else {
                if (this.config.resource === "VARIANT" || this.config.resource === "CLINICAL_VARIANT") {
                    this.tabs = ["download", "export", "link", "code"];
                } else {
                    this.tabs = ["download", "link", "code"];
                }
            }
            this.requestUpdate();
        }
    }

    /*
     * Build this.exportFields, which is a 1 or 2 dimensional array to keep track of the fields to include/exclude in TSV files.
     */
    buildExportFieldList() {
        // check if the column list has changed. If not, avoid rebuilding of exportFields. That would make lose the current state.
        // we can't use UtilsNew.objectCompare here as gridColumns in some browsers has circular structure.
        if (JSON.stringify(this.config.gridColumns.flatMap(c => Array.isArray(c) ? c.map(x => x.id) : c.id)) === this.currentGridColumns) {
            return;
        } else {
            this.currentGridColumns = JSON.stringify(this.config.gridColumns.flatMap(c => Array.isArray(c) ? c.map(x => x.id) : c.id));
        }

        let subIndx = 0; // offset in second row
        let firstRow;
        let secondRow = [];
        // check if 1D or 2D array
        if (Array.isArray(this.config.gridColumns) && Array.isArray(this.config.gridColumns[0])) {
            [firstRow, secondRow] = this.config.gridColumns;
        } else {
            firstRow = this.config.gridColumns;
        }

        this.exportFields = [];

        /* Building `exportFields` array. Each element has the form:
            - {String} id: id of the column
            - {Array} children: nested list elements
            - {Boolean} export: flag to keeps the state for the TSV export (false won't be included as column in the file)
            - {Boolean} excludeFromExport: flag to totally exclude the column from the list in this component and in the TSV (e.g. Action, checkboxes)
         */
        firstRow.filter(f => f?.visible !== false).forEach((c, i) => {
            if (c.rowspan !== 2 || !c.rowspan) {
                // add sub Level
                const subFields = secondRow.filter(f => f?.visible !== false).slice(subIndx, subIndx + c.colspan);
                subIndx += c.colspan ? c.colspan : 0;
                this.exportFields.push({id: c.id, export: true, children: subFields.map(s => ({id: s.id, export: true, excludeFromExport: s.excludeFromExport}))});
            } else {
                if (c.rowspan !== 2 || !c.rowspan) {
                    subIndx += c.colspan ? c.colspan : 0;
                }
                this.exportFields.push({id: c.id, export: true, excludeFromExport: c.excludeFromExport});
            }
        });
    }

    // ! Deprecated method dont use
    _changeTab(e) {
        const {viewId, tabId} = e.currentTarget.dataset;
        $(`#${viewId} > .content-pills`, this).removeClass("active");
        $(`#${viewId} > .content-tab-wrapper > .content-tab`, this).removeClass("active");
        $("#" + this._prefix + tabId, this).addClass("active");
        for (const tab in this.activeTab[viewId]) {
            if (Object.prototype.hasOwnProperty.call(this.activeTab[viewId], tab)) {
                this.activeTab[viewId][tab] = false;
            }
        }
        this.activeTab[viewId][tabId] = true;
        this.requestUpdate();

    }

    buildUrl(auth=true) {
        let url = this.opencgaSession.opencgaClient._config.host + "/webservices/rest" + this.endpoint.path + "?";
        if (auth) {
            url += "sid=" + this.opencgaSession.opencgaClient._config.token;
        }
        // Replace PATH params
        url = url.replace("{apiVersion}", this.opencgaSession.opencgaClient._config.version);
        this.endpoint.parameters
            .filter(parameter => parameter.param === "path")
            .forEach(parameter => {
                url = url.replace(`{${parameter.name}}`, this.query[parameter.name]);
            });

        // Add QUERY params
        this.endpoint.parameters
            .filter(parameter => parameter.param === "query" && this.query[parameter.name])
            .forEach(parameter => {
                url += `&${parameter.name}=${this.query[parameter.name]}`;
            });

        return url;

    }

    buildCurl() {
        return `curl -X GET --header "Accept: application/json" --header "Authorization: \
        Bearer ${this.opencgaSession.token}" "${this.buildUrl(false)}"`;
    }

    buildWget() {
        const currentDate = new Date();
        return `wget -O ${this.endpoint.path.split("/").at(-1)}_${currentDate.getTime()}.json "${this.buildUrl()}"`;
    }

    generateCode(language) {

        if (!this.config?.resource) {
            return "Resource not defined";
        }

        if (!this.opencgaSession?.study) {
            return "OpencgaSession not available";
        }

        let q = {...this.query, study: this.opencgaSession.study.fqn, sid: this.opencgaSession.token, limit: this.limit};

        if (this.config.resource === "FILE") {
            q = {...q, type: this.config.resource};
        }

        let ws = `${this.resourceMap[this.config.resource]}/${this.method}`;

        if (this.config.resource === "VARIANT") {
            this.method = "query";
            ws = "analysis/variant/query";
        } else if (this.config.resource === "CLINICAL_VARIANT") {
            this.method = "query_variant";
            ws = "analysis/clinical/variant/query";
        } else {
            this.method = "search";
        }
        // Temporal code for export in rest-api
        if (this.config?.resource === "API") {
            switch (language) {
                case "url":
                    return `${this.buildUrl()}`;
                case "curl":
                    return `${this.buildCurl()}`;
                case "wget":
                    return `${this.buildWget()}`;
                case "cli":
                    let client = this.resourceMap[this.config.resource];
                    let method = this.method;
                    if (this.config.resource === "CLINICAL_VARIANT") {
                        client = "clinical";
                        method = "variant-query";
                    }
                    const params = {...this.query};
                    params.token = params.sid;
                    delete params.body;
                    delete params.sid;
                    return `opencga.sh ${client} ${method} ${Object.entries(params).map(([k, v]) => `--${k} "${v}"`).join(" ")}`;
                case "js":
                    return this.generateJs();
                case "python":
                    return this.generatePython();
                case "r":
                    return this.generateR();
            }
        } else {
            switch (language) {
                case "url":
                    return `${this.opencgaSession.server.host}/webservices/rest/v2/${ws}?${UtilsNew.encodeObject(q)}`;
                case "curl":
                    return `curl -X GET --header "Accept: application/json" --header "Authorization: \
                Bearer ${this.opencgaSession.token}" "${this.opencgaSession.server.host}/webservices/rest/v2/${ws}?${UtilsNew.encodeObject({...this.query, study: this.opencgaSession.study.fqn})}"`;
                case "wget":
                    return `wget -O ${this.resourceMap[this.config.resource]}.txt "${this.opencgaSession.server.host}/webservices/rest/v2/${ws}?${UtilsNew.encodeObject(q)}"`;
                case "cli":
                // cli 2.1.1 doesn't support `sid` param (while Rest http requests don't support `token` in opencga 2.2.0-rc2)
                    let client = this.resourceMap[this.config.resource];
                    let method = this.method;
                    if (this.config.resource === "CLINICAL_VARIANT") {
                        client = "clinical";
                        method = "variant-query";
                    }
                    const params = {...q};
                    params.token = params.sid;
                    delete params.sid;
                    return `opencga.sh ${client} ${method} ${Object.entries(params).map(([k, v]) => `--${k} "${v}"`).join(" ")}`;
                case "js":
                    return this.generateJs();
                case "python":
                    return this.generatePython();
                case "r":
                    return this.generateR();
            }
        }
    }

    generateR() {
        const q = {...this.query, study: this.opencgaSession.study.fqn, limit: this.limit};
        const str = `library(opencgaR)
con <- initOpencgaR(host = "${this.opencgaSession.server.host}", version = "v2")
con <- opencgaLogin(opencga = con, userid = "", passwd = "")
${this.resourceMap[this.config.resource]} = \
${this.rClients[this.config.resource]}(OpencgaR = con, endpointName = "${this.toCamelCase(this.method)}", params = list(${Object.entries(q).map(([k, v]) => `${k}='${v}'`).join(", ")}, include="id"))`;
        return this.lineSplitter(str);
    }

    generatePython() {
        const q = {...this.query, study: this.opencgaSession.study.fqn, limit: this.limit};
        const str = `
from pyopencga.opencga_config import ClientConfiguration
from pyopencga.opencga_client import OpencgaClient

config = ClientConfiguration({"rest": {"host": "${this.opencgaSession.server.host}"}})
oc = OpencgaClient(config, token="${this.opencgaSession.token}")
${this.resourceMap[this.config.resource]} = oc.${this.resourceMap[this.config.resource]}.${this.method}(include='id', ${Object.entries(q).map(([k, v]) => `${k}='${v}'`).join(", ")})
print(${this.resourceMap[this.config.resource]}.get_responses())`;
        return this.lineSplitter(str);
    }

    generateJs() {
        const q = {...this.query, study: this.opencgaSession.study.fqn, limit: this.limit};
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
        const restResponse = await session.opencgaClient.${this.resourceMap[this.config.resource]}().${this.toCamelCase(this.method)}(${JSON.stringify(q)});
        console.log(restResponse.getResults());
    } catch (e) {
        console.error(e);
    }
})();`;
        return this.lineSplitter(str);
    }

    async launchJob() {
        if (this.config.resource === "VARIANT" || this.config.resource === "CLINICAL_VARIANT") {
            try {
                const data = {
                    ...this.query,
                    study: this.opencgaSession.study.fqn,
                    summary: true,
                    outputFileName: "variants",
                    outputFileFormat: this.outputFileFormats[this.format],
                };

                // Exclude keys from the query object that are not supported in export endpoint
                this.excludedVariantQueryFields.forEach(key => {
                    delete data[key];
                });

                const params = {
                    study: this.opencgaSession.study.fqn,
                };
                if (this.jobId) {
                    params["jobId"] = this.jobId;
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
     * Convert a string in snake_case into camelCase
     * @param {String} str input in snake_case
     * @returns {String} output in camelCase
     */
    toCamelCase(str) {
        return str.toLowerCase().replace(/([-_][a-z])/g, group =>
            group
                .toUpperCase()
                .replace("-", "")
                .replace("_", "")
        );
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
                exportFields: this.exportFields,
                exportLimit: this._config.exportLimit
            }
        }));
    }

    render() {
        // TODO: Refactor this code
        return html`
            <ul class="nav nav-tabs mb-3" role="tablist">
                ${~this.tabs.indexOf("download") ? html`
                    <li class="nav-item" role="presentation">
                        <a class="nav-link active" data-bs-toggle="tab" role="tab" href="#${this._prefix}download">Download Table</a>
                    </li>` : nothing
                }
                ${~this.tabs.indexOf("export") ? html`
                    <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" role="tab" href="#${this._prefix}export">Export Query</a>
                    </li>` : nothing
                }
                ${~this.tabs.indexOf("link") ? html`
                    <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" role="tab" href="#link">Link</a>
                    </li>` : nothing
                }
                ${~this.tabs.indexOf("code") ? html`
                    <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" role="tab" href="#code">Opencga Script Code</a>
                    </li>` : nothing
                }
            </ul>

            <div class="tab-content">
                <div id="${this._prefix}download" class="tab-pane ${classMap({active: this.tabs[0] === "download"})}">
                    <!-- TODO: is it really necessary use form? -->
                    <form>
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <b>Note:</b>
                            ${UtilsNew.renderHTML(this._config.exportNote.replace("%limit%", this._config.exportLimit))}
                        </div>

                        <div class="col-md-12 mb-3">
                            <h4>Select Output Format</h4>
                            <button type="button" class="btn btn-light px-5 py-4 ${classMap({active: this.format === "tab"})}" data-bs-toggle="button" data-format="tab" @click="${this.changeFormat}">
                                <i class="fas fa-table fa-2x"></i>
                                <div>TSV</div>
                            </button>
                            <button type="button" class="btn btn-light px-5 py-4 ${classMap({active: this.format === "json"})}" data-bs-toggle="button" data-format="json" @click="${this.changeFormat}">
                                <i class="fas fa-file-code fa-2x"></i>
                                <div>JSON</div>
                            </button>
                        </div>

                            ${this.format === "tab" && this.exportFields?.length ? html`
                                <div>
                                    <span data-bs-toggle="collapse" class="export-fields-button collapsed" data-bs-target="#${this._prefix}exportFields">
                                        Customise export fields
                                    </span>
                                    <div id="${this._prefix}exportFields" class="collapse">
                                        <ul>
                                            ${this.exportFields.filter(li => !li.excludeFromExport).map((li, i) => html`
                                            <li>
                                                <label>
                                                    <input type="checkbox" .checked=${li.export} @change="${e => this.changeExportField(e, i)}"> ${li.id}
                                                </label>
                                                ${li.children ? html`
                                                    <ul>
                                                        ${li.children.filter(li => !li.excludeFromExport).map((s, y) => html`
                                                            <li>
                                                                <label>
                                                                    <input type="checkbox" @change="${e => this.changeExportField(e, y, i)}" .checked=${s.export}>  ${s.id}
                                                                </label>
                                                            </li>
                                                        `)}
                                                    </ul>
                                                ` : ""}
                                            </li>
                                            `)}
                                        </ul>
                                    </div>
                                </div>` : nothing}
                        </form>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="${this.onDownloadClick}">
                            ${this.config?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                            <i class="fa fa-download" aria-hidden="true"></i> Download
                        </button>
                    </div>
                </div>

                <div id="${this._prefix}export" class="tab-pane ${classMap({active: this.tabs[0] === "export"})}">
                    <form>
                        <div class="row g-1 mb-3">
                            <div class="col-md-12">
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                        <b>Note:</b>This option will launch an
                                        <b>async job</b> in the server to export all records, note that no limit is applied.
                                        This might take few minutes depending on the data size and cluster load.
                                </div>
                            </div>

                            <div class="col-md-12">
                                <h4>Select Output Format</h4>
                                <button class="btn btn-light px-5 py-4 ${classMap({active: this.format === "tab"})}" type="button" data-format="tab" @click="${this.changeFormat}">
                                    <i class="fas fa-table fa-2x"></i>
                                    <div>
                                        ${(this.config.resource === "VARIANT" || this.config.resource === "CLINICAL_VARIANT") ? "VCF" : "CSV"}
                                    </div>
                                </button>
                                ${(this.config.resource === "VARIANT" || this.config.resource === "CLINICAL_VARIANT") ? html`
                                    <button class="btn btn-light px-5 py-4 ${classMap({active: this.format === "vep"})}" type="button" data-format="vep" @click="${this.changeFormat}">
                                        <i class="fas fa-file-code fa-2x"></i>
                                        <div>Ensembl VEP</div>
                                    </button>
                                ` : null}
                                <button class="btn btn-light px-5 py-4 ${classMap({active: this.format === "json"})}" type="button" data-format="json" @click="${this.changeFormat}">
                                    <i class="fas fa-file-code fa-2x"></i>
                                    <div>JSON</div>
                                </button>
                            </div>

                            <div class="col-md-12">
                                <h4>Job Info</h4>
                                <label class="col-md-2 form-label">
                                    Job ID
                                </label>
                                <div class="col-md-10">
                                    <input type="text" class="form-control" placeholder="Enter Job ID, leave empty for default."
                                            value="${this.config.resource?.toLowerCase()}_export_${UtilsNew.dateFormatter(new Date(), "YYYYMMDDhhmm")}" @input="${this.changeJobId}">
                                </div>
                            </div>
                        </div>
                    </form>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="${this.launchJob}">Launch job</button>
                    </div>
                </div>

                <div id="link" class="tab-pane ${classMap({active: this.tabs[0] === "link"})}">
                    <ul class="nav nav-pills mb-3" role="tablist" aria-label="group">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.link["url"]})}"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}url" data-view-id="link"
                                    type="button" data-tab-id="url">URL
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.link["curl"]})}" type="button"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}curl" data-view-id="link"
                                    data-tab-id="curl">cURL
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.link["wget"]})}" type="button"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}wget" data-view-id="link"
                                    data-tab-id="wget">WGET
                            </button>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <div id="${this._prefix}url" class="tab-pane active" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-url" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                    <div class="code language-url" contentEditable="true">
                                        ${this.generateCode("url")}
                                    </div>
                            </div>
                        </div>
                        <div id="${this._prefix}curl" class="tab-pane" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-curl" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-curl" contentEditable="true">
                                    ${this.generateCode("curl")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}wget" class="tab-pane" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-wget" @click="${this.clipboard}"><i class="far fa-copy"></i></div>
                                <div class="code language-wget" contentEditable="true">
                                    ${this.generateCode("wget")}
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>


                <div id="code" class="tab-pane ${classMap({active: this.tabs[0] === "code"})}">
                    <ul class="nav nav-pills mb-3" role="tablist" aria-label="group">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.code["cli"]})}"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}cli" data-view-id="code"
                                    type="button" data-tab-id="cli">CLI
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.code["python"]})}"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}python" data-view-id="code"
                                    type="button" data-tab-id="python">Python
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.code["r"]})}"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}r" data-view-id="code"
                                    type="button" data-tab-id="r">R
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${classMap({active: this.activeTab.code["js"]})}"
                                    data-bs-toggle="pill" data-bs-target="#${this._prefix}js" data-view-id="code"
                                    type="button" data-tab-id="js">Javascript
                            </button>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <div id="${this._prefix}cli" class="tab-pane active" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-cli" @click="${this.clipboard}">
                                    <i class="far fa-copy"></i>
                                </div>
                                <div class="code language-cli" contentEditable="true">
                                    ${this.generateCode("cli")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}python" class="tab-pane" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-python" @click="${this.clipboard}">
                                    <i class="far fa-copy"></i>
                                </div>
                                <div class="code language-python" contentEditable="true">
                                    ${this.generateCode("python")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}r" class="tab-pane" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-r" @click="${this.clipboard}">
                                    <i class="far fa-copy"></i>
                                </div>
                                <div class="code language-r" contentEditable="true">
                                    ${this.generateCode("r")}
                                </div>
                            </div>
                        </div>
                        <div id="${this._prefix}js" class="tab-pane" role="tabpanel">
                            <div class="code-wrapper rounded p-2">
                                <div class="d-flex justify-content-end" data-clipboard-target="div.language-javascript" @click="${this.clipboard}">
                                    <i class="far fa-copy"></i>
                                </div>
                                <div class="code language-javascript" contentEditable="true">
                                    ${this.generateCode("js")}
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            exportNote: [
                "This option will <b>automatically download</b> the table, note that only first <b>%limit% records</b> will be downloaded.",
                "(If you need all records, please use 'Export Query')",
            ].join("\n"),
            exportLimit: 1000,
        };
    }

}

customElements.define("opencga-export", OpencgaExport);
