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
import UtilsNew from "../../../core/utils-new.js";
import FormUtils from "../../commons/forms/form-utils.js";

export default class AnnotationUpdate extends LitElement {

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


    update(changedProperties) {

        if (changedProperties.has("annotationSet")) {
            this.annotationSetObserver();
        }

        if (UtilsNew.isNotEmpty(this.annotationSet) && changedProperties.has("annotationSet")) {
            this.variableSetObserver().then(() =>{
                this.getVariablesById(this.annotationSet.variableSetId);
            });
        }

        if (this._variableSetIds && changedProperties.has("variableSetIdsSelected")) {
            this.variableSetIdsObserver();
        }


        super.update(changedProperties);
    }


    variableSetIdsObserver() {
        this.variableSetIds = this._variableSetIds?.filter(variableSetId => !this.variableSetIdsSelected.includes(variableSetId));
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    async variableSetObserver() {
        try {
            const resp = await this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn);
            this.variableSets = await resp.responses[0].results;
            this._variableSetIds = this.variableSets.filter(item => !item.internal).map(item => item.id);
            this.variableSetIds = this._variableSetIds;
        } catch (error) {
            // TODO: Add Message to notify user;
            console.log("######ERROR :", error);
        } finally {
            this.refreshForm();
        }
    }

    annotationSetObserver() {
        if (this.annotationSet) {
            this._annotationSet = JSON.parse(JSON.stringify(this.annotationSet));
        }
    }


    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChange(e) {
        e.stopPropagation();
        const field = e.detail.param.split(".")[0];
        if (field === "annotation") {
            this.updateParams = FormUtils.updateObjectWithProps(
                this._annotationSet,
                this.annotationSet,
                this.updateParams,
                e.detail.param,
                e.detail.value
            );
            this.annotationSet["annotation"] = {
                ...this.annotationSet["annotation"],
                ...this.updateParams["annotation"]};
            this.requestUpdate();
        }
    }

    getVariablesById(variableId) {
        this.variableSet = this.variableSets.find(item => item.id === variableId);
        //     .variables.sort((a, b) => a.rank > b.rank? 1 : -1);
        this.renderVariables();
    }

    onSendAnnotationSet(e) {
        e.stopPropagation();
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "addItem", this.annotationSet);
    }

    onClear(e) {
        e.stopPropagation();
        this.annotationSet = JSON.parse(JSON.stringify(this._annotationSet));
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    renderVariables() {
        const variableSorted = this.variableSet?.variables.sort((a, b) => a.rank > b.rank? 1 : -1);
        this.annotationsElements = variableSorted.map(item => {
            return {
                name: item.name,
                field: `annotation.${item.id}`,
                type: "input-text",
                display: {
                    placeholder: item.description,
                }
            };
        });
        this.refreshForm();
    }

    render() {
        return html`
                <data-form
                    .data=${this.annotationSet}
                    .config="${this._config}"
                    .updateParams=${this.updateParams}
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${e => this.onSendAnnotationSet(e)}">
                </data-form>
    `;
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
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
                                disabled: true,
                                placeholder: "Id ...",
                            }
                        },
                        {
                            name: "Variable Set Id",
                            field: "variableSetId",
                            type: "select",
                            allowedValues: this.variableSetIds,
                            display: {
                                disabled: true,
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

customElements.define("annotation-update", AnnotationUpdate);
