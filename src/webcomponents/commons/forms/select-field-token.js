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
import UtilsNew from "../../../core/utilsNew.js";
import LitUtils from "../utils/lit-utils.js";

/**
 * tokenize version
 * @deprecated
 *
 */
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
            values: {
                type: Array
            },
            disabled: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.disabled = false;
        this.placeholder = "Type something to start";
        this.allowCustomTokens = true;
        this.separators = [",", "-"]; // TODO consider to add blank space
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        $(".tokenize", this).tokenize2({
            placeholder: this._config?.placeholder,
            delimiter: this._config?.separators,
            tokensAllowCustom: this._config?.allowCustomTokens
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

    // NOTE: We MUST use updated() instead of update()here we need to access to DOM in the tokenizeObserver()
    updated(changedProperties) {
        if (this.values && changedProperties.has("values")) {
            this.values.forEach(value => {
                $(".tokenize", this).tokenize2().trigger("tokenize:tokens:add", [value, value, true]);
            });
        }

        if (changedProperties.has("disabled")) {
            this.tokenizeObserver();
        }
    }

    tokenizeObserver() {
        console.log("Updating disabled value:", this.disabled);
        this.querySelector(".tokenize.form-control").disabled = this.disabled;
    }

    onSendValues(e) {
        // name: addItem, addToken or addTags
        const val = $(e.target).val();
        LitUtils.dispatchCustomEvent(this, "addToken", val);
    }

    getDefaultConfig() {
        return {
            placeholder: "Type something to start",
            allowCustomTokens: true,
            separators: [",", "-"] // TODO consider to add blank space
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
