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
import UtilsNew from "../../../../core/utils-new.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "./opencga-variable-selector.js";
import NotificationUtils from "../../../commons/utils/notification-utils.js";
import "../../../commons/forms/select-field-filter.js";

/**
 * @deprecated
 */

export default class OpencgaAnnotationFilter extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            entity: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
    }

    _init() {
        this._prefix = "oaf-" + UtilsNew.randomString(6);
        this.multipleVariableSets = false;
        this._config = this.getDefaultConfig();

        this.variableSets = [];
        // this.selectedVariable = {}
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

        // Components are already set. We will override with the classes from the configuration file
        PolymerUtils.addClassById(`${this._prefix}-main-annotation-filter-div`, [this._config.class]);

        // $("select.selectpicker", this).selectpicker("render");
        // $("select.selectpicker", this).selectpicker("refresh");
        // $("select.selectpicker", this).selectpicker("deselectAll");

        // Get selected variable
        const variableSetSelector = $(`button[data-id=${this._prefix}-annotation-picker]`)[0];
        console.log("variableSetSelector", variableSetSelector);
        if (typeof variableSetSelector !== "undefined") {
            this.selectedVariable = this.getVariable(variableSetSelector.title);
        }

        this.lastAnnotationFilter = undefined;

    }

    firstUpdated(_changedProperties) {
        $("select.selectpicker").selectpicker("render");
        $("select.selectpicker").selectpicker("refresh");
        $("select.selectpicker").selectpicker("deselectAll");

        const annotationDiv = $(`#${this._prefix}-main-annotation-filter-div`);
        // Add the class to the select picker buttons
        annotationDiv.find(".selectpicker").selectpicker("setStyle", this._config.buttonClass, "add");
        // Add the class to the lists
        annotationDiv.find("ul > li").addClass(this._config.class);
        // Add the class to the input
        annotationDiv.find(`.${this._prefix}AnnotationTextInput`).addClass(this._config.class);

    }

    // TODO FIXME opencga-variable-selector can be configured to be a multiple choice select, but here just the first selection is used
    async onChangeSelectedVariable(e, variableSetName) {
        // this.selectedVariable = e.detail.value[0];
        this.selectedVariable = e.detail.value;
        this.requestUpdate();
        await this.updateComplete;
        this.lastAnnotationFilter = undefined;
        // We do this manually here because the selectpicker class does not show/hide automatically
        if (this.selectedVariable.type === "CATEGORICAL") {
            // $(`#${this._prefix}-variableSetSelect`).selectpicker('hide')
            $(`#${this._prefix}-categorical-selector`).selectpicker("show");
            $(`#${this._prefix}-categorical-selector`).selectpicker("refresh");
            $(`#${this._prefix}-categorical-selector`).selectpicker("deselectAll");
        } else {
            $(`#${this._prefix}-categorical-selector`).selectpicker("hide");
            // $(`#${this._prefix}-variableSetSelect`).selectpicker('show');
            // $(`#${this._prefix}-variableSetSelect`).selectpicker('refresh');
        }
    }

    onAddAnnotationClicked(e) {
        if (typeof this.lastAnnotationFilter === "undefined") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_WARNING, {
                message: "Please choose or input a value"
            });
            return;
        }
        this.dispatchEvent(new CustomEvent("filterannotation", {detail: {value: this.lastAnnotationFilter}}));
    }

    getVariable(variableId) {
        for (const i in this.variables) {
            if (this.variables[i].id === variableId) {
                return this.variables[i];
            }
        }
        console.error("Variable " + variableId + " not found");
    }

    addCategoricalFilter(e) {
        this.lastAnnotationFilter = undefined;
        const values = $(e.target).selectpicker("val");
        if (values === null) {
            return;
        }
        // Note: in case of single variable set the select #${this._prefix}-variableSetSelect is not actually present in DOM, this.singleVariableSet contains the value
        const variableSetId = this.singleVariableSet ? this.singleVariableSet : $(`#${this._prefix}-variableSetSelect`).selectpicker("val");
        const variable = this.selectedVariable.tags;
        this.lastAnnotationFilter = `${variableSetId}:${variable}=${values.join(",")}`;
    }

    addInputFilter(e) {
        this.lastAnnotationFilter = undefined;
        const value = e.target.value.trim();
        if (!value) {
            return;
        }
        const variableSetId = this.singleVariableSet ? this.singleVariableSet : $(`#${this._prefix}-variableSetSelect`).selectpicker("val");
        const variable = this.selectedVariable.tags;
        console.log(variableSetId);
        this.lastAnnotationFilter = `${variableSetId}:${variable}=${value}`;
    }

    addSelectedFilter(e) {
        const value = e.currentTarget.dataset.value;
        const variableSetId = this.singleVariableSet ? this.singleVariableSet : $(`#${this._prefix}-variableSetSelect`).selectpicker("val");
        const variable = this.selectedVariable.tags;
        this.lastAnnotationFilter = `${variableSetId}:${variable}=${value}`;
    }

    opencgaSessionObserver() {

        this.variableSets = [];
        this.multipleVariableSets = false;
        this.variables = [];

        $("select.selectpicker").selectpicker("refresh");
        $("select.selectpicker").selectpicker("deselectAll");

        if (typeof this.opencgaSession.study === "undefined") {
            this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
            return;
        }

        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
        } else {
            const _this = this;

            this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
                .then(function (response) {
                    _this._updateVariableSets(response.response[0].result[0]);
                })
                .catch(function () {
                    _this.multipleVariableSets = false;

                    // Hide all selectpicker selectors
                    $(`#${this._prefix}-variableSetSelect`).selectpicker("hide");
                    $(`#${this._prefix}-annotation-picker`).selectpicker("hide");
                    $(`#${this._prefix}-categorical-selector`).selectpicker("hide");

                    this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
                    console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
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
                    variableSet["name"] = UtilsNew.defaultString(variableSet.name, variableSet.id);
                    _variableSets.push(variableSet);
                }
            }
            this.variableSets = _variableSets;
        }

        if (this.variableSets.length > 0) {
            this.selectedVariableSet = this.variableSets[0];
            this.filteredVariables = {
                variableSet: this.variableSets[0].id,
                variables: []
            };

            // Show all selectpicker selectors
            $(`#${this._prefix}-variableSetSelect`).selectpicker("show");
            $(`#${this._prefix}-annotation-picker`).selectpicker("show");
            if (typeof this.selectedVariable !== "undefined" && this.checkVarType(this.selectedVariable, "CATEGORICAL")) {
                $(`#${this._prefix}-categorical-selector`).selectpicker("show");
            }

            this.multipleVariableSets = this.variableSets.length > 1;
            this.singleVariableSet = !this.multipleVariableSets ? this.variableSets[0].id : null;
            this.requestUpdate();
            await this.updateComplete;
            this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: this.variableSets[0].id}}));

        } else {
            this.multipleVariableSets = false;

            // Hide all selectpicker selectors
            $(`#${this._prefix}-variableSetSelect`).selectpicker("hide");
            $(`#${this._prefix}-annotation-picker`).selectpicker("hide");
            $(`#${this._prefix}-categorical-selector`).selectpicker("hide");

            this.dispatchEvent(new CustomEvent("variablesetselected", {detail: {id: null}}));
        }
        this.requestUpdate();
        this.updateComplete.then(() => {
            $("select.selectpicker", this).selectpicker("refresh");
        });
    }

    renderVariableTemplate() {
        const myTemplate = PolymerUtils.getElementById(this._prefix + "VariableTemplate");
        if (UtilsNew.isNotNull(myTemplate)) {
            myTemplate.render();
        }
    }

    onSelectedVariableSetChange(e) {
        // console.log("onSelectedVariableSetChange", e)
        const selectedVariableSet = e.detail.value;
        this.selectedVariableSet = this.variableSets.find(variableSet => variableSet.name === selectedVariableSet);
        this.requestUpdate();
    }

    checkVarType(myVar, type) {
        return (myVar.type === type);
    }

    getDefaultConfig() {
        return {
            variableSelector: {
                marginLeft: 20,
                marginStep: 15
            },
            class: "",
            buttonClass: "",
            inputClass: ""
        };
    }

    render() {
        return html`
        <style>
            .plus-button {
                color: #00AA33;
                cursor: pointer;
            }

            .plus-button:hover {
                color: #009c2c;
            }

            .annotation-filter-div label{
                font-weight: normal;
                font-size: .9em;
            }


        </style>
        <div id="${this._prefix}-main-annotation-filter-div" class="annotation-filter-div">
        ${!this.variableSets.length ? html`
            <label>No variableSets defined in the study</label>
        ` : html`
            <!-- Annotations -->
            ${this.multipleVariableSets ? html`
                <label for="${this._prefix}-variableSetSelect">Select Variable Set</label>
                <select-field-filter
                    .data="${this.variableSets.map(_ => _.name)}"
                    .config="${{
                        liveSearch: false,
                        multiple: false,
                    }}"
                    @filterChange="${this.onSelectedVariableSetChange}">
                </select-field-filter>
            ` :
            null}

        <opencga-variable-selector
            .variableSet="${this.selectedVariableSet}"
            @variablechange="${this.onChangeSelectedVariable}">
        </opencga-variable-selector>

        <!-- Show different value selector based on the type of the selected variable -->
        ${this.selectedVariable ? html`<div>
            <div class="input-group">
                ${this.selectedVariable.type === "TEXT" || this.selectedVariable.type === "STRING" ? html`
                    <!-- TEXT type: include an input text and add suitable regular expression for text-->
                    <!-- http://stackoverflow.com/questions/14237686/disabling-controls-in-bootstrap-->
                    <input type="text" class="form-control ${this._prefix}AnnotationTextInput"
                           placeholder="${this.selectedVariable.id} name" data-variable-name="${this.selectedVariable.id}"
                           pattern="${this.selectedVariable.attributes && this.selectedVariable.attributes.pattern ? this.selectedVariable.attributes.pattern : null}"
                           aria-describedby="basic-addon1" @input="${this.addInputFilter}">
                ` : this.selectedVariable.type === "NUMERIC" || this.selectedVariable.type === "INTEGER" ? html`
                    <!-- NUMERIC type: include an input text and add suitable regular expression for numbers -->
                    <input type="text" class="form-control ${this._prefix}AnnotationTextInput"
                           placeholder="${this.selectedVariable.id} number" data-variable-name="${this.selectedVariable.id}"
                           pattern="^[0-9]+$" @input="${this.addInputFilter}">
                ` : this.selectedVariable.type === "CATEGORICAL" ? html`
                    <select id="${this._prefix}-categorical-selector" class="selectpicker" multiple @change="${this.addCategoricalFilter}"
                            data-width="100%">
                        ${this.selectedVariable.allowedValues && this.selectedVariable.allowedValues.length && this.selectedVariable.allowedValues.map(item => html`
                                    <option value="${item}" on-dom-change="renderDomRepeat">${item}</option>
                                `)}
                    </select>
                ` : this.selectedVariable.type === "BOOLEAN" ? html`
                    <!-- BOOLEAN type, 2 values: radio buttons for selection: yes or no -->
                    <div class="form-check form-check-inline">
                        <input id="${this._prefix}${this.selectedVariable.id}yes" class="form-check-input"
                               type="radio" name="${this.selectedVariable.id}Options" data-value=true @input="${this.addSelectedFilter}">
                        True
                        <input id="${this._prefix}${this.selectedVariable.id}no" class="form-check-input"
                               type="radio" name="${this.selectedVariable.id}Options" data-value=false @input="${this.addSelectedFilter}">
                        False
                    </div>
                ` : null}
                 <span class="input-group-addon" @click="${this.onAddAnnotationClicked}"><i class="fas fa-plus"></i></span>
            </div>
        ` : null }
        </div>
    </div>
        `}
        `;
    }

}

customElements.define("opencga-annotation-filter", OpencgaAnnotationFilter);
