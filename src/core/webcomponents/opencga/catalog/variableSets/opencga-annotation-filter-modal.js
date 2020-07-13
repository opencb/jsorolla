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
import UtilsNew from "../../../../utilsNew.js";

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
            entity: {
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
            await this.requestUpdate();
            for (let v of variables) {
                let [, variableSetId, variableId, value] = [...v.matchAll(/(\w+):(\w+)=(\w+)/g)][0];
                this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: value};
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
        let selected = [];
        for (let [variableSetId, variables] of Object.entries(this.selectedVariables)) {
            selected.push(Object.entries(variables).map( ([variableId, value]) => `${variableSetId}:${variableId}=${value}`).join(";"));
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

        /*if (typeof this.opencgaSession.study === "undefined") {
            this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
            return;
        }*/

        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
        } else {
            const _this = this;

            this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
                .then( response => {
                    this._updateVariableSets(response.getResult(0));
                })
                .catch(function() {
                    //this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
                    console.error("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
                });
        }

    }

    async _updateVariableSets(study) {

        if (typeof study.variableSets === "undefined") {
            this.variableSets = [];
        } else {
            const _variableSets = [];
            for (const variableSet of study.variableSets) {
                if (UtilsNew.isEmpty(this.entity) || variableSet.entities.includes(this.entity)) {
                    //moving OBJECT type variables at the end of the list
                    variableSet.variables.sort( (a, b) => a.type === "OBJECT" ? 1 : -1)
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

    addInputFilter(e) {
        const {variableId, variableSetId} = e.target.dataset;
        const value = e.target.value.trim();
        if (value) {
            this.selectedVariables[variableSetId] = {...this.selectedVariables[variableSetId] ?? {}, [variableId]: value};
        } else {
            delete this.selectedVariables[variableSetId][variableId];
        }
        this.selectedVariables = {...this.selectedVariables};
        this.selectedVariablesSerializer();
    }

    renderVariable(variable, variableSet) {
        let content = "";
        switch (variable.type) {
            case "OBJECT":
                content = html`<div class="col-md-12 variable-object">
                                <label class="variable-object-title">${variable.id}</label>
                                ${variable.variableSet.map( v => this.renderVariable(v,variableSet))}
                            </div>`;
                break;
            case "TEXT":
            case "STRING":
            case "MAP_INTEGER":
            case "MAP_STRING":
            case "MAP_DOUBLE":
            case "NUMERIC":
            case "INTEGER":
            case "DOUBLE":
                content = html`<div class="form-group col-md-3">
                                <label><a tooltip-title="${variable.id}" tooltip-text="${variable.description}"><i class="fa fa-info-circle" aria-hidden="true"></i></a> ${variable.name}</label>
                                <input type="text" class="form-control"
                                    placeholder="${variable.name}" data-variable-id="${variable.id}" data-variable-set-id="${variableSet.id}"
                                    pattern="${variable?.attributes?.pattern ?? null}"
                                    aria-describedby="basic-addon1" @input="${this.addInputFilter}" .value="${this.selectedVariables?.[variableSet.id]?.[variable.id] || ""}"/>
                            </div>`;
                break;
            case "CATEGORICAL":
                content = html`<select id="${this._prefix}-categorical-selector" class="selectpicker ${variable.id}" multiple @change="${this.addCategoricalFilter}" data-variable-set-id="${variableSet.id}" data-width="100%">
                ${variable.allowedValues && variable.allowedValues.length && variable.allowedValues.map(item => html`
                    <option value="${item}">${item}</option>
                    `)}
                    </select>`;
                break;
            case "BOOLEAN":
                content = html`
                    <div class="form-check form-check-inline col-md-3">
                        <input id="${this._prefix}${variable.id}yes" class="form-check-input"
                        type="radio" name="${variable.id}Options" data-value=true @input="${this.addSelectedFilter}">
                        True
                        <input id="${this._prefix}${variable.id}no" class="form-check-input"
                        type="radio" name="${variable.id}Options" data-value=false @input="${this.addSelectedFilter}">
                        False
                    </div>`;
                break;
            default:
                throw new Error("Type not recognized " + variable.type + "(" + variable.id + ")");
        }
        return html`
            <div class=" variable">
                ${content}
            </div>`;
    }

    filterChange() {

    }

    showModal() {
        $("#" + this._prefix + "annotation-modal").modal("show");
        UtilsNew.initTooltip(this);
    }

    closeModal() {
        $("#" + this._prefix + "annotation-modal").modal("hide");
    }

    getDefaultConfig(){
        return {

        }
    }

    render() {
        return html`
            <style>
                .annotation-modal .modal-dialog {
                    width: 1000px;
                    margin: 2em auto;
                }
                .variable-object {
                    padding: 0 0 0 20px;
                } 
                .variable-object-title {
                    font-size: 1.5em;
                }
                
                .annotation-modal .tab-pane {
                    padding-top: 20px;
                }
                
                .variable-set-description {
                    margin: 5px 0 20px 0;
                }
            </style>
           
            <button type="button" class="btn btn-default" @click="${this.showModal}"> Annotation </button>
           
            ${this.variableSets ? html`
                <div class="modal fade annotation-modal" id="${this._prefix}annotation-modal" role="dialog"
                 aria-labelledby="annotation-modal" data-keyboard="false">
                <div class="modal-dialog">
                    <div class="modal-content container">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            Annotation filter
                        </div>
                        <div class="modal-body">
                            <ul class="nav nav-tabs" role="tablist">
                                ${this.variableSets.map( (variableSet, i) => html`
                                    <li role="presentation" class="${classMap({"active" : i === 0})}">
                                        <a href="#${variableSet.id}_tab" aria-controls="profile" role="tab" data-toggle="tab">${variableSet.name}</a>
                                    </li>
                                `)}
                            </ul>
                            
                            <div class="tab-content">
                                ${this.variableSets.map( (variableSet, i) => html`
                                    <div role="tabpanel" class="tab-pane ${classMap({"active" : i === 0})}" id="${variableSet.id}_tab">
                                    ${variableSet.description ? html`<div class="variable-set-description"><i class="fas fa-info-circle align-middle"></i> ${variableSet.description}</div>` : null}
                                    <div class="row">
                                    ${variableSet.variables.map(variable => html`<div> ${this.renderVariable(variable, variableSet)}</div>`)}
                                    </div>
                                </div>
                                `)}
                            </div>
                        </div>
            
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary ripple" @click="${this.closeModal}">OK</button>
                        </div>
                    </div>
                </div>
            </div>
            ` : null} 
        `;
    }

}

customElements.define("opencga-annotation-filter-modal", OpencgaAnnotationFilterModal);
