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
import UtilsNew from "../../../core/utils-new.js";
import {classMap} from "lit/directives/class-map.js";
import LitUtils from "../utils/lit-utils.js";

/**
 * Token filter. Select2 version with static datasource
 *
 */

export default class SelectTokenFilterStatic extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            config: {
                type: Object
            },
            // the expected format is either an array of string or an array of objects {id, text, [selected:true]}
            data: {
                type: Array
            },
            disabled: {
                type: Boolean
            },
            value: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "select-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        this.initSelect();
    }

    updated(_changedProperties) {
        if (_changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        if (_changedProperties.has("data")) {
            this.initSelect();
        }

        if (_changedProperties.has("value")) {
            this.select.val(null).trigger("change");
            const selection = this.value ? this.value.split(this._config.separator) : null;
            this.select.val(selection).trigger("change");

            // this.select.trigger("change");
        }

    }

    initSelect() {
        this.select = $("#" + this._prefix);
        this.select.select2({
            theme: "bootstrap-5",
            tags: this._config.customTokens,
            multiple: this._config.multiple,
            placeholder: this._config.placeholder,
            minimumInputLength: this._config.minimumInputLength,
            data: this.data,
            dropdownParent: !this.data?.length ? $(".hidden") : null,
            templateResult: item => {
                return item.name ?? item.text;
            },
            templateSelection: item => {
                return item.name ?? item.text;
            }
        })
            .on("select2:select", e => {
                this.filterChange(e);
            })
            .on("select2:unselect", e => {
                this.filterChange(e);
            });
    }

    filterChange(e) {
        const selection = this.select.select2("data").map(el => el.id).join(this._config.separator);
        // console.log("filterChange", selection);
        // const event = new CustomEvent("filterChange", {
        //     detail: {
        //         value: selection
        //     }
        // });
        // this.dispatchEvent(event);
        LitUtils.dispatchCustomEvent(this, "filterChange", selection);
    }

    getDefaultConfig() {
        return {
            limit: 10,
            minimumInputLength: 0,
            maxItems: 0,
            placeholder: "Start typing",
            customTokens: true,
            multiple: true,
            separator: ","
        };
    }

    render() {
        return html`
        <div>
            <select ?disabled=${this.disabled} id="${this._prefix}" class="${classMap({"no-data": !this.data?.length})}" style="width: 100%" @change="${this.filterChange}"></select>
            <div class="hidden"></div>
        </div>
        `;
    }

}

customElements.define("select-token-filter-static", SelectTokenFilterStatic);
