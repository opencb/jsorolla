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
import UtilsNew from "./../../../utilsNew.js";


export default class FileQualityFilter extends LitElement {

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
            filter: {
                type: String
            },
            depth: {
                type: String
            },
            qual: {
                type: String
            },
            config: {
                type: Object
            },
        };
    }

    _init() {
        this._prefix = "fqf-" + UtilsNew.randomString(6);

        this.values = {};
        this.depths = [
            {id: "5", name: "5x"}, //, selected: true
            {id: "10", name: "10x"},
            {id: "15", name: "15x"},
            {id: "20", name: "20x"},
            {id: "30", name: "30x"},
            {id: "40", name: "40x"},
            {id: "50", name: "50x"},
        ];

        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("filter")) {
            this.querySelector("#" + this._prefix + "FilePassCheckbox").checked = this.filter === "PASS";
        }

        if (changedProperties.has("qual")) {
            if (this.qual && this.qual > 0) {
                this.querySelector("#" + this._prefix + "FileQualCheckbox").checked = true;
                this.querySelector("#" + this._prefix + "FileQualInput").value = this.qual;
                this.qualEnabled = true;
            } else {
                this.querySelector("#" + this._prefix + "FileQualCheckbox").checked = false;
                this.querySelector("#" + this._prefix + "FileQualInput").value = "";
                this.qualEnabled = false;
            }
            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    //NOTE filterChange is called both on checkbox and text field
    filterChange(e) {
        let passChecked = this.querySelector("#" + this._prefix + "FilePassCheckbox").checked;
        if (passChecked) {
            this.values.filter = "PASS";
        } else {
            delete this.values.filter;
        }

        // let qualChecked = this.querySelector("#" + this._prefix + "FileQualCheckbox").checked;
        // let qualValue = this.querySelector("#" + this._prefix + "FileQualInput").value;
        // if (qualChecked && qualValue > 0) {
        //     _value.qual = ">=" + qualValue;
        // }

        this.notifyFilterChange();
    }

    depthFilterChange(e) {
        this.depthChecked = this.querySelector("#" + this._prefix + "FileDepthCheckbox").checked;
        if (this.depthChecked && e.detail) {
            this.values.sampleData = "DP>=" + e.detail.value;
        } else {
            delete this.values.sampleData;
        }
        this.notifyFilterChange();
    }

    notifyFilterChange() {
        this.dispatchEvent(new CustomEvent("filterChange", {
            detail: {
                value: this.values
            },
            bubbles: true,
            composed: true
        }));
    }

    onChangeQualCheckBox(e) {
        this.qualEnabled = e.target.checked;
        this.filterChange(e);
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            hideQuality: true
        };
    }

    render() {
        return html`
            
            <div id="${this._prefix}FilePassCheckboxDiv" class="subsection-content form-group">
                <input id="${this._prefix}FilePassCheckbox" type="checkbox" class="${this._prefix}FilterCheckbox" 
                        @change="${this.filterChange}" .checked="${this.filter === "PASS"}" style="margin-right: 5px">
                <span>Include only <span style="font-weight: bold;">PASS</span> variants</span>
            </div>
            
            <form class="form-horizontal subsection-content">
                <div id="${this._prefix}FileDepthCheckboxDiv" class="subsection-content form-group">
                    <div class="col-md-8">
                        <input id="${this._prefix}FileDepthCheckbox" type="checkbox" class="${this._prefix}FilterCheckbox" 
                                @change="${this.depthFilterChange}" .checked="${this.depth}" style="margin-right: 5px">
                        <span>Select min. <span style="font-weight: bold;">DEPTH</span></span>
                    </div>
                    <div class="col-md-4">
                        <select-field-filter .data="${this.depths}" .value="${this.depth}" @filterChange="${this.depthFilterChange}" ?disabled="${this.depthChecked}"></select-field-filter> 
                    </div>
                </div>
            </form>

            ${this._config.hideQuality === false
                ? html`
                    <form class="form-horizontal subsection-content">
                        <div class="form-group row">
                            <div class="col-md-8">
                                <input id="${this._prefix}FileQualCheckbox" type="checkbox" class="${this._prefix}FilterCheckBox" 
                                        @change="${this.onChangeQualCheckBox}" .checked="${this.qualEnabled}">
                                <span>Introduce min. <span style="font-weight: bold;">QUAL</span></span>
                            </div>
                            <div class="col-md-4">
                                <input id="${this._prefix}FileQualInput" type="number" class="form-control input-sm ${this._prefix}FilterTextInput" .disabled="${!this.qualEnabled}" @input="${this.filterChange}">
                            </div>
                        </div>
                    </form>`
                : null
            }            
        `;
    }

}

customElements.define("file-quality-filter", FileQualityFilter);
