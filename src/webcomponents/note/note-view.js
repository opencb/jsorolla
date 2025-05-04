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

import {LitElement, html, nothing} from "lit";
import ExtensionsManager from "../extensions-manager.js";
import "../commons/forms/data-form.js";
import "../commons/json-viewer.js";
import "./note-summary.js";

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
            noteId: {
                type: String,
            },
            note: {
                type: Object
            },
            noteScope: {
                type: String,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "note-view";
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

        if (changedProperties.has("displayConfig") || changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    noteObserver() {
        this._note = {...this.note};
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
        if (!this.opencgaSession || !this._note) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._note || {}}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "pills",
                pillsLeftColumnClass: "col-md-2",
                pillsRightColumnClass: "col-md-10",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "note-summary",
                    name: "Overview",
                    render: (note, active) => html`
                        <note-summary
                            .note="${note}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </note-summary>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (note, active) => html`
                        <json-viewer
                            .data="${note}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID, this.opencgaSession),
            ],
        };
    }

}

customElements.define("note-view", NoteView);
