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
import "./opencga-individual-view.js";
import "./../commons/view/detail-tabs.js";

export default class OpencgaIndividualDetail extends LitElement {

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
            individualId: {
                type: Object
            },
            individual: {
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

        if (changedProperties.has("individual")) {

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
        return this.individual ? html`
            <detail-tabs .config="${this._config.detail}" .data="${this.individual}" .opencgaSession="${this.opencgaSession}"></detail-tabs>
        ` : null;
    }

}

customElements.define("opencga-individual-detail", OpencgaIndividualDetail);
