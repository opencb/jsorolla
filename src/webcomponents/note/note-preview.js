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
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";

export default class NotePreview extends LitElement {

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
            opencgaSession: {
                type: Object,
            },
            active: {
                type: Object,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.note = {};
        this.isLoading = false;
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
        if (changedProperties.has("note")) {
            this.noteObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    noteIdObserver() {
        if (this.noteId && this.opencgaSession) {
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
                    LitUtils.dispatchCustomEvent(this, "notePreview", this.note, null, error);
                    this.#setLoading(false);
                });
        } else {
            this.note = {};
        }
    }

    noteObserver() {
        if ((this.note?.scope && !this.note?.value) && this.opencgaSession) {
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
                    // this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "notePreview", this.note, null, error);
                    this.#setLoading(false);
                });
        }
    }

    onFilterChange(e) {
        this.noteId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (UtilsNew.isEmpty(this.note.value)) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    Note Empty Content.
                </div>
            `;
        }
        let content;
        // "OBJECT|ARRAY|STRING|INTEGER|DOUBLE",
        switch (this.note?.valueType) {
            case "OBJECT": content = `<b>Not supported yet</b>`;
                break;
            case "ARRAY":
                const replaceStr = this.note.value.replace(/'/g, "\"");
                const contentArr = JSON.parse(replaceStr);
                content = html`<ul>${contentArr.map(val => html`<li>${val}</li>`)}</ul>`;
                break;
            case "STRING":
            case "INTEGER":
            case "DOUBLE":
            default:
                content = html`${this.note?.value}`;
        }

        return html`
            <div class="card">
                <div class="card-body">
                    ${content}
                </div>
            </div>

        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("note-preview", NotePreview);
