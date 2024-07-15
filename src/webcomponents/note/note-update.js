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

import {LitElement, html, nothing} from "lit";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/forms/select-token-filter-static.js";

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
            noteId: {
                type: String,
            },
            noteScope: {
                type: String,
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
        this.active = true;
        this.displayConfig = {};
        this._note = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("noteId") || changedProperties.has("noteScope") || changedProperties.has("opencgaSession" || changedProperties.has("active"))) {
            this.noteObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    noteObserver() {
        this._note = null;
        if (this.noteId && this.noteScope && this.opencgaSession && this.active) {
            let noteRequest = null;
            if (this.noteScope === "STUDY") {
                noteRequest = this.opencgaSession.opencgaClient.studies()
                    .searchNotes(this.opencgaSession.study.fqn, {
                        id: this.noteId,
                    });
            } else if (this.noteScope === "ORGANIZATION") {
                noteRequest = this.opencgaSession.opencgaClient.organization()
                    .searchNotes({
                        id: this.noteId,
                    });
            } else {
                console.error(`Unexpected note scope provided. Expected 'STUDY' or 'ORGANIZATION' but got ${this.noteScope}`);
                return;
            }
            noteRequest
                .then(response => {
                    this._note = response.getResult(0) || {};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    render() {
        if (!this._note) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html `
            <opencga-update
                .resource="NOTE"
                .component="${this._note}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active}"
                .config="${this._config}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: {
                ...this.displayConfigDefault,
                ...(this.displayConfig || {}),
            },
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
                            type: "toggle-buttons",
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
                                            .data="${data}"
                                            .value="${data?.join(",")}"
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
                                visible: data => ["OBJECT", "ARRAY"].includes(data?.valueType),
                                render: (content, dataFormFieldChange) => {
                                    const handleValuesChange = (content, valueType) => {
                                        // convert string to array
                                        if (valueType === "ARRAY") {
                                            // jsonEditor return content as object
                                            dataFormFieldChange(UtilsNew.isObjectValuesEmpty(content?.json) ? [] : Object.values(content?.json));
                                        } else {
                                            dataFormFieldChange(content?.json ? content?.json : {});
                                        }
                                    };
                                    const val = this._note?.valueType === "ARRAY" ? content || [] : content || {};
                                    return html`
                                        <json-editor
                                            .data="${val}"
                                            .config="${{showDownloadButton: false, initAsArray: this._note?.valueType === "ARRAY"}}"
                                            @fieldChange="${e => handleValuesChange(e.detail?.value, this._note?.valueType)}">
                                        </json-editor>
                                    `;
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
