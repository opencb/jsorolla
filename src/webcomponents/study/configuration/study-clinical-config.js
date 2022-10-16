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
import "./config-list-update.js";
import UtilsNew from "../../../core/utils-new.js";

export default class StudyClinicalConfig extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalConfig: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    _init() {
        // console.log("init study clinical config");
        // console.log("study selected ", this.study);
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateParams = {};
        this._config = {...this.getDefaultConfig()};
        // console.log("config study", this.clinicalConfig);
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalConfig")) {
            // console.log("copy internal clinicalConfig");
            this.clinicalConfigObserver();
        }
        super.update(changedProperties);
    }

    clinicalConfigObserver() {
        if (this.clinicalConfig) {
            this._clinicalConfig = JSON.parse(JSON.stringify(this.clinicalConfig));
        }
    }

    onSubmit() {
        // analysis/clinical/clinical/configuration/update
        console.log("onSubmit ", this.clinicalConfig);
    }

    onClear() {

    }

    onSyncItem(e) {
        e.stopPropagation();
        console.log("Updated: ", e.detail.value);
        const {index, node, item} = e.detail.value;

        if (index === -1) {
            console.log("Test New Item:", node);
            switch (node.parent) {
                case "interpretation":
                    this.clinicalConfig[node.parent]["status"][node.child].push(item);
                    break;
                case "priorities":
                    this.clinicalConfig[node.parent].push(item);
                    break;
                case "consent":
                    this.clinicalConfig[node.parent]["consents"].push(item);
                    break;
                default:
                    this.clinicalConfig[node.parent][node.child].push(item);
                    break;
            }
        }

        // trigger update
        this.clinicalConfig = {
            ...this.clinicalConfig
        };
    }

    onSyncRemoveItem(e) {
        e.stopPropagation();
        const {node, items} = e.detail.value;
        switch (node.parent) {
            case "interpretation":
                // const interpretations = this.clinicalConfig.interpretation.status[node.child];
                // this.clinicalConfig.interpretation.status[node.child] = UtilsNew.removeArrayByIndex(interpretations, item.index);
                this.clinicalConfig.interpretation.status[node.child] = items;
                break;
            case "priorities":
                // const priorities = this.clinicalConfig[node.parent];
                // this.clinicalConfig[node.parent] = UtilsNew.removeArrayByIndex(priorities, item.index);
                this.clinicalConfig[node.parent] = items;
                break;
            case "consent":
                // const consents = this.clinicalConfig.consent.consents;
                // this.clinicalConfig.consent.consents = UtilsNew.removeArrayByIndex(consents, item.index);
                this.clinicalConfig.consent.consents = items;
                break;
            default:
                // const items = this.clinicalConfig[node.parent][node.child];
                // this.clinicalConfig[node.parent][node.child] = UtilsNew.removeArrayByIndex(items, item.index);
                this.clinicalConfig[node.parent][node.child] = items;
                break;
        }

        // trigger update!
        this.clinicalConfig = {
            ...this.clinicalConfig
        };
    }

    configClinical(key, item, modal) {

        // DEPRECATED
        // const configModal = isNew => {
        //     return isNew ? {
        //         type: "modal",
        //         title: "Add Config",
        //         buttonStyle: "margin-top:6px"
        //     } : {
        //         type: "modal",
        //         title: "Edit Config",
        //         item: {
        //             title: item?.title,
        //             subtitle: item?.subtitle
        //         },
        //         buttonClass: "pull-right",
        //         btnGroups: [
        //             {
        //                 title: "Edit",
        //                 openModal: true,
        //             },
        //             {
        //                 title: "Delete",
        //                 btnClass: "btn-danger",
        //                 event: "removeItem"
        //             }
        //         ]
        //     };
        // };

        const configSection = key => {
            switch (key) {
                case "clinical":
                case "interpretation":
                case "flags":
                    return {
                        elements: [
                            {
                                title: "Id",
                                field: "id",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                title: "Description",
                                field: "description",
                                type: "input-text",
                                display: {
                                    rows: 3,
                                    placeholder: "Add a description..."
                                }
                            },
                        ]
                    };
                case "priorities":
                    return {
                        elements: [
                            {
                                title: "Id",
                                field: "id",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                title: "Description",
                                field: "description",
                                type: "input-text",
                                display: {
                                    rows: 3,
                                    placeholder: "Add a description..."
                                }
                            },
                            {
                                title: "Rank",
                                field: "rank",
                                type: "input-text",
                            },
                            {
                                title: "Default priority",
                                field: "defaultPriority",
                                type: "checkbox",
                            },
                        ]
                    };
                case "consent":
                    return {
                        elements: [
                            {
                                title: "Id",
                                field: "id",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                title: "Name",
                                field: "name",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                title: "Description",
                                field: "description",
                                type: "input-text",
                                display: {
                                    rows: 3,
                                    placeholder: "Add a description..."
                                }
                            },
                        ]
                    };
            }
        };

        const configForm = (key, isNew) => {
            return {
                title: isNew ? "Add Config" :"Edit",
                type: modal ? "modal" :"",
                icon: isNew ? "fas fa-cogs":"fas fa-edit",
                display: {
                    buttonOkText: "Save",
                    buttonClearText: "Cancel",
                    buttonsVisible: true,
                    buttonsLayout: false,
                    buttonsClassName: "btn btn-primary",
                    modalButtonClassName: !isNew?"btn-sm":"",
                    modalButtonStyle: isNew ? "margin-top:6px":"",
                    titleWidth: 3,
                    titleAlign: "right",
                    defaultLayout: "horizontal",
                    defaultValue: ""
                },
                sections: [configSection(key)]
            };
        };

        if (key.constructor === Array) {
            const configs = {};
            key.forEach(key => {
                configs[key] = {
                    ...configs[key],
                    edit: configForm(key, false),
                    new: configForm(key, true)
                };
            });
            return configs;
        }

        return {
            edit: configForm(key, false),
            new: configForm(key, true)
        };
    }

    getDefaultConfig() {
        return {
            type: "form",
            display: {
                buttonOkText: "Update",
                buttonClearText: "Cancel",
                buttonsVisible: false,
                buttonsLayout: false,
                buttonsWidth: 8,
                style: "margin: 10px",
                titleWidth: 3,
                titleAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
            },
            sections: [
                {
                    title: "Clinical Status",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                contentLayout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <config-list-update
                                        key="status"
                                        .items="${clinical.status}"
                                        .config=${this.configClinical("clinical", {title: "id", subtitle: "description"}, true)}
                                        @changeItem=${e => this.onSyncItem(e)}
                                        @removeItem=${e => this.onSyncRemoveItem(e)}>
                                    </config-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Interpretation Status",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                contentLayout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <config-list-update
                                        key="interpretation"
                                        .items="${clinical.interpretation.status}"
                                        .config=${this.configClinical("interpretation", {title: "id", subtitle: "description"}, true)}
                                        @changeItem=${e => this.onSyncItem(e)}
                                        @removeItem=${e => this.onSyncRemoveItem(e)}>
                                    </config-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Priorities",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                contentLayout: "vertical",
                                defaultLayout: "vertical",
                                width: 8,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <config-list-update
                                        key="priorities"
                                        .items="${clinical.priorities}"
                                        .config=${this.configClinical("priorities", {title: "id", subtitle: "description"}, true)}
                                        @changeItem=${e => this.onSyncItem(e)}
                                        @removeItem=${e => this.onSyncRemoveItem(e)}>
                                    </config-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "flags",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                contentLayout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <config-list-update
                                        key="flags"
                                        .items="${clinical.flags}"
                                        .config=${this.configClinical("flags", {title: "id", subtitle: "description"}, true)}
                                        @changeItem=${e => this.onSyncItem(e)}
                                        @removeItem=${e => this.onSyncRemoveItem(e)}>
                                    </config-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "consent",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                contentLayout: "vertical",
                                defaultLayout: "vertical",
                                width: 8,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <config-list-update
                                        key="consent"
                                        .items="${clinical.consent.consents}"
                                        .config=${this.configClinical("consent", {title: "id", subtitle: "description"}, true)}
                                        @changeItem=${e => this.onSyncItem(e)}
                                        @removeItem=${e => this.onSyncRemoveItem(e)}>
                                    </config-list-update>`
                            }
                        },
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <!-- <div class="guard-page">
                <i class="fas fa-pencil-ruler fa-5x"></i>
                <h3>Clinial Config under construction</h3>
                <h3>(Coming Soon)</h3>
            </div> -->

            <div style="margin: 25px 40px">
                <data-form
                    .data=${this.clinicalConfig}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
                </data-form>
            </div>
        `;
    }

}

customElements.define("study-clinical-config", StudyClinicalConfig);
