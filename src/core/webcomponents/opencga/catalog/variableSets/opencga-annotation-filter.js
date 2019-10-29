import {LitElement, html} from '/web_modules/lit-element.js';

import OpencgaVariableSelector from './opencga-variable-selector';

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
        }
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver()
        }
    }

    _init() {
        // super.ready();
        this.prefix = "oaf-" + Utils.randomString(6);
        this.multipleVariableSets = false;
        this._config = this.getDefaultConfig();
    }

    //connectedCallback in Polyer 2
    firstUpdated(changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};

        // Components are already set. We will override with the classes from the configuration file
        PolymerUtils.addClassById(`${this.prefix}-main-annotation-filter-div`, [this._config.class]);
    }

    renderDomRepeat(e) {
        // $('select.selectpicker').selectpicker('render');
        $('select.selectpicker').selectpicker('refresh');
        $('select.selectpicker').selectpicker('deselectAll');

        // Get selected variable
        let variableSetSelector = $(`button[data-id=${this.prefix}-annotation-picker]`)[0];
        if (typeof variableSetSelector !== "undefined") {
            this.selectedVariable = this.getVariable(variableSetSelector.title);
        }

        this.lastAnnotationFilter = undefined;

        let annotationDiv = $(`#${this.prefix}-main-annotation-filter-div`);
        // Add the class to the select picker buttons
        annotationDiv.find(".selectpicker").selectpicker('setStyle', this._config.buttonClass, 'add');
        // Add the class to the lists
        annotationDiv.find("ul > li").addClass(this._config.class);
        // Add the class to the input
        annotationDiv.find(`.${this.prefix}AnnotationTextInput`).addClass(this._config.class);
    }

    onChangeSelectedVariable(e) {
        this.selectedVariable = e.detail.value[0];
        this.lastAnnotationFilter = undefined;

        // We do this manually here because the selectpicker class does not show/hide automatically
        if (this.selectedVariable.type === "CATEGORICAL") {
            $(`#${this.prefix}-categorical-selector`).selectpicker("show");
        } else {
            $(`#${this.prefix}-categorical-selector`).selectpicker("hide");
        }
    }

    onAddAnnotationClicked(e) {
        if (typeof this.lastAnnotationFilter === "undefined") {
            NotificationUtils.showNotify("Please choose or input a value", "WARNING");
            return;
        }
        this.dispatchEvent(new CustomEvent('filterannotation', {detail: {value: this.lastAnnotationFilter}}));
    }

    getVariable(variableId) {
        for (let i in this.variables) {
            if (this.variables[i].id === variableId) {
                return this.variables[i];
            }
        }
        console.error("Variable " + variableId + " not found");
    }

    addCategoricalFilter(e) {
        this.lastAnnotationFilter = undefined;

        let values = $(`#${this.prefix}-categorical-selector`).selectpicker('val');
        if (values === null) {
            return;
        }

        let variableSetId = $(`#${this.prefix}-variableSetSelect`).selectpicker('val');
        let variable = this.selectedVariable.tags;

        this.lastAnnotationFilter = `${variableSetId}:${variable}=${values.join(",")}`;
    }

    addInputFilter(e) {
        this.lastAnnotationFilter = undefined;

        let annotationTextInputElements = PolymerUtils.getElementsByClassName(this.prefix + "AnnotationTextInput");
        if (annotationTextInputElements.length === 0) {
            return;
        }
        let value = annotationTextInputElements[0].value;
        let variableSetId = $(`#${this.prefix}-variableSetSelect`).selectpicker('val');
        let variable = this.selectedVariable.tags;

        if (value === "") {
            this.lastAnnotationFilter = undefined;
            return;
        }

        this.lastAnnotationFilter = `${variableSetId}:${variable}=${value}`;
    }

    addSelectedFilter(e) {
        let value = e.currentTarget.dataset.value;
        let variableSetId = $(`#${this.prefix}-variableSetSelect`).selectpicker('val');
        let variable = this.selectedVariable.tags;

        this.lastAnnotationFilter = `${variableSetId}:${variable}=${value}`;
    }

    opencgaSessionObserver() {

        this.variableSets = [];
        this.multipleVariableSets = false;
        this.variables = [];

        $('select.selectpicker').selectpicker('refresh');
        $('select.selectpicker').selectpicker('deselectAll');

        if (typeof this.opencgaSession.study === "undefined") {
            this.dispatchEvent(new CustomEvent('variablesetselected', {detail: {id: null}}));
            return;
        }

        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
        } else {
            let _this = this;

            this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
                .then(function (response) {
                    _this._updateVariableSets(response.response[0].result[0]);
                })
                .catch(function () {
                    _this.multipleVariableSets = false;

                    // Hide all selectpicker selectors
                    $(`#${this.prefix}-variableSetSelect`).selectpicker('hide');
                    $(`#${this.prefix}-annotation-picker`).selectpicker('hide');
                    $(`#${this.prefix}-categorical-selector`).selectpicker('hide');

                    this.dispatchEvent(new CustomEvent('variablesetselected', {detail: {id: null}}));
                    console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
                });
        }
    }

    //TODO check if variableSets need to be managed by litElement as prop
    _updateVariableSets(study) {
        if (typeof study.variableSets === "undefined") {
            this.variableSets = [];
        } else {
            let _variableSets = [];
            for (let variableSet of study.variableSets) {
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
            $(`#${this.prefix}-variableSetSelect`).selectpicker('show');
            $(`#${this.prefix}-annotation-picker`).selectpicker('show');
            if (typeof this.selectedVariable !== "undefined" && this.checkVarType(this.selectedVariable, "CATEGORICAL")) {
                $(`#${this.prefix}-categorical-selector`).selectpicker('show');
            }

            this.multipleVariableSets = this.variableSets.length > 1;
            this.dispatchEvent(new CustomEvent('variablesetselected', {detail: {id: this.variableSets[0].id}}));

        } else {
            this.multipleVariableSets = false;

            // Hide all selectpicker selectors
            $(`#${this.prefix}-variableSetSelect`).selectpicker('hide');
            $(`#${this.prefix}-annotation-picker`).selectpicker('hide');
            $(`#${this.prefix}-categorical-selector`).selectpicker('hide');

            this.dispatchEvent(new CustomEvent('variablesetselected', {detail: {id: null}}));
        }
    }

    renderVariableTemplate() {
        let myTemplate = PolymerUtils.getElementById(this.prefix + 'VariableTemplate');
        if (UtilsNew.isNotNull(myTemplate)) {
            myTemplate.render();
        }
    }

    onSelectedVariableSetChange(e) {
        let selectedVariableSet = e.currentTarget.value;

        for (let i in this.variableSets) {
            let variableSet = this.variableSets[i];
            if (variableSet.name === selectedVariableSet) {
                this.selectedVariableSet = variableSet;
                return;
            }
        }
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
        }
    }


    render() {
        return html`
        <style include="jso-styles">
            .plus-button {
                color: #00AA33;
                cursor: pointer;
            }

            .plus-button:hover {
                color: #009c2c;
            }
        </style>
        <div id="${this.prefix}-main-annotation-filter-div">
        ${!this.variableSets.length ? html`
            No variableSets defined in the study
        ` : html`
            <!-- Annotations -->
            ${this.multipleVariableSets ? html`
                            <label for="${this.prefix}}-variableSetSelect">Select Variable Set</label>
                            <select class="selectpicker" id="${this.prefix}}-variableSetSelect" @change="${this.onSelectedVariableSetChange}"
                                    on-dom-change="renderDomRepeat" data-width="100%">
                                <!--<select class="form-control" id="variableSetSelect" style="width: 100%"-->
                                <!--on-change="onSelectedVariableSetChange">-->
                                ${this.variableSets.map(item => html`
                                    <option data-variable="${this.item}}">${this.item.name}}</option>
                                `)}
                            </select>` : null}
        
        <opencga-variable-selector .variableSet="${this.selectedVariableSet}"
                                   @variablechange="${this.onChangeSelectedVariable}"></opencga-variable-selector>
        
        <!--<label for="{{prefix}}-annotation-picker" style="margin-top: 15px;">Select variable and value(s)</label>-->
        <!--<select id="{{prefix}}-annotation-picker" class="selectpicker" data-live-search="true" data-size="10"-->
        <!--data-max-options="1" on-change="onChangeSelectedVariable" data-width="100%" data-class="btn-sm">-->
        <!--<template is="dom-repeat" items="{{variables}}" as="variable" on-dom-change="renderDomRepeat" restamp="true">-->
        <!--<option data-tokens="{{variable.tags}}" data-variable="{{variable}}"-->
        <!--style$="padding-left: {{variable.margin}}px; cursor: {{variable.cursor}};"-->
        <!--disabled$="{{variable.disabled}}">-->
        <!--{{variable.name}}-->
        <!--</option>-->
        <!--</template>-->
        <!--</select>-->
        
        <!-- Show different value selector based on the type of the selected variable -->
        <div class="row" style="margin-top: 15px;">
            <div class="col-md-10">
                
                ${this.selectedVariable.type === 'TEXT' ? html`
                    <!-- TEXT type: include an input text and add suitable regular expression for text-->
                    <!-- http://stackoverflow.com/questions/14237686/disabling-controls-in-bootstrap-->
                    <input type="text" class="form-control ${this.prefix}AnnotationTextInput"
                           placeholder="${this.selectedVariable.id} name" data-variable-name$="${this.selectedVariable.id}"
                           pattern="${this.variable.attributes.pattern}"
                           aria-describedby="basic-addon1" @change="${this.addInputFilter}">
                ` : this.selectedVariable.type === 'NUMERIC' || this.selectedVariable.type === 'INTEGER' || this.selectedVariable.type === 'DOUBLE' ? html`
                    <!-- NUMERIC type: include an input text and add suitable regular expression for numbers -->
                    <input type="text" class$="form-control ${this.prefix}}AnnotationTextInput"
                           placeholder="${this.selectedVariable.id} number" data-variable-name$="${this.selectedVariable.id}"
                           pattern="^[0-9]+$" @change="${this.addInputFilter}">
                ` : this.selectedVariable.type === 'CATEGORICAL' ? html`
                    <select id="${this.prefix}-categorical-selector" class="selectpicker" multiple @change="${this.addCategoricalFilter}"
                            data-width="100%">
                        ${this.selectedVariable.allowedValues && this.selectedVariable.allowedValues.length && this.selectedVariable.allowedValues.map(item => html`
                                    <option value="${item}" on-dom-change="renderDomRepeat">${item}</option>
                                `)}
                    </select>
                ` : this.selectedVariable.type === 'BOOLEAN' ? html`
                    <!-- BOOLEAN type, 2 values: radio buttons for selection: yes or no -->
                    <div class="form-check form-check-inline">
                        <input id="${this.prefix}}${this.selectedVariable.id}}yes" class="form-check-input"
                               type="radio" name="${this.selectedVariable.id}}Options" data-value=true @click="${this.addSelectedFilter}">
                        True
                        <input id="${this.prefix}}${this.selectedVariable.id}}no" class="form-check-input"
                               type="radio" name="${this.selectedVariable.id}}Options" data-value=false @click="${this.addSelectedFilter}">
                        False
                    </div>

                ` : null}
                </div>
            
                <div class="col-md-2">
                    <i class="fa fa-plus-circle fa-2x plus-button" aria-hidden="true" @click="${this.onAddAnnotationClicked}">  </i>
                </div>
            </div>
        </div>
        `}
        `;
    }
}

customElements.define('opencga-annotation-filter',OpencgaAnnotationFilter);
