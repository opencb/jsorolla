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

import {LitElement, html} from "/web_modules/lit-element.js";
import "./opencga-analysis-tool-form.js";

export default class OpencgaAnalysisTool extends LitElement {

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
            }
        }
    }

    _init() {
        this._prefix = "oat-" + Utils.randomString(6);
    }

    updated(changedProperties) {

    }

    render() {
        return html`
           <div>
                <h1>${this.config.id}</h1>
           </div>
           
           <opencga-analysis-tool-form .config="${this.config.form}"></opencga-analysis-tool-form>
        `;
    }
}

customElements.define('opencga-analysis-tool', OpencgaAnalysisTool);
