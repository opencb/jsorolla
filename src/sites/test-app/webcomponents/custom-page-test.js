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
import "../../../webcomponents/commons/layouts/custom-page.js";

class CustomPageTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            page: {
                type: String
            },
        };
    }

    #init() {}

    render() {
        return html`
            <div data-cy="custom-page-container">
                <div class="content" id="custom-page">
                    <custom-page
                        .page="${this.page}"
                        .opencgaSession="${this.opencgaSession}">
                    </custom-page>
                </div>
            </div>
        `;
    }

}

customElements.define("custom-page-test", CustomPageTest);
