/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement} from "lit";
import "../commons/json-editor.js";

export default class RestResult extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            result: {
                type: Object,
            },
        };
    }

    #init() {

    }
    update(changedProperties) {
        super.update(changedProperties);
    }

    render() {
        if (!this.result) {
            return;
        }
        return html`
            <!-- Results Section-->
            <div style="padding: 5px 10px">
                <h3>Results</h3>
                <div style="padding: 20px">
                    ${this.isLoading ? html`
                        <loading-spinner></loading-spinner>
                    ` : html`
                        <json-editor
                            .data="${this.result}"
                            .config="${{readOnly: true}}">
                        </json-editor>
                    `}
                </div>
            </div>
        `;
    }

}

customElements.define("rest-result", RestResult);
