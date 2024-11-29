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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";

export default class SectionFilter extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            filters: {
                type: Array,
            },
            config: {
                type: Object,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    firstUpdated() {
        UtilsNew.initTooltip(this);
    }

    render() {
        if (this.config && this.filters?.length > 0) {
            return html`
                <div class="card shadow-sm">
                    <div class="card-body border-bottom py-2 cursor-pointer" data-bs-toggle="collapse" data-bs-target="#${this._prefix}">
                        <span class="fw-bold fs-5">${this.config.title}</span>
                    </div>
                    <div class="collapse ${this.config.collapsed ? "" : "show"}" id="${this._prefix || ""}">
                        <div class="card-body">
                            ${this.filters?.map(filter => html`${filter}`)}
                        </div>
                    </div>
                </div>
            `;
        }

        // no configuration or filters to display
        return nothing;
    }

}

customElements.define("section-filter", SectionFilter);
