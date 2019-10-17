/**
 * Created by Antonio Altamura on 08/10/2019.
 */

import {LitElement, html} from '/web_modules/lit-element.js';

class OpencgaVariableSelector extends LitElement {
    constructor() {
        super()
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variableSet: {
                type: Array
            },
            selected: {
                type: Array
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this.prefix = "ovs-" + Utils.randomString(6);
        this.variables = [];
        this._config = this.getDefaultConfig();
    }

    //TODO adapt observer
    static get observers() {
        return [
            'onVariableSetConfigChange(variableSet, config)'
        ]
    }

    connectedCallback() {
        super.connectedCallback();

        if (!this._config.multiSelection) {
            // Select first allowed variable by default
            for (let variable of this.variables) {
                if (!variable.disabled) {
                    $(`#${this.prefix}-annotation-picker`).find(".selectpicker").selectpicker('deselectAll');
                    this.dispatchEvent(new CustomEvent('variablechange', {
                            detail: {
                                value: [variable]
                            }
                        }
                    ));
                    return;
                }
            }
        }
    }

    onVariableSetConfigChange(variableSet, config) {
        this._config = Object.assign({}, this.getDefaultConfig(), config);

        let customConfig = {
            onlyAllowLeafSelection: this._config.onlyAllowLeafSelection
        };

        if (UtilsNew.isNotUndefinedOrNull(variableSet)) {
            this.variables = CatalogUIUtils.parseVariableSetVariablesForDisplay(variableSet.variables, [], 25,
                customConfig);
        }
    }

    renderDomRepeat(e) {
        let mainDiv = $(`#${this.prefix}-main-div`);

        let selectpicker = mainDiv.find(".selectpicker");
        selectpicker.selectpicker('refresh');
        selectpicker.selectpicker('deselectAll');

        // // Add the class to the select picker buttons
        // selectpicker.selectpicker('setStyle', this._config.buttonClass, 'add');
        // // Add the class to the lists
        // mainDiv.find("ul > li").addClass(this._config.class);
    }

    onChangeSelectedVariable(e) {
        let selectedVariables = [];
        for (let i = 0; i < e.currentTarget.selectedOptions.length; i++) {
            selectedVariables.push(e.currentTarget.selectedOptions[i].dataVariable);
        }

        this.dispatchEvent(new CustomEvent('variablechange', {detail: {value: selectedVariables}}));
    }

    resetSelection(e) {
        let mainDiv = $(`#${this.prefix}-main-div`);
        let selectpicker = mainDiv.find(".selectpicker");

        selectpicker.selectpicker('refresh');
        selectpicker.selectpicker('deselectAll');
    }

    getDefaultConfig() {
        return {
            title: "Select variable and value(s)",
            multiSelection: false, // Select multiple fields
            onlyAllowLeafSelection: true, // Only allow leaf selection
            showResetButton: false,

            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        }
    }
    render() {
        return html`
       <style>
        .ovs-list li.selected {
            background-color: #cdcdcd;
        }
    </style>

        <div id="${this.prefix}-main-div">
            ${ variables.length ? html`
                <label for="${this.prefix}-annotation-picker" style="margin-top: 15px;">${this._config.title}</label>

                <form class="form-inline">
                    <div class="form-group" style="width: 80%">
                        <select class="selectpicker ovs-list" id="${this.prefix}-annotation-picker" data-live-search="true" data-size="10"
                                @change="${this.onChangeSelectedVariable}" data-width="100%" multiple$="${this._config.multiSelection}">
                                <!-- FIXME on-dom-change-->
                            ${this.variables.map( variable => html`
                            <div items="${variables}" as="variable" on-dom-change="renderDomRepeat" restamp="true">
                                <option data-tokens="${variable.tags}" data-variable="${variable}"
                                        style="padding-left: ${variable.margin}px; cursor: ${variable.cursor};"
                                        disabled="${variable.disabled}">
                                    ${variable.name}
                                </option>
                            </div>`)}
                        </select>
                    </div>
                    ${this._config.showResetButton ? html`<button type="button" class="btn btn-primary" @click="${this.resetSelection}">Reset</button>` : null}
                </form>` : null}
        </div>`;
    }
}

customElements.define('opencga-variable-selector', OpencgaVariableSelector);
