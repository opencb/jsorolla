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
import UtilsNew from "../../utilsNew.js";
import "./opencga-cohort-view.js";
import "./../samples/opencga-sample-grid.js";
import "./../commons/view/detail-tabs.js";

export default class OpencgaCohortDetail extends LitElement {

    constructor() {
        super();
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
            // this is not actually used at the moment
            cohortId: {
                type: Object
            },
            cohort: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if (changedProperties.has("cohort")) {
            console.log("cohort changed", this.cohort)
        }

        if (changedProperties.has("activeTab")) {
            console.log("activeTab")
        }
    }

    getDefaultConfig() {
        return {
        };
    }

    render() {
        return this.cohort ? html`
            <detail-tabs .config="${this._config.detail}" .data="${this.cohort}" .opencgaSession="${this.opencgaSession}"></detail-tabs>
        ` : null;
    }

}

customElements.define("opencga-cohort-detail", OpencgaCohortDetail);
