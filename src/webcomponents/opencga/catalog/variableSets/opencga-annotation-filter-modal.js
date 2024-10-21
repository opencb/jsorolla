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

import {LitElement, html} from "lit";
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../../../core/utils-new.js";
import ModalUtils from "../../../commons/modal/modal-utils.js";
import LitUtils from "../../../commons/utils/lit-utils.js";
import "./../../../commons/forms/select-field-filter.js";

export default class OpencgaAnnotationFilterModal extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
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
        };
    }

    #init() {
        this._prefix = "oafm-" + UtilsNew.randomString(6) + "_";
        this.selectedVariables = {};
        this.selectedVariablesText = "";
        this.variableMap = {};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("selectedVariablesText")) {
            this.selectedVariablesTextObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.variableSets = [];
        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
        } else {
            this.opencgaClient.studies()
                .info(this.opencgaSession.study.id, {include: "variableSets"})
                .then(response => {
                    this._updateVariableSets(response.getResult(0));
                })
                .catch(() => {
                    // this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
                    console.error("Could not obtain the variable sets of the study " + this.opencgaSession.study);
                });
        }
    }

    /**
     * It builds the variable this.selectedVariables from the serialized string this.selectedVariablesText
     */
    selectedVariablesTextObserver() {
        this.selectedVariables = {};

        if (this.selectedVariablesText) {
            const variables = this.selectedVariablesText.split(";");

            for (const v of variables) {
                const match = [...v.matchAll(/(\w+):(\w+\.?\w+)(<=?|>=?|=)(\w+(?:\s+\w+)*)/g)][0];
                if (!match) {
                    // TODO 20241017: Handle potential match failures
                    console.log(`Annotation variable ${v} failed at matching regular expression`);
                } else {
                    const [, variableSetId, variableId, operator, value] = match;
                    // Update the  variable this.selectedVariables
                    this.selectedVariables[variableSetId] = {
                        ...this.selectedVariables[variableSetId] ?? {},
                        [variableId]: {operator, value},
                    };
                }
            }
        }
    }

    /**
     * It serializes this.selectedVariables in a single string and fire the event
     */
    selectedVariablesSerializer() {
        const selected = [];

        for (const [variableSetId, variables] of Object.entries(this.selectedVariables)) {
            // Value is not defined iff an operator (<=, >=, ...) has been selected before setting the value. In that case we filter out that entry.
            const singleVariableSetVariables = Object.entries(variables)
                .filter(([, {value}]) => Boolean(value))
                .map(([variableId, {operator, value}]) => `${variableSetId}:${variableId}${operator}${value}`)
                .join(";");
            selected.push(singleVariableSetVariables);
        }

        LitUtils.dispatchCustomEvent(this, "annotationChange", selected.join(";"));
    }

    _updateVariableSets(study) {
        // CAUTION: MAP_BOOLEAN MISSING
        const sort = ["TEXT", "STRING", "NUMERIC", "INTEGER", "DOUBLE", "CATEGORICAL", "BOOLEAN", "OBJECT", "MAP_STRING", "MAP_DOUBLE", "MAP_INTEGER"];
        this.variableSets = [];
        if (typeof study.variableSets !== "undefined") {
            this.variableSets = study.variableSets.filter(variableSet => {
                if (UtilsNew.isEmpty(this.resource) || variableSet.entities.includes(this.resource)) {
                    variableSet.variables.sort((a, b) => sort.indexOf(a.type) - sort.indexOf(b.type));
                    return {
                        name: variableSet.name || variableSet.id,
                        ...variableSet
                    };
                }
            });
        }
    }

    changeOperator(e) {
        const {variableId, variableSetId} = e.target.dataset;
        const operator = e.target.value;

        this.selectedVariables[variableSetId] = {
            ...this.selectedVariables[variableSetId] ?? {},
            [variableId]: {
                ...this.selectedVariables[variableSetId]?.[variableId], // Spread existing variableId if present
                operator,
            },
        };

        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    addNumericFilter(e) {
        const {variableId, variableSetId} = e.target.dataset; // numericOperator is defined only for INTEGER and DOUBLE types

        const value = e.target.value.trim();
        const operator = this.selectedVariables[variableSetId]?.[variableId]?.operator || ">";

        if (value) {
            this.selectedVariables[variableSetId] = {
                ...this.selectedVariables[variableSetId] ?? {},
                [variableId]: {value, operator}
            };
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
            this.selectedVariables[variableSetId] = {
                ...this.selectedVariables[variableSetId] ?? {},
                [variableId]: {value, operator: "="}
            };
        } else {
            delete this.selectedVariables[variableSetId][variableId];
        }
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    addCategoricalFilter(variableSetId, variableId, key) {
        const value = key.trim();
        if (value) {
            this.selectedVariables[variableSetId] = {
                ...this.selectedVariables[variableSetId] ?? {},
                [variableId]: {value, operator: "="}
            };
        } else {
            delete this.selectedVariables[variableSetId][variableId];
        }
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    addBooleanFilter(e) {
        const {variableId, variableSetId, value} = e.target.dataset;
        console.log(variableId, variableSetId, value);
        this.selectedVariables[variableSetId] = {
            ...this.selectedVariables[variableSetId] ?? {},
            [variableId]: {value, operator: "="}
        };
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    changeMap(e, variableSetId, variableId, key) {
        if (key) {
            this.variableMap[variableSetId] = {
                ...this.variableMap[variableSetId],
                [variableId]: key.split(","),
            };
        } else {
            delete this.variableMap[variableSetId][variableId];
        }
        if (this.selectedVariables?.[variableSetId]) {
            Object.keys(this.selectedVariables[variableSetId])
                .forEach(key => {
                    const [keyVariableId, keyOption] = key.split(".");
                    if (keyOption && !this.variableMap[variableSetId][keyVariableId]?.includes(keyOption)) {
                        delete this.selectedVariables[variableSetId][key];
                    }
                });
        }
        this.variableMap = {...this.variableMap};
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
        this.requestUpdate();
    }

    renderVariable(variable, variableSet) {
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
                                    <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <textarea class="form-control" id="${variable.id}Textarea" rows="1"
                                data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                                @input="${this.addInputFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}">
                            </textarea>
                        </div>
                    `}
                    </div>
                `;
                break;
            case "MAP_STRING":
                // TODO Vero 20241017: Find an example and test
                content = html`
                    ${variable?.allowedKeys?.length ? html`
                        <div class="col-md-12">
                            <label class="form-label fw-bold">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <select-field-filter
                                .data="${variable?.allowedKeys}"
                                .value="${this.variableMap?.[variableSet.id]?.[variable.id] ?? []}"
                                .config="${{multiple: true, liveSearch: false}}"
                                @filterChange="${e => this.changeMap(e, variableSet.id, variable.id, e.detail.value)}">
                            </select-field-filter>
                            <!-- form-inline -->
                            <div class="row row-cols-lg-auto g-1 align-items-center">
                                ${this.variableMap?.[variableSet.id]?.[variable.id]?.map(key => html`
                                    <div class="col-md-3">
                                        <label class="form-label fw-bold" for="${variable.id}Input">${key}</label>
                                        <input
                                            class="form-control"
                                            type="text"
                                            placeholder="${key}"
                                            id="${variable.id}Input"
                                            data-variable-id="${variable.id + "." + key}"
                                            data-variable-set-id="${variableSet.id}"
                                            .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"
                                            @input="${this.addInputFilter}"/>
                                    </div>
                                `)}
                            </div>
                        </div>
                    ` : html`
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="${variable.id}Input">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <input
                                class="form-control"
                                type="text"
                                id="${variable.id}Input"
                                placeholder="${variable.id}"
                                data-variable-id="${variable.id}"
                                data-variable-set-id="${variableSet.id}"
                                pattern="${variable?.attributes?.pattern ?? null}"
                                aria-describedby="basic-addon1"
                                .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"
                                @input="${this.addInputFilter}"/>
                        </div>
                    `}
                `;
                break;
            case "MAP_DOUBLE":
            case "MAP_INTEGER":
                content = html`
                    ${variable?.allowedKeys?.length ? html`
                        <div class="col-md-12">
                            <label class="form-label fw-bold">
                                <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                    <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <select-field-filter
                                .data="${variable?.allowedKeys}"
                                .value=${this.variableMap?.[variableSet.id]?.[variable.id] ?? []}
                                .config="${{multiple: true, liveSearch: false}}"
                                @filterChange="${e => this.changeMap(e, variableSet.id, variable.id, e.detail.value)}">
                            </select-field-filter>
                            <div class="row">
                                ${
                                    this.variableMap?.[variableSet.id]?.[variable.id]?.map(key => {
                                        const operator = this.selectedVariables?.[variableSet.id]?.[variable.id + "." + key]?.operator || ">";
                                        const value = this.selectedVariables?.[variableSet.id]?.[variable.id + "." + key]?.value || "";
                                        return html`
                                            <div class="col-md-3">
                                                <label class="form-label fw-bold"  for="${variable.id}Input">
                                                    ${key}
                                                </label>
                                                <div class="row row-cols-lg-auto g-1 align-items-center">
                                                    <div class="col-6">
                                                        <select
                                                            class="form-select"
                                                            id="${variable.id}Input"
                                                            data-variable-id="${variable.id + "." + key}"
                                                            data-variable-set-id="${variableSet.id}"
                                                            .value="${operator}"
                                                            @change="${this.changeOperator}">
                                                                <option value="<">&lt;</option>
                                                                <option value="<=">&le;</option>
                                                                <option value="=">&equals;</option>
                                                                <option value=">">&gt;</option>
                                                                <option value=">=">&ge;</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-6">
                                                        <input
                                                            type="text"
                                                            class="form-control"
                                                            placeholder="${key}"
                                                            data-variable-id="${variable.id + "." + key}"
                                                            data-variable-set-id="${variableSet.id}"
                                                            .value="${value}"
                                                            @input="${this.addNumericFilter}"/>
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
                                    <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                                </a> ${variable.id}
                            </label>
                            <input
                                class="form-control"
                                type="text" id="${variable.id}Input"
                                placeholder="${variable.id}"
                                data-variable-id="${variable.id}"
                                data-variable-set-id="${variableSet.id}"
                                pattern="${variable?.attributes?.pattern ?? null}"
                                aria-describedby="basic-addon1"
                                .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"
                                @input="${this.addInputFilter}"/>

                        </div>
                    `}
                `;
                break;
            case "TEXT":
            case "STRING":
                content = html`
                    <div class="col-md-3">
                        <label class="form-label fw-bold" for="${variable.id}Input">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <input
                            type="text"
                            class="form-control"
                            id="${variable.id}Input"
                            placeholder="${variable.id}"
                            data-variable-id="${variable.id}"
                            data-variable-set-id="${variableSet.id}"
                            pattern="${variable?.attributes?.pattern ?? null}"
                            aria-describedby="basic-addon1"
                            .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"
                            @input="${this.addInputFilter}"/>
                    </div>
                `;
                break;
            case "NUMERIC":
            case "INTEGER":
            case "DOUBLE":
                content = html`
                    <div class="col-md-3">
                        <label class="form-label fw-bold" for="${variable.id}Select ${variable.id}Input">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <div class="row row-cols-lg-auto g-1 align-items-center">
                            <div class="col-6">
                                <select
                                    class="form-select"
                                    id="${variable.id}Select"
                                    data-variable-id="${variable.id}"
                                    data-variable-set-id="${variableSet.id}"
                                    @change="${this.changeOperator}">
                                        <option value="=">&equals;</option>
                                        <option value="<">&lt;</option>
                                        <option value="<=">&le;</option>
                                        <option value=">" selected>&gt;</option>
                                        <option value=">=">&ge;</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="${variable.id}Input"
                                    placeholder="${variable.id}"
                                    pattern="${variable?.attributes?.pattern ?? null}"
                                    data-variable-id="${variable.id}"
                                    data-variable-set-id="${variableSet.id}"
                                    @input="${this.addNumericFilter}"
                                    .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"/>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case "CATEGORICAL":
                content = html`
                    <div class="col-md-3">
                        <label class="form-label fw-bold">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <select-field-filter
                            .data="${variable.allowedValues}"
                            .value="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value || ""}"
                            .config="${{multiple: !!variable.multiValue, liveSearch: false}}"
                            @filterChange="${e => this.addCategoricalFilter(variableSet.id, variable.id, e.detail.value)}">
                        </select-field-filter>
                    </div>
                `;
                break;
            case "BOOLEAN":
                content = html`
                        <!-- form-check form-check-inline col-md-3 -->
                    <div class="row row-cols-lg-auto g-1 align-items-center">
                        <label class="form-check-label fw-bold" for="${this._prefix}${variable.id}yes ${this._prefix}${variable.id}no">
                            <a tooltip-title="${variable.id}" tooltip-text="${variable.description}">
                                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                            </a> ${variable.id}
                        </label>
                        <div class="form-control">
                            <input
                                class="form-check-input"
                                data-variable-id="${variable.id}"
                                id="${this._prefix}${variable.id}yes"
                                data-variable-set-id="${variableSet.id}"
                                type="radio"
                                name="${variable.id}Options"
                                data-value="True"
                                .checked="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value === "true"}"
                                @input="${this.addBooleanFilter}">
                            True
                            <input
                                class="form-check-input"
                                id="${this._prefix}${variable.id}no"
                                data-variable-id="${variable.id}"
                                data-variable-set-id="${variableSet.id}"
                                type="radio"
                                name="${variable.id}Options"
                                data-value="False"
                                .checked="${this.selectedVariables?.[variableSet.id]?.[variable.id]?.value === "false"}"
                                @input="${this.addBooleanFilter}">
                            False
                        </div>
                    </div>
                `;
                break;
            default:
                throw new Error("Type not recognized " + variable.type + "(" + variable.id + ")");
        }
        return html`${content}`;
    }

    showModal() {
        const annotationModal = new bootstrap.Modal(`#${this._prefix}AnnotationFilterModal`);
        annotationModal.show();
        UtilsNew.initTooltip(this);
    }

    renderBody() {
        return html`
            <ul class="nav nav-tabs mb-3" role="tablist">
                ${this.variableSets.map((variableSet, i) => html`
                    <li class="nav-item" role="presentation">
                        <a class="nav-link ${classMap({"active": i === 0})}"
                           id="${variableSet.id}_tab"
                           data-bs-toggle="tab"
                           data-bs-target="#${variableSet.id}_tabpanel"
                           href="javascript: void 0"
                           aria-controls="${variableSet.id}_tab"
                           role="tab"
                           data-cy="variable-set-tab">${variableSet.name}</a>
                    </li>
                `)}
            </ul>
            <div class="tab-content">
                ${this.variableSets.map((variableSet, i) => html`
                    <div class="tab-pane ${classMap({"active": i === 0})}"
                         id="${variableSet.id}_tabpanel"
                         role="tabpanel"
                         tabindex="0"
                         aria-labelledby="${variableSet.id}_tab">
                        ${variableSet.description ? html`
                        <h4 class="mb-3">${variableSet.description}</h4>` : null}
                    <div class="row g-3">
                        ${variableSet.variables.map(variable => this.renderVariable(variable, variableSet))}
                    </div>
                </div>
                `)}
            </div>
        `;
    }

    render() {
        return this.variableSets?.length ? html`
            <button type="button" class="btn btn-light" @click="${this.showModal}">Annotation</button>
            ${ModalUtils.create(this, this._prefix + "AnnotationFilterModal", {
            display: {
                modalTitle: "Annotation Filter",
                modalDraggable: true,
                modalCyDataName: "modal-annotation-filter",
                modalSize: "modal-xl",
                modalbtnsVisible: true,
                btnCancelVisible: false,
                okButtonText: "OK",
            },
            render: () => this.renderBody(),
        })}
        ` : html`
            <p>No variableSets defined in the study</p>
        `;
    }

}

customElements.define("opencga-annotation-filter-modal", OpencgaAnnotationFilterModal);
