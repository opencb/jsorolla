import {LitElement, html} from "lit";
import UtilsNew from "../../../../core/utils-new.js";
import PolymerUtils from "../../../PolymerUtils.js";
import LitUtils from "../../../commons/utils/lit-utils.js";
import "./opencga-variable-selector.js";
import "./../../../commons/forms/select-field-filter.js";
import NotificationUtils from "../../../commons/utils/notification-utils.js";

/**
 * @deprecated
 */
export default class OpencgaAnnotationFilterDynamic extends LitElement {

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
            selectedVariablesText: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oaf-" + UtilsNew.randomString(6);
        this.multipleVariableSets = false;
        this.variableSets = [];

        this.selectedVariables = {};
        this.selectedVariablesText = "";
        // this.selectedVariable = {}
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

        // Get selected variable
        /* const variableSetSelector = $(`button[data-id=${this._prefix}-annotation-picker]`)[0];
        console.log("variableSetSelector", variableSetSelector);
        if (typeof variableSetSelector !== "undefined") {
            this.selectedVariable = this.getVariable(variableSetSelector.title);
        }

        this.lastAnnotationFilter = undefined;*/


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

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("selectedVariablesText")) {
            this.selectedVariablesTextObserver();
        }
    }

    // It builds this.selectedVariables from the serialized string this.selectedVariablesText
    async selectedVariablesTextObserver() {
        if (this.selectedVariablesText) {

            this.selectedVariablesFormatted = this.selectedVariablesText;
            const variables = this.selectedVariablesFormatted.split(";");
            // reset selectedVariables
            this.selectedVariables = Object.assign({}, ...this.variableSets.map(_ => ({[_.id]: []})));
            this.requestUpdate();
            await this.updateComplete;

            for (const v of variables) {
                const [, variableSetId, variable, value] = [...v.matchAll(/(\w+):(\w+)=(\w+)/g)][0];
                // const indx = this.selectedVariables[variableSetId].findIndex(s => s.id === variable);
                // console.log("ind", indx);

                // add new variable
                const variableSet = this.variableSets.find(_ => _.id === variableSetId);
                const newvar = variableSet.variables.find(_ => _.id === variable);
                this.selectedVariables[variableSetId] = [...this.selectedVariables[variableSetId], {...newvar, value: value}];
            }

            // the update of the select picker cannot be done in the same loop
            for (const [variableSetId, variables] of Object.entries(this.selectedVariables)) {
                console.log("VARIABLE", variables);
                $("#" + this._prefix + "-annotation-picker-" + variableSetId).selectpicker("val", variables.map(_ => _.id));
            }
        } else {
            // resetting this.selectedVariables and all .selectpicker
            this.selectedVariables = Object.assign({}, ...this.variableSets.map(_ => ({[_.id]: []})));
            $("." + this._prefix + "-annotation-filter-div .selectpicker").selectpicker("deselectAll");
        }

        this.selectedVariables = {...this.selectedVariables};
        this.requestUpdate();
    }

    /**
     * It serializes this.selectedVariables in a single string and fire the event
     */
    // fire in case of selectedVariables change
    selectedVariablesSerializer() {
        // console.log("selectedVariableObserver", this.selectedVariables);
        const selected = [];
        this.selectedVariablesFormatted = "";
        for (const [variableSetId, variables] of Object.entries(this.selectedVariables)) {
            // avoid adding empty arrays (every value in selectedVariables is init as empty array)
            if (variables.length) {
                // each variableSet is an item
                selected.push(variables.filter(variable => !!variable.value).map(variable => `${variableSetId}:${variable.id}=${variable.value}`).join(";"));
            }
        }
        const event = new CustomEvent("annotationChange", {
            detail: {
                value: selected.join(";")
            }
        });
        this.dispatchEvent(event);
    }

    async onChangeSelectedVariable(e, variableSetId) {
        // it seems there is no way to get just the currently selected/deselected item (you can get the whole array of selected items only)
        // so this method computes the symmetric difference (in terms of sets, Union minus Intersection) between this.selectedVariables and $(e.target).selectpicker("val")
        const currentSelected = $(e.target).selectpicker("val") || [];
        const selectedIds = this.selectedVariables[variableSetId].map(_ => _.id); // empty array in case of first selection
        const differences = selectedIds
            .filter(a => !currentSelected.includes(a))
            .concat(currentSelected.filter(id => !selectedIds.includes(id)));

        if (differences.length > 1) console.error("Difference error!", this.selectedVariables, currentSelected);

        const difference = differences[0];
        if (currentSelected.length > selectedIds.length) {
            // add the variable
            const variableSet = this.variableSets.find(set => set.id === variableSetId);
            const variable = variableSet.variables.find(variable => variable.id === difference);

            // if a variable in the same variableSet has been already selected
            // there is no need for this check this.selectedVariables[variableSetId] is always defined
            /* if (this.selectedVariables[variableSetId] && this.selectedVariables[variableSetId].length) {
                this.selectedVariables[variableSetId] = [...this.selectedVariables[variableSetId], variable];
            } else {
                this.selectedVariables[variableSetId] = [variable];
            }*/

            this.selectedVariables[variableSetId] = [...this.selectedVariables[variableSetId], variable];

            // console.log("adding", difference, this.selectedVariables[variableSetId]);
        } else {
            // remove the variable
            this.selectedVariables[variableSetId] = this.selectedVariables[variableSetId].filter(variable => variable.id !== difference);
            // console.log("removing", difference, this.selectedVariables[variableSetId]);
        }
        this.requestUpdate();
        await this.updateComplete;
    }

    // Deprecated
    onAddAnnotationClicked(e) {
        if (typeof this.lastAnnotationFilter === "undefined") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_WARNING, {
                message: "Please choose or input a value",
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

    // TODO
    addCategoricalFilter(e) {
        this.lastAnnotationFilter = undefined;
        const values = $(e.target).selectpicker("val");
        /* if (values === null) {
            return;
        }*/
        // Note: in case of single variable set the select #${this._prefix}-variableSetSelect is not actually present in DOM, this.singleVariableSet contains the value
        const variableSetId = this.singleVariableSet ? this.singleVariableSet : $(`#${this._prefix}-variableSetSelect`).selectpicker("val");
        const variable = this.selectedVariable.tags;
        this.lastAnnotationFilter = `${variableSetId}:${variable}=${values.join(",")}`;
    }

    addInputFilter(e) {
        const {variableId, variableSetId} = e.target.dataset;
        const value = e.target.value.trim();
        // this.lastAnnotationFilter = `${variableSetId}:${variableId}=${value}`;
        const indx = this.selectedVariables[variableSetId].findIndex(variable => variable.id === variableId);
        this.selectedVariables[variableSetId][indx] = {...this.selectedVariables[variableSetId][indx], value: value};
        this.selectedVariables = {...this.selectedVariables};

        this.selectedVariablesSerializer();
    }

    // TODO
    addSelectedFilter(e) {
        const value = e.currentTarget.dataset.value;
        const variableSetId = this.singleVariableSet ? this.singleVariableSet : $(`#${this._prefix}-variableSetSelect`).selectpicker("val");
        const variable = this.selectedVariable.tags;
        this.lastAnnotationFilter = `${variableSetId}:${variable}=${value}`;
    }

    // TODO refactor
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
                    console.log("RES", response.response[0].result[0]);
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

                    // init a map of ids to track the selected variables
                    this.selectedVariables[variableSet.id] = [];
                }
            }
            this.variableSets = _variableSets;
        }
        this.requestUpdate();
        this.updateComplete.then(() => {
            $("select.selectpicker", this).selectpicker("refresh");
        });
    }

    // DEPRECATED
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

    renderVariable(variable, variableSet) {
        let content = "";
        switch (variable.type) {
            case "TEXT":
            case "STRING":
                content = html`<label>${variable.description}</label>
                            <input type="text" class="form-control"
                                placeholder="${variable.id} name" data-variable-id="${variable.id}" data-variable-set-id="${variableSet}"
                                pattern="${variable.attributes && variable.attributes.pattern ? variable.attributes.pattern : null}"
                                aria-describedby="basic-addon1" @input="${this.addInputFilter}" value="${variable.value || ""}" />`;
                break;
            case "NUMERIC":
            case "INTEGER":
            case "DOUBLE":
                content = html`<label>${variable.description}</label>
                            <input type="text" class="form-control"
                                placeholder="${variable.id} number" data-variable-id="${variable.id}" data-variable-set-id="${variableSet}"
                                pattern="^[0-9]+$" @input="${this.addInputFilter}" value="${variable.value || ""}">`;
                break;
            case "CATEGORICAL":
                content = `<select id="${this._prefix}-categorical-selector" class="selectpicker ${variable.id}" multiple @change="${this.addCategoricalFilter}" data-variable-set-id="${variableSet}" data-width="100%">
                ${variable.allowedValues && variable.allowedValues.length && variable.allowedValues.map(item => html`
                    <option value="${item}">${item}</option>
                    `)}
                    </select>`;
                break;
            case "BOOLEAN":
                content = html`
                    <div class="form-check form-check-inline">
                        <input id="${this._prefix}${variable.id}yes" class="form-check-input"
                        type="radio" name="${variable.id}Options" data-value=true @input="${this.addSelectedFilter}">
                        True
                        <input id="${this._prefix}${variable.id}no" class="form-check-input"
                        type="radio" name="${variable.id}Options" data-value=false @input="${this.addSelectedFilter}">
                        False
                    </div>`;
                break;
            default:
                throw new Error("Type not recognized " + variable.type);
        }
        return html`<div>
            <div class="form-group variable">
                ${content}
                <!-- <span class="input-group-addon" @click="${this.onAddAnnotationClicked}"><i class="fas fa-plus"></i></span> -->
                <!--${variable.description ? html`
                    <div class="tooltip-div pull-right">
                        <a tooltip-title="${variable.name}" tooltip-text="${variable.description}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                    </div>` : null}-->
            </div>`;
    }

    getDefaultConfig() {
        return {
            variableSelector: {
                marginLeft: 20,
                marginStep: 15
            },
            class: "",
            buttonClass: "",
            inputClass: "",
            multiSelection: true
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
                font-weight: bold;
                font-size: .9em;
            }
            .variable-set-wrapper {
                padding-bottom: 10px;
            }

            .variable-set-wrapper .variable {
                margin: 15px 0;
            }


        </style>
        <div id="${this._prefix}-main-annotation-filter-div" class="${this._prefix}-annotation-filter-div">
        ${!this.variableSets.length ? html`
            <label>No variableSets defined in the study<label>
        ` : html`
            ${this.variableSets.map(variableSet => html`
                <div class="variable-set-wrapper">
                    <p>${variableSet.description}</p>
                    <select class="selectpicker ovs-list" id="${this._prefix}-annotation-picker-${variableSet.id}" data-live-search="true" data-size="10"
                                @change="${e => this.onChangeSelectedVariable(e, variableSet.id)}" data-width="100%" ?multiple="${this._config.multiSelection}">
                        ${variableSet.variables.map((variable, i) => {
                            return html`
                                <option data-tokens="${variable.tags}" data-index="${i}"
                                        style="padding-left: ${variable.margin}px; cursor: ${variable.cursor};"
                                        ?disabled="${variable.disabled}">
                                    ${variable.id}
                                </option>
                            `;
                        })}
                    </select>
                    ${this.selectedVariables[variableSet.id].map(variable => html`${this.renderVariable(variable, variableSet.id)}`)}
                </div>
            `)}
    </div>
        `}
    `;
    }

}

customElements.define("opencga-annotation-filter-dynamic", OpencgaAnnotationFilterDynamic);
