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
import UtilsNew from "../../core/utilsNew.js";
import FormUtils from "../commons/forms/form-utils.js";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/ontology-term-annotation/ontology-term-annotation-create.js";
import "../study/ontology-term-annotation/ontology-term-annotation-update.js";


export default class DiseasePanelCreate extends LitElement {

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
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
        this.diseasePanel = {
            // disorders: [
            //     {
            //         id: "disease",
            //     }
            // ],
            // variants: [
            //     {
            //         id: "1:1:A:T",
            //         reference: "A",
            //         alternate: "T"
            //     }
            // ]
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.diseasePanel = {
                ...FormUtils.createObject(
                    this.diseasePanel,
                    param,
                    e.detail.value,
                )};
        }
        // this.opencgaSession.cellbaseClient.get("feature", "gene", )
        this.requestUpdate();
    }

    onClear(e) {
        this.diseasePanel = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        this.opencgaSession.opencgaClient.panels()
            .create(this.diseasePanel, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.diseasePanel = {};
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Disease Panel",
                    message: "New Disease Panel created correctly"
                });
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    onAddOrUpdateItem(e) {
        const param = e.detail.param;
        const value = e.detail.value;
        if (UtilsNew.isNotEmpty(value)) {
            switch (param) {
                case "disorders":
                    this.diseasePanel = {...this.diseasePanel, disorders: value};
                    break;
                case "phenotypes":
                    this.diseasePanel = {...this.diseasePanel, phenotypes: value};
                    break;
            }
        } else {
            this.diseasePanel = {
                ...this.diseasePanel,
                [param]: []
            };
            delete this.diseasePanel[param];
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.diseasePanel}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @addOrUpdateItem="${e => this.onAddOrUpdateItem(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }


    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Create",
                titleWidth: 3,
                width: "8",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            // validation: {
            //     validate: individual => (UtilsNew.isEmpty(individual.father) || UtilsNew.isEmpty(individual.mother)) || individual.father !== individual.mother,
            //     message: "The father and mother must be different individuals",
            // },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.diseasePanel).length > 0,
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Disease Panel ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add a disease panel ID"
                                }
                            }
                        },
                        {
                            title: "Disease Panel Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the diseae panel name..."
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add a description...",
                                rows: 3,
                            }
                        },
                        {
                            title: "Source",
                            field: "source",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "source.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel name...",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "source.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel name..."
                                    }
                                },
                                {
                                    title: "Version",
                                    field: "source.version",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel version...",
                                    }
                                },
                                {
                                    title: "Author",
                                    field: "source.author",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel author name...",
                                    }
                                },
                                {
                                    title: "Project",
                                    field: "source.project",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel project name...",
                                    }
                                }
                            ]
                        },
                    ]
                },
                // {
                //     title: "Disorders",
                //     elements: [
                //         {
                //             title: "Disorder",
                //             field: "disorders",
                //             type: "custom-list",
                //             display: {
                //                 style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                //                 collapsedUpdate: true,
                //                 renderUpdate: (disorder, callback) => html`
                //                     <ontology-term-annotation-update
                //                         .ontology="${disorder}"
                //                         .entity="${"disorder"}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Save",
                //                             buttonClearText: "",
                //                         }}"
                //                         @updateItem="${callback}">
                //                     </ontology-term-annotation-update>
                //                 `,
                //                 renderCreate: (disorder, callback) => html`
                //                     <label>Create new item</label>
                //                     <ontology-term-annotation-create
                //                         .entity="${"disorder"}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Add",
                //                             buttonClearText: "",
                //                         }}"
                //                         @addItem="${callback}">
                //                     </ontology-term-annotation-create>
                //                 `
                //             }
                //         },
                //     ]
                // },
                {
                    title: "Variants",
                    elements: [
                        {
                            title: "Variants",
                            field: "variants",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: variant => html`
                                    <div>${variant.id} - ${variant?.modeOfInheritance}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Variant ID",
                                    field: "variants[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add variant ID...",
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "variants[].modeOfInheritance",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add mode of inheritance...",
                                    }
                                },
                                {
                                    title: "Confidence",
                                    field: "variants[].confidence",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add confidence...",
                                    }
                                }
                            ]
                        },
                    ]
                },
                {
                    title: "Genes",
                    elements: [
                        {
                            title: "Genes",
                            field: "genes",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: gene => html`
                                    <div>
                                        ${gene.id} - ${gene?.modeOfInheritance}
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Variant ID",
                                    field: "genes[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add variant ID...",
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "genes[].modeOfInheritance",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add mode of inheritance...",
                                    }
                                },
                                {
                                    title: "Confidence",
                                    field: "genes[].confidence",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add confidence...",
                                    }
                                }
                            ]
                        },
                    ]
                },
            ]
        });
    }

}

customElements.define("disease-panel-create", DiseasePanelCreate);
