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

import { html, LitElement } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";

export default class StudyAdmin extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            },
            study: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    // update(changedProperties) {

    //     super.update(changedProperties);
    // }


    getDefaultConfig() {
        return {
            title: "Study Admin",
            icon: "variant_browser.svg",
            active: false
        };
    }


    render() {
        return html`
        <!-- Admin Screen , a little sample -->
            <div class="row">
                <div class="col-md-2 text-center" style="border: 1px solid black; height:60em">
                    Sidebar
                    <!-- TODO: build a menu of tools (Job, File, Sample, Individual, Family....) -->
                </div>
                <div class="col-md-10 text-center">
                <!-- TODO: Overview Module -->
                    Content Module    
                </div>
            </div>`;
    }
}

customElements.define("study-admin", StudyAdmin);
