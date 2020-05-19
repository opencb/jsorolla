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
import UtilsNew from "../utilsNew.js";
import Pedigree from "../visualisation/pedigree.js";
import PolymerUtils from "./PolymerUtils.js";

export default class PedigreeComponent extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            data: {
                type: Object
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "pc  -" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        const querySelector = this.querySelector("#" + this._prefix + "PedigreeView");
        const pedigree = new Pedigree(this.data, {selectShowSampleNames: true});
        this.svg = pedigree.pedigreeFromFamily(pedigree.pedigree, {
            width: this._config.width,
            height: this._config.height
        });

        if (UtilsNew.isNotUndefinedOrNull(querySelector)) {
            querySelector.appendChild(this.svg);
        }
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    getDefaultConfig() {
        return {
            width: 640,
            height: 240
        }
    }

    render() {
        return html`
        <div id="${this._prefix}PedigreeView"></div>
        `;
    }
}

customElements.define("pedigree-component", PedigreeComponent);
