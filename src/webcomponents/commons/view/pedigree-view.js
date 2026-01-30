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
            },
            interactive: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.pedigreeId = this._prefix + "PedigreeView";
        this._config = this.getDefaultConfig();
        this._mode = 'view';
        this.pedigreeInstance = null;
    }

    updated(changedProperties) {
        if (changedProperties.has("family")) {
            // console.error("family", this.family)
            // this._config = {...this.getDefaultConfig(), ...this.config};
            this.pedigreeRender();
        }
        if (changedProperties.has("config") || changedProperties.has("interactive")) {
            this._config = {
                ...this.getDefaultConfig(),
                interactive: this.interactive || this.config?.interactive || false,
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
            this.pedigreeInstance = new Pedigree(family, {
                selectShowSampleNames: true,
            });

            this.svg = this.pedigreeInstance.renderPedigree(this.pedigreeInstance.pedigree, {
                width: querySelector.offsetWidth,
                height: this._config.height,
                interactive: this._config.interactive
            });

            // Listen for position changes if interactive
            if (this._config.interactive) {
                this.svg.addEventListener('pedigree:positionChanged', (e) => {
                    // Emit event to parent component
                    this.dispatchEvent(new CustomEvent('familyChanged', {
                        detail: { family: this.pedigreeInstance.pedigree },
                        bubbles: true,
                        composed: true
                    }));
                });

                this.svg.addEventListener('pedigree:dataChanged', (e) => {
                    // Emit event to parent component
                    this.dispatchEvent(new CustomEvent('familyChanged', {
                        detail: { family: this.pedigreeInstance.pedigree },
                        bubbles: true,
                        composed: true
                    }));
                });
            }

            querySelector.appendChild(this.svg);
        }
        this.requestUpdate();
    }

    _setMode(mode) {
        this._mode = mode;
        if (this.pedigreeInstance && this.pedigreeInstance.setMode) {
            this.pedigreeInstance.setMode(mode);
        }
        this.requestUpdate();
    }

    _resetLayout() {
        // Clear all manuallyPositioned flags
        if (this.family?.members) {
            this.family.members.forEach(member => {
                if (member.position) {
                    member.position.manuallyPositioned = false;
                }
            });
        }
        // Re-render with auto-layout
        this.pedigreeRender();
    }

    render() {
        return html`
            ${this._config?.interactive ? html`
                <div class="pedigree-toolbar mb-2" role="group" style="margin-bottom: 10px;">
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button"
                                class="btn btn-outline-secondary ${this._mode === 'drag' ? 'active' : ''}"
                                @click="${() => this._setMode('drag')}"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-arrows-alt"></i> Move
                        </button>
                        <button type="button"
                                class="btn btn-outline-secondary ${this._mode === 'add_marriage' ? 'active' : ''}"
                                @click="${() => this._setMode('add_marriage')}"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-link"></i> Add Marriage
                        </button>
                        <button type="button"
                                class="btn btn-outline-secondary"
                                @click="${() => this._resetLayout()}"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-undo"></i> Reset Layout
                        </button>
                    </div>
                </div>
            ` : ''}
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
