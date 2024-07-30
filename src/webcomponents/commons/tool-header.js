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
import UtilsNew from "../../core/utils-new.js";

export default class ToolHeader extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            subtitle: {
                type: String
            },
            icon: {
                type: String
            },
            class: {
                type: String
            },
            rhs: {
                type: Object
            }
        };
    }

    render() {
        return html`
            <!-- ms-n3 it's a negative margin (it works with sass) -->
            <div class="d-flex align-items-center ms-n3 mt-0 mb-3 p-2  ${this.class ?? ""}" style="background-color:#f5f5f5; margin-right: -0.7rem; margin-left: -1rem;">
                <h1 class="ps-2">
                    ${this.icon ? this.icon.match(/\./)?.length ?
                        html`<img width="50" height="50" src="${this.icon}" alt="${this.title}">` :
                        html`<i class="${this.icon}" aria-hidden="true"></i>` : ""}
                    ${UtilsNew.renderHTML(this.title)}
                </h1>
                ${this.subtitle ? html`<h3>${this.subtitle}</h3>` : null}
                <div class="ms-auto p-2">
                    ${this.rhs}
                </div>
            </div>
        `;
    }

}

customElements.define("tool-header", ToolHeader);
