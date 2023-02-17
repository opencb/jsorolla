
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


import "../../../webcomponents/commons/forms/data-form.js";
import {DATA_FORM_EXAMPLE} from "../conf/data-form.js";
import {SAMPLE_DATA} from "../data/data-example.js";

class DataFormTest extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.dataTest = {...SAMPLE_DATA};
        this._dataFormConfig = DATA_FORM_EXAMPLE;
    }

    onFieldChange(e) {
        this.dataTest = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onSubmit(e) {
        console.log("Data Test", this.dataTest);
        console.log("Data form Data", e);
        console.log("test input", e);
    }

    render() {
        return html`
            <data-form
                .data="${this.dataTest}"
                .config="${this._dataFormConfig}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

}

customElements.define("data-form-test", DataFormTest);
