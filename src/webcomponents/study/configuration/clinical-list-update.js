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
import "../../commons/forms/text-field-filter.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import DetailTabs from "../../commons/view/detail-tabs.js";

export default class ClinicalListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            entity: {
                type: String
            },
            items: {
                type: Array
            },
            tabs: {
                type: Boolean
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.tabs) {
            this._config = {...this.getDefaultConfig()};
        }

        if (UtilsNew.isUndefined(this.items)) {
            this.items = [];
        }
    }

    _init() {
        this.status = {};
        this._prefix = UtilsNew.randomString(8);
    }


    onCloseForm(e) {
        e.stopPropagation();
        this.phenotype = {};
        $("#phenotypeManagerModal"+ this._prefix).modal("hide");
    }

    // TODO: Refactor
    configClinical(isNew, entity) {

        // TODO
        // Save by each config or save by all things

        // Conditions
        // 2 Fields, - done
        // 3 Fields, - done
        // 5 fields, - done

        // Data-form modal: btn-groups - delete (pasa a event to remove item) and Edit (Open the modal)
        // Button style elements
        // Title Style
        // Study-clinical will listen events to save data

        // Add Button (Open the dialog)
        // Save new configs

        const configModal = isNew => {
            return isNew ? {
                type: "modal",
                title: "Add Config",
                buttonStyle: "margin-top:6px"
            } : {
                type: "modal",
                title: "Edit Config",
                buttonClass: "pull-right",
                btnGroups: [
                    {
                        title: "Edit",
                        openModal: true,
                    },
                    {
                        title: "Delete",
                        btnClass: "btn-danger",
                        event: "removeItem"
                    }
                ]
            };
        };

        const configSection = entity => {
            switch (entity) {
                case "clinical":
                case "interpretation":
                case "flags":
                    return {
                        elements: [
                            {
                                name: "Id",
                                field: "id",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                name: "Description",
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
                                name: "Id",
                                field: "id",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                name: "Description",
                                field: "description",
                                type: "input-text",
                                display: {
                                    rows: 3,
                                    placeholder: "Add a description..."
                                }
                            },
                            {
                                name: "Rank",
                                field: "rank",
                                type: "input-text",
                            },
                            {
                                name: "Default priority",
                                field: "defaultPriority",
                                type: "checkbox",
                            },
                        ]
                    };
                case "consent":
                    return {
                        elements: [
                            {
                                name: "Id",
                                field: "id",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                name: "Name",
                                field: "name",
                                type: "input-text",
                                display: {
                                    placeholder: "Name ..."
                                }
                            },
                            {
                                name: "Description",
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

        const configStatus = {
            title: "Edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "btn btn-primary ripple pull-right",
                okText: "Save"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                mode: configModal(isNew),
                defaultValue: ""
            },
            sections: [configSection(entity)]
        };

        return configStatus;

    }

    renderConfig(itemConfigs, key) {
        return html`
            ${itemConfigs?.map(item => {
                const status = {...item, parent: key? key : ""};
                return html`
                    <div class="list-group-item">
                        <div class="row">
                            <div class="col-md-8">
                                <div style="padding-bottom:2px">
                                    <b>${status.id}</b>
                                    <p class="text-muted">${status.description}</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                    <data-form
                                        .data="${status}"
                                        .config="${this.configClinical(false, this.entity)}">
                                    </data-form>
                            </div>
                        </div>
                    </div>
            `;
})}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                contentStyle: "",
            },
            items: Object.keys(this.items).map(key => {
                return {
                    id: key,
                    name: key,
                    render: () => {
                        return html`
                            <div class="col-md-6">
                                <div class="list-group">
                                    <!-- Edit Config -->
                                    ${this.renderConfig(this.items[key], key)}
                                    <!-- Add New Config -->
                                    <data-form
                                        .data="${this.status}"
                                        .config="${this.configClinical(true, this.entity)}">
                                    </data-form>
                                </div>
                            </div>`;
                    }
                };
            })
        };
    }

    render() {
        return html`
            ${this.tabs ? html `
                <detail-tabs
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_VERTICAL_MODE}">
                </detail-tabs>`:
                html `
                <!-- Edit Config -->
                ${this.renderConfig(this.items)}
                <!-- Add New Config -->
                <data-form
                    .data="${this.status}"
                    .config="${this.configClinical(true, this.entity)}">
                </data-form>
                `}
            `;
    }

}

customElements.define("clinical-list-update", ClinicalListUpdate);
