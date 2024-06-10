/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html, nothing} from "lit";
import "../../../commons/forms/select-field-filter.js";
import UtilsNew from "../../../../core/utils-new.js";
import LitUtils from "../../../commons/utils/lit-utils";

export default class UserStatusFilter extends LitElement {

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
            status: {
                type: Object,
            },
            config: {
                type: Array
            },
            disabled: {
                type: Boolean
            },
        };
    }

    _init() {
        this.disabled = false;
    }

    onFilterChange(e) {
        LitUtils.dispatchCustomEvent(this, "filterChange", e.currentTarget.value);
    }

    render() {
        debugger
        return html`
            <div class="btn-group" role="group">
            ${this.config.map(status => html`
                ${status.isSelectable ? html`
                    <input
                        type="radio"
                        class="btn-check"
                        name="user-status-option"
                        id="user-status-option-${status.id.toLowerCase()}"
                        autocomplete="off"
                        @input="${e => this.onFilterChange(e)}"
                        value="${status.id}"
                        ?checked="${status.id === this.status}">
                    <label
                        class="btn ${status.displayOutline}"
                        for="user-status-option-${status.id.toLowerCase()}">
                        ${status.displayLabel}
                    </label>
                `: nothing}
            `)}
            </div>
        `;
    }

}

customElements.define("user-status-filter", UserStatusFilter);
