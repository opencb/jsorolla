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

import {LitElement, html} from "lit";
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../../../core/utils-new.js";
import "./../../../commons/forms/select-field-filter.js";

export default class OpencgaAnnotationFilterModal extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
            resource: {
                type: String
            },
            selectedVariablesText: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oafm-" + UtilsNew.randomString(6) + "_";
        this.selectedVariables = {};
        this.selectedVariablesText = "";
        this.variableMap = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("selectedVariablesText")) {
            this.selectedVariablesTextObserver();
        }
    }

    /**
     * It builds this.selectedVariables from the serialized string this.selectedVariablesText
     */
    async selectedVariablesTextObserver() {
        this.selectedVariables = {};
        if (this.selectedVariablesText) {
            const variables = this.selectedVariablesText.split(";");
            this.requestUpdate();
            await this.updateComplete;
            for (const v of variables) {
                const [, variableSetId, variableId, operator, value] = [...v.matchAll(/(\w+):(\w+\.?\w+)(<=?|>=?|=)(\w+)/g)][0];
                this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: {operator, value}};
            }

        }
        this.selectedVariables = {...this.selectedVariables};
        this.requestUpdate();

    }

    /**
     * It serializes this.selectedVariables in a single string and fire the event
     */
    // fire in case of selectedVariables change
    selectedVariablesSerializer() {
        const selected = [];
        for (const [variableSetId, variables] of Object.entries(this.selectedVariables)) {
            // value is not defined iff an operator (<=, >=, ...) has been selected before setting the value. In that case we filter out that entry.
            const singleVariableSetvariables = Object.entries(variables)
                .filter(([, {value}]) => Boolean(value))
                .map(([variableId, {operator, value}]) => `${variableSetId}:${variableId}${operator}${value}`)
                .join(";");
            selected.push(singleVariableSetvariables);
        }
        const event = new CustomEvent("annotationChange", {
            detail: {
                value: selected.join(";")
            }
        });
        this.dispatchEvent(event);
    }

    opencgaSessionObserver() {

        this.variableSets = [];

        /* if (typeof this.opencgaSession.study === "undefined") {
            this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
            return;
        }*/

        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
        } else {
            const _this = this;

            this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
                .then(response => {
                    this._updateVariableSets(response.getResult(0));
                })
                .catch(function () {
                    // this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
                    console.error("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
                });
        }

    }

    async _updateVariableSets(study) {
        const sort = ["TEXT", "STRING", "NUMERIC", "INTEGER", "DOUBLE", "CATEGORICAL", "BOOLEAN", "OBJECT", "MAP_STRING", "MAP_DOUBLE", "MAP_INTEGER"];
        if (typeof study.variableSets === "undefined") {
            this.variableSets = [];
        } else {
            const _variableSets = [];
            for (const variableSet of study.variableSets) {
                if (UtilsNew.isEmpty(this.resource) || variableSet.entities.includes(this.resource)) {
                    variableSet.variables.sort((a, b) => {
                        return sort.indexOf(a.type) - sort.indexOf(b.type);
                    });
                    _variableSets.push({
                        name: variableSet.name || variableSet.id,
                        ...variableSet
                    });
                }
            }
            this.variableSets = _variableSets;
        }
        this.requestUpdate();
    }

    changeOperator(e) {
        const {variableId, variableSetId} = e.target.dataset;
        const operator = e.target.value;
        // TODO remove this line and use the this.selectedVariables[variableSetId][variableId].operator in addNumericFilter
        $(`.annotation-modal input[type=text][data-variable-id="${variableId}"][data-variable-set-id="${variableSetId}"]`).attr("data-operator", e.target.value);
        if (this.selectedVariables[variableSetId]?.[variableId]) {
            this.selectedVariables[variableSetId][variableId] = {...this.selectedVariables[variableSetId][variableId], operator};
        } else {
            // the value hasn't been set yet
            this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: {operator}};
        }
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();

    }

    addNumericFilter(e) {
        const {variableId, variableSetId, operator = ""} = e.target.dataset; // numericOperator is defined only for INTEGER and DOUBLE types

        const value = e.target.value.trim();
        if (value) {
            /* if (this.selectedVariables[variableSetId][variableId].operator) {
               // TODO continue
            }*/
            this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: {value, operator}};
        } else {
            delete this.selectedVariables[variableSetId][variableId];
        }
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    addInputFilter(e) {
        const {variableId, variableSetId} = e.target.dataset;

        const value = e.target.value.trim();
        if (value) {
            this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: {value, operator: "="}};
        } else {
            delete this.selectedVariables[variableSetId][variableId];
        }
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    addBooleanFilter(e) {
        const {variableId, variableSetId, value} = e.target.dataset;
        console.log(variableId, variableSetId, value);
        this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: {value, operator: "="}};
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    changeMap(variableSetId, variableId, key) {
        console.log(variableSetId, variableId, key);
        if (key) {
            this.variableMap[variableSetId] = {
                ...this.variableMap[variableSetId],
                [variableId]: key.split(",")
            };
        } else {
            delete this.variableMap[variableSetId][variableId];
        }
        this.variableMap = {...this.variableMap};
        this.requestUpdate();
    }

    renderVariable(variable, variableSet) {
        // console.log("going to render", variable, "of", variableSet.id)
        let content = "";
        switch (variable.type) {
            case "OBJECT":
                content = html`
                    ${variable?.variableSet?.length ? html`
                            <div class="col-md-12">
                                <label class="form-label fw-bold">
                                    ${variable.id}
                                </label>
                                ${variable.variableSet.map(v => this.renderVariable(v, variableSet))}
                            </div>
                        ` : html`
                            <div class="col-md-3">
                                <label class="form-label fw-bold" for="${variable.id}Textarea">
                                    <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                        <i class="fa fa-info-circle" aria-hidden="true"></i>
                                    </a> ${variable.id}
                                </label>
                                <textarea class="form-control" id="${variable.id}Textarea" rows="1"
                                    data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                                    @input="${this.addInputFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}">
                                </textarea>
                            </div>
                        `}
                    </div>`;
                break;
            case "MAP_STRING":
                // copy of MAP_INTEGER without operator select
                content = html`
                    <!--<pre> \${JSON.stringify(variable)}</pre>-->
                    ${variable?.allowedKeys?.length ? html`
                        <div class="col-md-12">
                            <label class="form-label fw-bold">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <select-field-filter
                                .data="${variable?.allowedKeys}"
                                .value="${this.variableMap?.[variableSet.id]?.[variable.id] ?? []}"
                                .config="${{
                                    multiple: true,
                                    liveSearch: false
                                }}"
                                @filterChange="${e => this.changeMap(variableSet.id, variable.id, e.detail.value)}">
                            </select-field-filter>
                            <!-- form-inline -->
                            <div class="row row-cols-lg-auto g-1 align-items-center">
                                ${this.variableMap?.[variableSet.id]?.[variable.id]?.map(key => {
                                    return html`
                                        <div class="col-md-3">
                                            <label class="form-label fw-bold" for="${variable.id}Input">${key}</label>
                                            <input class="form-control" type="text" placeholder="${key}" id="${variable.id}Input"
                                                data-variable-id="${variable.id + "." + key}"
                                                data-variable-set-id="${variableSet.id}"
                                                @input="${this.addInputFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                                        </div>
                                        `;
                                })
                                }
                            </div>
                        </div>
                    ` : html`
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="${variable.id}Input">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <input class="form-control" type="text" id="${variable.id}Input" placeholder="${variable.id}"
                                data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                                pattern="${variable?.attributes?.pattern ?? null}"
                                aria-describedby="basic-addon1" @input="${this.addInputFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                        </div>`}
                    `;
                break;
            case "MAP_DOUBLE":
            case "MAP_INTEGER":
                content = html`
                    <!--<pre> \${JSON.stringify(variable)}</pre>-->
                    ${variable?.allowedKeys?.length ? html`
                        <div class="col-md-12">
                            <label class="form-label fw-bold">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <select-field-filter
                                .data="${variable?.allowedKeys}"
                                .value=${this.variableMap?.[variableSet.id]?.[variable.id] ?? []}
                                .config="${{
                                    multiple: true,
                                    liveSearch: false
                                }}"
                                @filterChange="${e => this.changeMap(variableSet.id, variable.id, e.detail.value)}">
                            </select-field-filter>
                            <div class="row">
                                ${this.variableMap?.[variableSet.id]?.[variable.id]?.map(key => {
                                    return html`
                                        <div class="col-md-3">
                                            <label class="form-label fw-bold"  for="${variable.id}Input">
                                                ${key}
                                            </label>
                                            <div class="row row-cols-lg-auto g-1 align-items-center">
                                                <div class="col-6">
                                                    <select class="form-select form-select-sm"  id="${variable.id}Input"
                                                        data-variable-id="${variable.id + "." + key}" data-variable-set-id="${variableSet.id}"
                                                        @change="${this.changeOperator}">
                                                            <option value="=">=</option>
                                                            <option value="<">&lt;</option>
                                                            <option value="<=">&le;</option>
                                                            <option value=">" selected>&gt;</option>
                                                            <option value=">=">&ge;</option>
                                                    </select>
                                                </div>
                                                <div class="col-6">
                                                    <input type="text" class="form-control" placeholder="${key}"
                                                    data-variable-id="${variable.id + "." + key}" data-variable-set-id="${variableSet.id}" data-operator=">"
                                                    @input="${this.addNumericFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                                                </div>
                                            </div>
                                        </div>
                                        `;
                                    })
                                }
                            </div>
                        </div>
                    ` : html`
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="${variable.id}Input">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <input class="form-control" type="text" id="${variable.id}Input"
                                placeholder="${variable.id}" data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                                pattern="${variable?.attributes?.pattern ?? null}" aria-describedby="basic-addon1" @input="${this.addInputFilter}"
                                .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                        </div>`}


                    `;
                break;
            case "TEXT":
            case "STRING":
                content = html`
                    <div class="col-md-3">
                        <label class="form-label fw-bold" for="${variable.id}Input">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <input type="text" class="form-control" id="${variable.id}Input"
                            placeholder="${variable.id}" data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                            pattern="${variable?.attributes?.pattern ?? null}" aria-describedby="basic-addon1" @input="${this.addInputFilter}"
                            .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                    </div>`;
                break;
            case "NUMERIC":
            case "INTEGER":
            case "DOUBLE":
                content = html`
                    <div class="col-md-3">
                        <label class="form-label fw-bold" for="${variable.id}Select ${variable.id}Input">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <div class="row row-cols-lg-auto g-1 align-items-center">
                            <div class="col-6">
                                <select class="form-select" id="${variable.id}Select" data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}" @change="${this.changeOperator}">
                                    <option value="=">=</option>
                                    <option value="<">&lt;</option>
                                    <option value="<=">&le;</option>
                                    <option value=">" selected>&gt;</option>
                                    <option value=">=">&ge;</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <input type="text" class="form-control" id="${variable.id}Input" placeholder="${variable.id}" pattern="${variable?.attributes?.pattern ?? null}"
                                    data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}" data-operator=">"
                                    @input="${this.addNumericFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                            </div>
                        </div>
                    </div>`;
                break;
            case "CATEGORICAL":
                content = html`
                    <select class="selectpicker ${variable.id} form-select" id="${this._prefix}-categorical-selector"  multiple @change="${this.addCategoricalFilter}" data-variable-set-id="${variableSet.id}" data-width="100%">
                        ${variable.allowedValues && variable.allowedValues.length && variable.allowedValues.map(item => html`<option value="${item}">${item}</option>`)}
                    </select>`;
                break;
            case "BOOLEAN":
                content = html`
                        <!-- form-check form-check-inline col-md-3 -->
                    <div class="row row-cols-lg-auto g-1 align-items-center">
                        <label class="form-check-label fw-bold" for="${this._prefix}${variable.id}yes ${this._prefix}${variable.id}no">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <div class="form-control">
                            <input class="form-check-input" data-variable-id="${variable.id}" id="${this._prefix}${variable.id}yes"
                                data-variable-set-id="${variableSet.id}" type="radio" name="${variable.id}Options" data-value="True"
                                .checked="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value === "true"}" @input="${this.addBooleanFilter}">
                            True
                            <input class="form-check-input" id="${this._prefix}${variable.id}no"
                            data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                            type="radio" name="${variable.id}Options" data-value="False" .checked="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value === "false"}" @input="${this.addBooleanFilter}">
                            False
                        </div>
                    </div>`;
                break;
            default:
                throw new Error("Type not recognized " + variable.type + "(" + variable.id + ")");
        }
        return html`${content}`;
    }

    filterChange() {

    }

    showModal() {
        const annotationModal = new bootstrap.Modal(`#${this._prefix}annotation-modal`);
        annotationModal.show();
        UtilsNew.initTooltip(this);
    }

    getDefaultConfig() {
        return {

        };
    }

    render() {
        return html`
            ${this.variableSets?.length ? html`
                <button type="button" class="btn btn-light" @click="${this.showModal}">Annotation</button>

                <div class="modal fade annotation-modal" id="${this._prefix}annotation-modal" role="dialog"
                    tabindex="-1" aria-labelledby="annotation-modal" data-keyboard="false">
                <div class="modal-dialog modal-xl" role="document">
                    <div class="modal-content container">
                        <div class="modal-header">
                            <h4 class="modal-title">Annotation filter</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="nav nav-tabs mb-3" role="tablist">
                                ${this.variableSets.map((variableSet, i) => html`
                                    <li class="nav-item" role="presentation">
                                        <a class="nav-link ${classMap({"active": i === 0})}"
                                            id="${variableSet.id}_tab" data-bs-toggle="tab" data-bs-target="#${variableSet.id}_tabpanel"
                                            href="javascript: void 0" aria-controls="${variableSet.id}_tab"
                                            role="tab" data-cy="variable-set-tab">${variableSet.name}</a>
                                    </li>
                                `)}
                            </ul>

                            <div class="tab-content">
                                ${this.variableSets.map((variableSet, i) => html`
                                    <div class="tab-pane ${classMap({"active": i === 0})}" id="${variableSet.id}_tabpanel"
                                        role="tabpanel" tabindex="0"  aria-labelledby="${variableSet.id}_tab">
                                        ${variableSet.description ? html`
                                        <h4 class="mb-3">${variableSet.description}</h4>` : null}
                                    <div class="row g-3">
                                        ${variableSet.variables.map(variable => html`${this.renderVariable(variable, variableSet)}`)}
                                    </div>
                                </div>
                                `)}
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
            ` : html`<p>No variableSets defined in the study</p>`}
        `;
    }

}

customElements.define("opencga-annotation-filter-modal", OpencgaAnnotationFilterModal);
