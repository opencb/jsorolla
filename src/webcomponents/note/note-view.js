/**
 * Copyright 2015-2019 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../study/annotationset/annotation-set-view.js";
import "../loading-spinner.js";

export default class NoteView extends LitElement {

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
                type: Object,
            },
            noteId: {
                type: String,
            },
            noteScope: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            pdf: false,
        };
        this._note = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("noteId") || changedProperties.has("noteScope")) {
            this.noteIdOrScopeObserver();
        }
        if (changedProperties.has("note")) {
            this.noteObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    noteObserver() {
        this._note = this.note;
    }

    noteIdOrScopeObserver() {
        this._note = null;
        if (this.opencgaSession && this.noteId && this.noteScope) {
            let noteSearchPromise = null;
            if (this.noteScope === "STUDY") {
                noteSearchPromise = this.opencgaSession.opencgaClient.studies()
                    .searchNotes(this.opencgaSession.study.fqn, {
                        id: this.noteId,
                    });
            } else {
                noteSearchPromise = this.opencgaSession.opencgaClient.organization()
                    .searchNotes({
                        id: this.noteId,
                    });
            }
            noteSearchPromise
                .then(response => {
                    this._note = response?.responses[0]?.results?.[0];
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    render() {
        if (!this._note) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._note}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: {
                ...this.displayConfigDefault,
                ...(this.displayConfig || {}),
            },
            sections: [
                {
                    title: "General",
                    collapsed: false,
                    elements: [
                        {
                            title: "Note ID",
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    }
                                },
                            },
                        },
                        {
                            title: "Scope",
                            field: "scope"
                        },
                        {
                            title: "User",
                            field: "userId"
                        },
                        {
                            title: "Visibility",
                            field: "visibility"
                        },
                        {
                            title: "Type",
                            field: "valueType"
                        },
                        {
                            title: "Version",
                            field: "version",
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "custom",
                            display: {
                                render: tags => {
                                    return (tags || []).map(t => `<span class="badge rounded-pill text-bg-primary">${t}</span>`).join(" ") || "-";
                                },
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Content",
                            type: "custom",
                            display: {
                                render: note => {
                                    let content = "";
                                    switch (note?.valueType) {
                                        case "OBJECT":
                                        case "ARRAY":
                                            content = `<pre>${JSON.stringify(note.value, null, "    ")}</pre>`;
                                            break;
                                        case "STRING":
                                        case "INTEGER":
                                        case "DOUBLE":
                                        default:
                                            content = note?.value;
                                    }
                                    return content;
                                },
                            },
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("note-view", NoteView);
