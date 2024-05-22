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

import {LitElement, html} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
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
            search: {
                type: Boolean,
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
        this.note = {};
        this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("noteId")) {
            this.noteIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    noteIdObserver() {
        if (this.note && this.opencgaSession) {
            const params = {
                id: this.noteId,
            };
            let error;
            this.#setLoading(true);

            this.opencgaSession.opencgaClient.studies().searchNotes(this.opencgaSession.study.fqn, params)
                .then(response => {
                    this.note = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.note = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "noteSearch", this.note, null, error);
                    this.#setLoading(false);
                });
        } else {
            this.note = {};
        }
    }

    noteObserver() {
        if (this.note?.scope && this.opencgaSession) {
            const params = {
                id: this.note?.id,
            };
            let error;
            this.#setLoading(true);
            // endpoint by default.
            let noteClient = this.opencgaSession.opencgaClient.studies();
            if (this.note?.scope === "ORGANIZATION") {
                noteClient = this.opencgaSession.opencgaClient.organization();
            }
            noteClient.searchNotes(this.opencgaSession.study.fqn, params)
                .then(response => {
                    this.note = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.note = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "noteSearch", this.note, null, error);
                    this.#setLoading(false);
                });
        } else {
            this.note = {};
        }
    }

    onFilterChange(e) {
        this.noteId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.note?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    Note ID not found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.note}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: note => !note?.id && this.search === true,
                        showPDF: false,
                    },
                    elements: [
                        {
                            title: "note ID",
                            // field: "noteId",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <catalog-search-autocomplete
                                        .value="${this.note?.id}"
                                        .resource="${"note"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                    ],
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: note => note?.id,
                    },
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
                                // showPDF: false,
                                render: tags => {
                                    if (tags?.length == 0) {
                                        return "-";
                                    }
                                    if (tags?.length > 5) {
                                        const fiveTags = tags.slice(-4);
                                        const restTags = tags.slice(5);
                                        let contentHtml = fiveTags.map(tag => String.raw`
                                        <span class="badge rounded-pill text-bg-primary">${tag}</span>`).join("");
                                        contentHtml += `<a tooltip-title="Files" tooltip-text='${restTags.join("")}'>... view all tags (${restTags.length})</a>`;
                                        return contentHtml;
                                    } else {
                                        return tags.map(tag => String.raw`
                                            <span class="badge rounded-pill text-bg-primary">${tag}</span>
                                        `).join("");
                                    }
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
                    ],
                },
            ],
        });
    }

}

customElements.define("note-view", NoteView);
