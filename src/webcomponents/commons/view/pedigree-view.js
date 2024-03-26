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
import UtilsNew from "../../../core/utils-new.js";
import Pedigree from "../../../core/visualisation/pedigree.js";


export default class PedigreeView extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            family: {
                type: Object
            },
            proband: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.pedigreeId = this._prefix + "PedigreeView";
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("family")) {
            // console.error("family", this.family)
            // this._config = {...this.getDefaultConfig(), ...this.config};
            this.pedigreeRender();
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config
            };
            this.pedigreeRender();
        }
    }

    pedigreeRender() {
        if (!this.family) {
            return console.error("Family is empty: " + this.family);
        }

        if (UtilsNew.isNotUndefined(this.svg) && document.getElementById(this.pedigreeId)?.hasChildNodes()) {
            document.getElementById(this.pedigreeId).removeChild(this.svg);
        }

        if (this.family?.members && this.family.members.length > 0) {
            // Fix members sex --> Pedigree expects a string with the sex, but OpenCGA returns an object
            // See issue https://github.com/opencb/opencga/issues/1855
            const family = {
                ...this.family,
                members: this.family.members.map(member => ({
                    ...member,
                    sex: member?.sex?.id || member?.sex || "UNKNOWN",
                })),
            };

            // Render new Pedigree
            const querySelector = this.querySelector("#" + this.pedigreeId);
            const pedigree = new Pedigree(family, {
                selectShowSampleNames: true,
            });

            this.svg = pedigree.pedigreeFromFamily(pedigree.pedigree, {
                width: querySelector.offsetWidth,
                height: this._config.height,
            });

            querySelector.appendChild(this.svg);
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <div id="${this._prefix}PedigreeView"></div>
        `;
    }

    getDefaultConfig() {
        return {
            width: 700, // this is overwritten by the container div offsetWidth
            height: 240,
        };
    }

}

customElements.define("pedigree-view", PedigreeView);
