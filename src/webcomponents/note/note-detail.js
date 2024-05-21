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
import ExtensionsManager from "../extensions-manager.js";
import "./note-view.js";
import "./../commons/view/detail-tabs.js";

export default class NoteDetail extends LitElement {

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
                type: Object
            },
            noteId: {
                type: String
            },
            note: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "note-detail";
        this._note = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("noteId")) {
            this.noteIdObserver();
        }

        if (changedProperties.has("note")) {
            this.noteObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.#updateDetailTabs();
        }
        super.update(changedProperties);
    }

    noteIdObserver() {
        if (this.opencgaSession && this.noteId) {
            // endpoint by default.
            let searchNote = this.opencgaSession.opencgaClient.studies()
                .searchNotes(this.opencgaSession.study.fqn, {
                id: this.note?.id
            });
            if (this.note.scope === "ORGANIZATION") {
                searchNote = this.opencgaSession.opencgaClient.organization()
                    .searchNotes({
                    id: this.node?.id
                });
            }
            searchNote.then(response => {
                this._note = response.getResult(0);
                // this._note = response.responses[0].results[0];
                this.requestUpdate();
            })
                .catch(err => {
                    console.error(err);
                });
        }
    }

    noteObserver() {
        if (this.note?.scope && this.opencgaSession) {
            // endpoint by default.
            let searchNote = this.opencgaSession.opencgaClient.studies()
                .searchNotes(this.opencgaSession.study.fqn, {
                id: this.note?.id
            });
            if (this.note?.scope === "ORGANIZATION") {
                searchNote = this.opencgaSession.opencgaClient.organization()
                    .searchNotes({id: this.note?.id});
            }
            searchNote
                .then(response => {
                    this._note = response.getResult(0) || {};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            this._note = {};
        }
    }

    #updateDetailTabs() {
        this._config.items = [
            ...this._config.items,
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        ];
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this._note}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>`;
    }

    getDefaultConfig() {
        return {
            items: [],
        };
    }

}

customElements.define("note-detail", NoteDetail);
