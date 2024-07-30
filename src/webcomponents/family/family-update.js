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

import {html, LitElement} from "lit";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/filters/catalog-search-autocomplete.js";

export default class FamilyUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            familyId: {
                type: String
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._family = {};
        this.familyId = "";
        this.displayConfig = {};

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onComponentIdObserver(e) {
        this._family = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html`
            <opencga-update
                .resource="${"FAMILY"}"
                .componentId="${this.familyId}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active}"
                .config="${this._config}"
                @componentIdObserver="${e => this.onComponentIdObserver(e)}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Family ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                                placeholder: "Add a short ID...",
                                helpMessage: this._family.creationDate? "Created on " + UtilsNew.dateFormatter(this._family.creationDate):"No creation date",
                                validation: {}
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a family name...",
                            }
                        },
                        {
                            title: "Members",
                            field: "members",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                helpMessage: "Individual Ids",
                                render: (members, dataFormFilterChange, updateParams) => {
                                    const membersIds = Array.isArray(members) ?
                                        members?.map(member => member.id).join(",") : members;
                                    const handleSamplesFilterChange = e => {
                                        // We need to convert value from a string wth commas to an array of IDs
                                        const memberList = (e.detail?.value?.split(",") || [])
                                            .filter(memberId => memberId)
                                            .map(memberId => ({id: memberId}));
                                        dataFormFilterChange(memberList);
                                    };
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${membersIds}"
                                            .resource="${"INDIVIDUAL"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .classes="${updateParams.members ? "selection-updated" : ""}"
                                            .config="${{multiple: true}}"
                                            @filterChange="${e => handleSamplesFilterChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                }
                            },
                        },
                        {
                            title: "Expected Size",
                            field: "expectedSize",
                            type: "input-num",
                            allowedValues: [0],
                            display: {
                                placeholder: "Add a expected size...",
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a Family description...",
                            }
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "status.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "status.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name"
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "status.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                    ]
                },
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: family => html`
                //                 `
                //             }
                //         }
                //     ]
                // }
            ]
        });
    }

}

customElements.define("family-update", FamilyUpdate);
