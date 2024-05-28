/**
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

import {LitElement, html} from "lit";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utils-new.js";

export default class NoteUpdate extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            note: {
                type: Object
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        // default
        this._note = {};
        this.note = {};
        this.updatedFields = {};
        this.displayConfig = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    // This observer fetches the object fetched from the server.
    // Uncomment when using 'onComponentFieldChange' to post-process data-from manipulation.
    onComponentIdObserver(e) {
        this._note = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html `
            <opencga-update
                .resource="${"NOTE"}"
                .component="${this.note}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active}"
                .config="${this._config}"
                @componentIdObserver="${e => this.onComponentIdObserver(e)}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Scope",
                            field: "scope",
                            type: "select",
                            required: true,
                            defaultValue: "STUDY",
                            allowedValues: ["STUDY", "ORGANIZATION"],
                            display: {
                                disabled: true,
                            }
                        },
                        {
                            title: "Note ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                disabled: true,
                            }
                        },
                        {
                            title: "Visibility",
                            field: "visibility",
                            type: "select",
                            required: true,
                            defaultValue: "PUBLIC",
                            allowedValues: ["PUBLIC", "PRIVATE"],
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "custom",
                            display: {
                                render: (data, dataFormFilterChange) => {
                                    const handleTagsFilterChange = e => {
                                        dataFormFilterChange(e.detail.value ? e.detail.value?.split(",") : []);
                                    };
                                    return html`
                                        <select-token-filter-static
                                            .values="${data?.tags}"
                                            @filterChange="${e => handleTagsFilterChange(e)}">
                                        </select-token-filter-static>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Content",
                            field: "value",
                            type: "custom",
                            display: {
                                visible: data => {
                                    const validTypes = ["OBJECT", "ARRAY"];
                                    return validTypes.includes(data?.valueType);
                                },
                                render: data => {
                                    return html`Not Supported Yet`;
                                },
                            },
                        },
                        {
                            title: "Content",
                            field: "value",
                            type: "input-text",
                            display: {
                                visible: data => {
                                    const validTypes = ["STRING", "INTEGER", "DOUBLE"];
                                    return validTypes.includes(data?.valueType);
                                },
                                rows: 3,
                                placeholder: "Add a note content...",
                            },
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("note-update", NoteUpdate);
