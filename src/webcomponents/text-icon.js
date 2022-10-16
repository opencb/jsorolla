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
import UtilsNew from "../core/utils-new.js";

export default class TextIcon extends LitElement {

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
            acronym: {
                type: String
            },
            color: {
                type: String
            }
        }
    }

    render() {
        return html`
            <div class="text-icon ${this.color ?? ""}">
                ${this.acronym ? this.acronym : this.title[0] + this.title[1] + this.title[2].toLowerCase()}
            </div>
        `;
    }
}

customElements.define("text-icon", TextIcon);
