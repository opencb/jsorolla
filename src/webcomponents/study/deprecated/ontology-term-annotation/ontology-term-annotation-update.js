/**
 * Copyright 2015-2021 OpenCB
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
import UtilsNew from "../../../../core/utilsNew.js";
import LitUtils from "../../../commons/utils/lit-utils.js";
import FormUtils from "../../../commons/forms/form-utils.js";
import Types from "../../../commons/types.js";

export default class OntologyTermAnnotationUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            ontology: {
                type: Object
            },
            ontologyId: {
                type: String
            },
            displayConfig: {
                type: Object
            }
        };
    }

    _init() {
        this.displayConfigDefault = {
            buttonsAlign: "right",
            buttonClearText: "Clear",
            buttonOkText: "Create Ontology Term",
            titleVisible: false,
            titleWidth: 4,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        // To avoid override data
        if (changedProperties.has("ontology")) {
            this.ontologyObserver();
        }
    }

    update(changedProperties) {
        /*
        *    if (changedProperties.has("ontology")) {
        *        this.ontologyObserver();
        *    }
        */

        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    ontologyObserver() {
        if (this.ontology) {
            this._ontology = UtilsNew.objectClone(this.ontology);
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
        // No need to switch(field) since all of them are processed in the same way
        this.data = FormUtils.updateScalarParams(
            this._ontology,
            this.ontology,
            this.data?.updateParams,
            e.detail.param,
            e.detail.value);

        LitUtils.dispatchCustomEvent(this, "fieldChange", {...this.data?.updateParams}, null, null, {bubbles: false, composed: true});
        // to reflect which field is updating...
        this.requestUpdate();
    }

    onSendOntology(e) {
        // Send the ontology to the upper component
        e.stopPropagation();
        this.updateParams = {};
        this.ontology = {...this.data?.original};
        this.data = {};
        LitUtils.dispatchCustomEvent(this, "updateItem", this.ontology);
    }

    onClear(e) {
        e.stopPropagation();
        this.ontology = JSON.parse(JSON.stringify(this._ontology));
        this.updateParams = {};
        this.data = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data="${this.ontology}"
                .config="${this._config}"
                .updateParams="${this.data?.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendOntology(e)}">
            </data-form>
        `;
    }

    _configOntology(entity) {
        switch (entity) {
            case "phenotype":
                return [
                    {
                        name: "Age of onset",
                        field: "ageOfOnset",
                        type: "input-num",
                        display: {
                            placeholder: "Add an age of on set..."
                        }
                    },
                    {
                        name: "Status",
                        field: "status",
                        type: "select",
                        allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                        display: {
                            placeholder: "Select a status..."
                        }
                    }];
            default:
                return [];
        }
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            name: "ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "add short id",
                                // disabled: true,
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "add a name"
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "add a source"
                            }
                        },
                        ...this._configOntology(this.entity),
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description..."
                            }
                        }
                    ]
                }
            ]
        });
    }

}

customElements.define("ontology-term-annotation-update", OntologyTermAnnotationUpdate);
