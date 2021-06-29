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
import UtilsNew from "../../../utilsNew.js";
import LitUtils from "../utils/lit-utils.js";

export default class SelectFieldToken extends LitElement {

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
            configToken: {
                type: Object
            },
            values: {
                type: Array
            },
            disabled: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.disabled = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        console.log("Updating select field token", this.configToken);
        $(".tokenize", this).tokenize2({
            placeholder: this.configToken?.placeholder,
            delimiter: this.configToken?.delimiter,
            tokensAllowCustom: this.configToken?.tokensAllowCustom,
            disabled: true
        });

        $(".tokenize", this).on("tokenize:tokens:added", (e, value, text) => {
            console.log("added", e, value, text);
            console.log("added list", $(e.target).val());
            console.log("added list x", e.target.value);
            this.onSendValues(e);
        });

        $(".tokenize", this).on("tokenize:tokens:remove", (e, value) => {
            console.log("removed", e, value);
            console.log("removed list", $(e.target).val());
            this.onSendValues(e);
        });
    }

    tokenizeObserver() {
        console.log("Updating disabled value:", this.disabled);
        this.querySelector(".tokenize.form-control").disabled = this.disabled;
    }

    updated(_changedProperties) {
        if (this.values && _changedProperties.has("values")) {
            console.log("Passing values");
            this.values.forEach(value => {
                $(".tokenize", this).tokenize2().trigger("tokenize:tokens:add", [value, value, true]);
            });
        }

        if (_changedProperties.has("disabled")) {
            this.tokenizeObserver();
        }
    }

    onSendValues(e) {
        // name: addItem, addToken or addTags
        const val = $(e.target).val();
        LitUtils.dispatchEventCustom(this, "addToken", val);
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0
        };
    }

    // it silently clear the input field without triggering
    // tokenize:tokens:remove which fire the filterChange
    silentClear() {
        // $("select.tokenize").empty()
        $(".tokens-container li.token").remove();
        $(".tokens-container li.placeholder").show();
    }

    render() {
        return html`
        <div id="${this._prefix}-wrapper">
            <select class="tokenize form-control" multiple></select>
        </div>
        `;
    }

}

customElements.define("select-field-token", SelectFieldToken);
