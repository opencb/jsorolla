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
import LitUtils from "../../commons/utils/lit-utils.js";

export default class AnnotationCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            annotationSet: {
                type: Object
            },
            variableSetIdsSelected: {
                type: Array
            },
            opencgaSession: {
                type: Object
            }
        };
    }

    _init() {
        this.annotationSet = {};
        this.variableSetIds = [];
        this.annotationsElements = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated() {
        this.variableSetObserver();
    }

    update(changedProperties) {
        if (this._variableSetIds && changedProperties.has("variableSetIdsSelected")) {
            this.variableSetIdsObserver();
        }
        super.update(changedProperties);
    }


    variableSetIdsObserver() {
        this.variableSetIds = this._variableSetIds?.filter(variableSetId => !this.variableSetIdsSelected?.includes(variableSetId));
        // console.log("selected", this.variableSetIdsSelected, "result: ", this.variableSetIds);
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    async variableSetObserver() {
        try {
            const resp = await this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn);
            this.variableSets = await resp.responses[0].results;
            this._variableSetIds = this.variableSets.filter(item => !item.internal).map(item => item.id);
            // const annotationSetIdsSelected = this.annotationSets.map(item => item.variableSetId);
            this.variableSetIds = this._variableSetIds.filter(variableSetId => !this.variableSetIdsSelected.includes(variableSetId));
        } catch (error) {
            // TODO: Add Message to notify user;
            // console.log("######ERROR :", error);
        } finally {
            this.refreshForm();
        }
    }

    renderVariables() {
        const variableSorted = this.variableSet?.variables.sort((a, b) => a.rank > b.rank? 1 : -1);
        this.annotationsElements = variableSorted.map(item => {
            return {
                name: item.name,
                field: `annotations.${item.id}`,
                type: "input-text",
                display: {
                    placeholder: item.description,
                }
            };
        });
        this._config = {...this.getDefaultConfig(), ...this.config};
        // console.log("Variables:", this.variableSet);
    }

    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChange(e) {
        // Prevent propagate the function to higher components
        // TODO: Refactor onFieldChange
        e.stopPropagation();
        const [field, prop] = e.detail.param.split(".");
        if (e.detail.value) {
            if (field === "variableSetId") {
                this.getVariablesById(e.detail.value);
                this.annotationSet["annotations"] = {};
            }

            if (field === "annotations") {
                this.annotationSet[field] = {
                    ...this.annotationSet[field],
                    [prop]: e.detail.value
                };
            } else {
                this.annotationSet = {
                    ...this.annotationSet,
                    [field]: e.detail.value
                };
            }
        } else {
            if (prop) {
                delete this.annotationSet[field][prop];
            } else {
                delete this.annotationSet[field];
            }
        }
    }

    getVariablesById(variableId) {
        this.variableSet = this.variableSets.find(item => item.id === variableId);
        //     .variables.sort((a, b) => a.rank > b.rank? 1 : -1);
        this.renderVariables();
    }

    onSendAnnotationSet(e) {
        e.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "addItem", this.annotationSet);
        this.annotationSet = {};
    }

    onClear(e) {
        e.stopPropagation();
        this.annotationSet = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.annotationSet}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendAnnotationSet(e)}">
            </data-form>
    `;
    }

    getDefaultConfig() {
        return {
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: ""
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Id ...",
                            }
                        },
                        {
                            name: "Variable Set Id",
                            field: "variableSetId",
                            type: "select",
                            allowedValues: this.variableSetIds,
                            display: {
                                placeholder: "Name ...",
                            }
                        },
                    ]
                },
                {
                    title: "Annotation Information",
                    display: {
                        visible: annotationSet => annotationSet.variableSetId && this.annotationsElements.length > 0
                    },
                    elements: this.annotationsElements
                }
            ]
        };
    }

}

customElements.define("annotation-create", AnnotationCreate);
