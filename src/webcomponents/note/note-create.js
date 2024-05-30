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

export default class NoteCreate extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            mode: {
                type: String,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        // default
        // after create try to init this note
        this.initNote();
        this.isLoading = false;
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Create",
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            defaultValue: "",
        };
        this._config = this.getDefaultConfig();
    }

    initNote() {
        this.note = {
            valueType: "STRING",
            scope: "STUDY",
            visibility: "PUBLIC",
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        this.note = {...this.note};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear note",
            message: "Are you sure to clear?",
            ok: () => {
                this.note = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: true,
        };
        let error;
        this.#setLoading(true);
        const {scope, ...data} = this.note;
        const noteCreateNote = scope === "STUDY" ? this.opencgaSession.opencgaClient.studies().createNotes(params.study, data, {includeResult: true}) :
            this.opencgaSession.opencgaClient.organization().createNotes(data, {includeResult: true});
        noteCreateNote.then(() => {
            this.initNote();
            this._config = this.getDefaultConfig();
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                title: "New Note",
                message: "note created correctly",
            });
        })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "noteCreate", this.note, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.note}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
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
                        },
                        {
                            title: "Note ID",
                            field: "id",
                            type: "input-text",
                            required: true,
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
                            title: "Type",
                            field: "valueType",
                            type: "select",
                            required: true,
                            defaultValue: "STRING",
                            allowedValues: ["OBJECT", "ARRAY", "STRING", "INTEGER", "DOUBLE"],
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

customElements.define("note-create", NoteCreate);
