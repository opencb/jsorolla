/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "./opencga-analysis-tool-form-field.js";


export default class OpencgaAnalysisToolForm extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oatf-" + UtilsNew.randomString(6);

        // OpenCGA Analysis use 2 different set of parameters: 'data' and 'params':
        //  - data: contains the specific params for the analysis
        //  - params: contains study, jobId, jobTags and jobDescription
        this.data = {};
        this.params = {};
    }

    connectedCallback() {
        super.connectedCallback();

        // deep copy
        // this._config = $.extend( true, {}, this.config);

        // This should be executed on change of each field (or better just on actuator param change)
        if (this.config.sections && this.config.sections.length) {
            this.config.sections.forEach(section => {
                if (section.parameters && section.parameters.length) {
                    section.parameters.forEach(param => {
                        param.value = param.defaultValue; // TODO change defaultValue to value in config?
                        if (param.dependsOn) {
                            // since we use this.config as unique source of truth we can imagine to change any other prop here (like allowedValues)
                            param.disabled = !this.checkDependency(param.dependsOn);
                        } else {
                            param.disabled = param.disabled ?? false;
                        }
                    });
                }
            });
        }
        // Init the default jobId, if $DATE exist in the default ID then is replaced by YYYYMMDDhhmmss
        this.jobId = this.config.job.id ? this.config.job.id.replace("$DATE", UtilsNew.getDatetime()) : "none";
        this.params["jobId"] = this.jobId;

    }

    firstUpdated(_changedProperties) {
        $(`#${this._prefix}analysis-form`).validator().on("submit", e => {
            if (e.isDefaultPrevented()) {
                // handle the invalid form...
            } else {
                // everything looks good!
                const params = this.config.sections.reduce((acc, curr) => [...acc, ...curr.parameters], []);
                console.log(params);
            }
        });
        UtilsNew.initTooltip(this);

    }

    async updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.params.study = this.opencgaSession.study.fqn;
            this.runnable = OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "EXECUTE_JOBS");
            this.requestUpdate();
            await this.updateComplete;
            // await this.updateComplete;
            UtilsNew.initTooltip(this);
        }
    }

    checkDependency(dependsOn) {
        if (typeof dependsOn === "string") {
            const [actuatorId, operator, value] = dependsOn.split(/  *(!*==?|===?)  */); // draft
            const actuator = this.findParam(this.config, actuatorId);
            return this._operatorExec(actuator.value, value, operator);
        } else {
            if (typeof dependsOn === "function") {
                return dependsOn(this.config);
            } else {
                console.error("Rule not found. Stop messing up with the configuration please.");
            }
        }
    }

    _operatorExec(a, b, operator) {
        switch (operator) {
            case "==":
            case "===":
                return a === b;
            case "!=":
            case "!==":
                return a !== b;
            default:
                throw new Error("Operator not found");
        }
    }

    findParam(config, paramId) {
        for (const section of config.sections) {
            if (section.parameters && section.parameters.length) {
                for (const param of section.parameters) {
                    if (param.id === paramId) {
                        return param;
                    }
                }
            }
        }
        console.error(paramId, "not found");
        return null;
    }

    onFieldChange(e) {
        if (e.detail.value) {
            // This fills 'data' which contains the specific params for the analysis.
            this.data[e.detail.param] = e.detail.value.split(",");

            const {param: paramId, value: value} = e.detail;
            const param = this.findParam(this.config, paramId);
            param.value = value;

            if (this.config.sections && this.config.sections.length) {
                this.config.sections.forEach(section => {
                    if (section.parameters && section.parameters.length) {
                        section.parameters.forEach(param => {
                            if (param.dependsOn) {
                                param.disabled = !this.checkDependency(param.dependsOn);
                            }
                        });
                    }
                });
            }
        } else {
            delete this.data[e.detail.param];
        }
        this.config.sections = $.extend(true, [], this.config.sections); // god save the queen
        this.requestUpdate();
    }

    // This function fills job 'params' which contains study, jobId, jobTags and jobDescription. This is common for all OpenCGA Analysis.
    onJobFieldChange(param, value) {
        if (value) {
            this.params[param] = value;
        } else {
            delete this.params[param];
        }
    }

    onRun() {
        this.dispatchEvent(new CustomEvent("analysisRun", {
            detail: {
                data: this.data,
                params: this.params
            },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        // Check Analysis tool configuration
        if (!this.config.sections || this.config.sections.length === 0 || !this.config.job) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-exclamation fa-5x"></i>
                    <h3>No valid Analysis form configuration provided. Please check form configuration:</h3>
                    <div style="padding: 10px">
                        <pre>${JSON.stringify(this.config, null, 2)}</pre>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="panel-group">
                <!--
                    <pre style="font-size: 10px;height: 25vh;">
                        \${JSON.stringify(this.config.sections, null, "\t")}
                    </pre>
                -->
                <form id="${this._prefix}analysis-form" data-toggle="validator" data-feedback='{"success": "fa-check", "error": "fa-times"}' role="form">
                    ${this.config.sections.map((section, i) => html`
                         <div class="panel panel-default shadow-sm">
                             <div class="panel-body" role="tab" id="${this._prefix}Heading${i}">
                                 <h4 class="panel-title">
                                     <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                        href="#${this._prefix}section-${i}" aria-expanded="true" aria-controls="${this._prefix}-${i}">
                                        ${section.title}
                                     </a>
                                 </h4>
                             </div>
                             <div id="${this._prefix}section-${i}" class="panel-collapse ${!section.collapsed ? "in" : ""}" role="tabpanel" aria-labelledby="${this._prefix}${i}Heading">
                                 <div class="panel-body">
                                     <div class="row">
                                         ${section.parameters && section.parameters.length ? section.parameters.map(param => html`
                                             <opencga-analysis-tool-form-field
                                                .opencgaSession="${this.opencgaSession}"
                                                .cellbaseClient=${this.cellbaseClient}
                                                .config="${param}" @fieldChange="${this.onFieldChange}">
                                            </opencga-analysis-tool-form-field>
                                         `) : null }
                                     </div>
                                 </div>
                            </div>
                        </div>
                    `)}

                    <!-- Job Info section -->
                    ${(this.config.job.visible ?? true) ? html`
                        <div class="panel panel-default shadow-sm">
                            <div class="panel-body" role="tab" id="${this._prefix}HeadingJob">
                                <h4 class="panel-title">
                                    <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                            href="#${this._prefix}section-job" aria-expanded="true">
                                        ${this.config.job.title}
                                    </a>
                                </h4>
                            </div>
                            <div id="${this._prefix}section-job" class="panel-collapse" role="tabpanel">
                                <div class="panel-body">
                                    <div class="row">
                                        <div style="padding: 4px 20px; width: 480px">
                                            <label>Job ID</label>
                                            <text-field-filter placeholder="job ID" .value="${this.jobId}" @filterChange="${e => this.onJobFieldChange("jobId", e.detail.value)}"></text-field-filter>
                                        </div>
                                        <div style="padding: 4px 20px; width: 480px">
                                            <label>Job tags</label>
                                            <text-field-filter placeholder="Comma-separated tags, eg. variant, stats, ... " .value="" @filterChange="${e => this.onJobFieldChange("jobTags", e.detail.value)}"></text-field-filter>
                                        </div>
                                        <div style="padding: 4px 20px; width: 480px">
                                            <label>Job Description</label>
                                            <text-field-filter placeholder="job description" .value="" @filterChange="${e => this.onJobFieldChange("jobDescription", e.detail.value)}"></text-field-filter>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : null}
                    <div class="pull-right button-wrapper">
                        ${this.runnable ?
                            html`
                                <button type="button" class="ripple btn btn-primary btn-lg" @click="${this.onRun}">Run</button>` :
                            html`
                                <a tooltip-title="Permission denied" tooltip-text="EXECUTE_JOB permission not available">
                                    <i class="fas fa-exclamation-circle text-danger"></i>
                                </a>
                                <button type="button" class="ripple btn btn-primary btn-lg disabled"> Run </button>`
                        }
                    </div>
                </form>
           </div>
           <div class="v-space"></div>
        `;
    }

}

customElements.define("opencga-analysis-tool-form", OpencgaAnalysisToolForm);
