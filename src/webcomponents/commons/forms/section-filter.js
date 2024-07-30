/*
 * Copyright 2015-2024 OpenCB
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

/**
 * This is a wrapper component of a group of filters
* */
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
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    firstUpdated() {
        UtilsNew.initTooltip(this);
    }

    render() {
        const id = this.config.title.replace(/ /g, "");
        return this.config && this.filters?.length > 0 ? html`
            <div class="card shadow-sm" data-cy-section-id="${id}">
                <div class="card-header" role="tab" id="${this._prefix}Heading">
                    <h4 class="card-title">
                        <a class="collapsed text-decoration-none" role="button" data-bs-toggle="collapse" data-parent="#${this._prefix}Accordion" data-cy-section-title="${id}"
                            href="#${this._prefix}" aria-expanded="true" aria-controls="${this._prefix}">
                            ${this.config.title}
                        </a>
                    </h4>
                </div>
                <div class="collapse ${this.config.collapsed ? "" : "show"}" id="${this._prefix}"  role="tabpanel" aria-labelledby="${this._prefix}Heading">
                    <div class="card-body">
                        ${this.filters?.map(filter => html`${filter}`)}
                    </div>
                </div>
            </div>
        ` : "";
    }

}

customElements.define("section-filter", SectionFilter);
