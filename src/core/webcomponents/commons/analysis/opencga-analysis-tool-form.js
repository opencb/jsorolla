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

// import {LitElement, html} from "/test/lit-element.js";
// import {Utils} from "./../../../utils.js"; //this cannot be a plain script and a module at the same time

import {LitElement, html} from "/web_modules/lit-element.js";
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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oatf-";
        this._config = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // deep copy
        this._config = $.extend( true, {}, this.config);

        // this should be executed on change of each field (or better just on actuator param change)
        if (this._config.sections && this._config.sections.length) {
            this._config.sections.forEach( section => {
                if (section.parameters && section.parameters.length) {
                    section.parameters.forEach(param => {
                        param.value = param.defaultValue; // TODO change defaultValue to value in config?
                        if (param.dependsOn) {
                            // since we use this._config as unique source of truth we can imagine to change any other prop here (like allowedValues)
                            param.disabled = !this.checkDependency(param.dependsOn);
                        } else {
                            param.disabled = false;
                        }
                    });
                }
            });
        }
    }

    updated(changedProperties) {

    }

    checkDependency(dependsOn) {
        if (typeof dependsOn === "string") {
            const [actuatorId, operator, value] = dependsOn.split(/  *(!*==?|===?)  */); // draft
            const actuator = this.findParam(this._config, actuatorId);
            return this._operatorExec(actuator.value, value, operator);
        } else if (typeof dependsOn === "function") {
            return dependsOn(this._config);
        } else {
            console.error("Rule not found. Stop messing up with the configuration please.");
        }
    }

    _operatorExec(a, b, operator) {
        if (operator === "==" || operator === "===") {
            return a === b;
        } else if (operator === "!=" || operator === "!==") {
            return a !== b;
        } else {
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

    // DOM manipulation version
    /*    checkDependency2(parent, field) {
        console.log("parent, field", parent, field);
        console.log("dependsOn", field.dependsOn);
        if (field.dependsOn) {
            const [fieldId, value] = field.dependsOn.split(/  *===?  *!/); // draft
            console.log(fieldId, value);
            if (!fieldId || !value) {
                console.error("dependsOn parse failed");
            } else {
                console.log("selector", parent.querySelector("#" + fieldId));

                if (parent.querySelector("#" + fieldId).value === value) {
                    console.log("value OK", parent.querySelector("#" + fieldId).value);
                }
                this.visible = parent.querySelector("#" + fieldId).value === value;
            }
        }
        this.requestUpdate();

    }*/

    // this method is in charge of update this._config with new value of "actuator" and update "target" visible prop
    onFieldChange(e) {
        console.log(e.detail);
        if (e.detail) {
            const [paramId, value] = Object.entries(e.detail)[0];
            const param = this.findParam(this._config, paramId);
            param.value = value;

            if (this._config.sections && this._config.sections.length) {
                this._config.sections.forEach(section => {
                    if (section.parameters && section.parameters.length) {
                        section.parameters.forEach(param => {
                            if (param.dependsOn) {
                                param.disabled = !this.checkDependency(param.dependsOn);
                            }
                        });
                    }
                });
            }
            this._config.sections = $.extend( true, [], this._config.sections); // god save the queen
            this.requestUpdate();
        }
    }

    onRun() {
        $('#analysis-form').validator().on('submit', e => {
            if (e.isDefaultPrevented()) {
                // handle the invalid form...
            } else {
                // everything looks good!

                const params = this._config.sections.reduce( (acc, curr) => [...acc, ...curr.parameters], []);
                console.log(params)


            }
        })

    }

    render() {
        return html`
            <div class="panel-group">
            <!--<pre style="font-size: 10px;height: 25vh;">
            ${JSON.stringify(this._config.sections, null, "\t")}
            </pre> -->
                <form id="analysis-form" data-toggle="validator" data-feedback='{"success": "fa-check", "error": "fa-times"}' role="form">
                ${this._config.sections && this._config.sections.length ? this._config.sections.map( (section, i) => html`
                     <div class="panel panel-default filter-section shadow-sm">
                         <div class="panel-heading" role="tab" id="${this._prefix}Heading${i}">
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
                                    ${section.parameters && section.parameters.length ? section.parameters.map( param => html`
                                        <opencga-analysis-tool-form-field .opencgaSession="${this.opencgaSession}" .config="${param}" @fieldChange="${this.onFieldChange}"> </opencga-analysis-tool-form-field>
                                    `) : null }
                             </div>
                             </div>
                        </div>
                    </div>
                `) : null }
                <button type="submit" class="ripple btn btn-primary btn-lg" @click="${this.onRun}">Run</button>
                </form>
           </div>
        `;
    }

}

customElements.define("opencga-analysis-tool-form", OpencgaAnalysisToolForm);
