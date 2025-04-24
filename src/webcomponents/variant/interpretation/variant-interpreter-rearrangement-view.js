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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import ExtensionsManager from "../../extensions-manager.js";
import "../../commons/forms/data-form.js";
import "../../commons/json-viewer.js";
import "../variant-notes.js";

export default class VariantInterpreterRearrangementView extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            toolId: {
                type: String,
            },
            variants: {
                type: Object
            },
            variantIds: {
                type: String
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "";
        this._variants = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolId") && this.toolId) {
            this.COMPONENT_ID = this.toolId + "-view";
        }

        if (changedProperties.has("variantIds")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("variants")) {
            this.variantObserver();
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("toolId")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.opencgaSession && this.variantIds) {
            this.opencgaSession.opencgaClient.clinical()
                .queryVariant({
                    study: this.opencgaSession.study.fqn,
                    id: this.variantIds.join(","),
                    includeSampleId: "true",
                })
                .then(response => {
                    this._variants = response?.responses?.[0]?.results;
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    variantObserver() {
        this._variants = UtilsNew.objectClone(this.variants);
    }

    render() {
        if (!this.opencgaSession || !this._variants) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._variants}"
                .config="${this._config}"
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "tabs",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "notes-variant1",
                    name: "Variant 1 Notes",
                    render: (variants, active) => html`
                        <variant-notes
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${variants?.[0]}"
                            .active="${active}">
                        </variant-notes>
                    `,
                },
                {
                    id: "notes-variant2",
                    name: "Variant 2 Notes",
                    render: (variants, active) => html`
                        <variant-notes
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${variants?.[1]}"
                            .active="${active}">
                        </variant-notes>
                    `,
                },
                {
                    id: "json-view-variant1",
                    name: "Variant 1 JSON Data",
                    render: (variants, active) => html`
                        <json-viewer
                            .data="${variants?.[0]}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                {
                    id: "json-view-variant2",
                    name: "Variant 2 JSON Data",
                    render: (variants, active) => html`
                        <json-viewer
                            .data="${variants?.[1]}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID),
            ],
        };
    }

}

customElements.define("variant-interpreter-rearrangement-view", VariantInterpreterRearrangementView);
