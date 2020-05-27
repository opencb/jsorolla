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
import UtilsNew from "../../../utilsNew.js";
import Pedigree from "../../../visualisation/pedigree.js";


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
        this._prefix = "pr-" + UtilsNew.randomString(6);

        this.pedigreeId = this._prefix + "PedigreeView";
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("family")) {
            //console.error("family", this.family)
            // this._config = {...this.getDefaultConfig(), ...this.config};
            this.pedigreeRender();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.pedigreeRender();
        }
    }

    pedigreeRender() {
        if (!this.family) {
            console.error("Family is empty: " + this.family)
            return;
        }

        if (UtilsNew.isNotUndefined(this.svg) && document.getElementById(this.pedigreeId).hasChildNodes()) {
            document.getElementById(this.pedigreeId).removeChild(this.svg);
        }

        // const family = Object.assign({}, this.clinicalAnalysis.family);
        const family = {...this.family};
        const membersNew =[];

        if (family.members && family.members.length > 0) {
            family.members.forEach(member => {
                const newMember = Object.assign({}, member);
                if (UtilsNew.isNotUndefinedOrNull(newMember.father)) {
                    const newFather = family.members.find(member => {
                        return member.id === newMember.father.id;
                    });
                    if (UtilsNew.isNotUndefinedOrNull(newFather)) {
                        newMember.father = newFather.id;
                    } else {
                        newMember.father = undefined;
                    }
                }

                if (UtilsNew.isNotUndefinedOrNull(newMember.mother)) {
                    const newMother = family.members.find(member => {
                        return member.id === newMember.mother.id;
                    });
                    if (UtilsNew.isNotUndefinedOrNull(newMother)) {
                        newMember.mother = newMother.id;
                    } else {
                        newMember.mother = undefined;
                    }
                }
                membersNew.push(newMember);
            });
            family.members = membersNew;

            // Render new Pedigree
            const querySelector = this.querySelector("#" + this.pedigreeId);
            console.log("document.getElementById(this._prefix + \"PedigreeView\")", this.querySelector("#" + this.pedigreeId))
            const pedigree = new Pedigree(family, {selectShowSampleNames: true});
            this.svg = pedigree.pedigreeFromFamily(pedigree.pedigree, {
                width: this._config.width,
                height: this._config.height
            });
            querySelector.appendChild(this.svg);
        }
        this.requestUpdate();
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

customElements.define("pedigree-view", PedigreeView);
