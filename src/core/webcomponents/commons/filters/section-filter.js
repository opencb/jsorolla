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
            config: {
                type: Object
            },
            filters: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "sf-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this.id = this.config.title.replace(/ /g, "");
    }

    render() {
        return this.config ? html`
                <div class="panel panel-default filter-section shadow-sm">
                    <div class="panel-heading" role="tab" id="${this._prefix}${this.id}Heading">
                            <h4 class="panel-title">
                                <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                    href="#${this._prefix}${this.id}" aria-expanded="true" aria-controls="${this._prefix}${this.id}">
                                    ${this.config.title}
                                </a>
                            </h4>
                    </div>
                    <div id="${this._prefix}${this.id}" class="panel-collapse collapse ${this.config.collapsed ? "" : "in"}" role="tabpanel" aria-labelledby="${this._prefix}${this.id}Heading">
                        <div class="panel-body">
                            ${this.filters.map( filter => html`${filter}`)}
                        </div>
                    </div>
                </div>                    
        ` : html`<div>No config</div>`;
    }
}

customElements.define("section-filter", SectionFilter);
