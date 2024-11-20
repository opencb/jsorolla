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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "./variant-cohort-stats-grid.js";
import "../commons/json-viewer";

export default class VariantNotes extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variantId: {
                type: String,
            },
            variant: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.active = false;
        this.variant = null;
        this.notes = null;
    }

    update(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("variantId") || changedProperties.has("active")) {
            this.variantIdObserver();
        }
        if (changedProperties.has("variant") || changedProperties.has("active")) {
            this.variantObserver();
        }
        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.variantId && this.variantId.split(":").length > 2 && this.active) {
            this.opencgaSession.opencgaClient.variants()
                .query({
                    id: this.variantId,
                    study: this.opencgaSession.study.fqn,
                    exclude: "studies,annotation.traitAssociation",
                })
                .then(response => {
                    if (response.responses[0].results[0]) {
                        this.variant = response.responses[0].results[0];
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    variantObserver() {
        if (this.variant && this.active) {
            if (this.variant.annotation?.consequenceTypes) {
                this.genes = this.variant.annotation.consequenceTypes.map(ct => ct.geneName);
            }

            this.opencgaSession.opencgaClient.studies()
                .searchNotes(this.opencgaSession.study.fqn, {
                    id: `${this.variant.id},${this.genes.join(",")}`,
                })
                .then(response => {
                    this.variantNote = null;
                    this.geneNotes = response.responses[0].results || null;
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    #renderNoteByType(note) {
        let noteHtml;
        switch (note.valueType.toUpperCase()) {
            case "INTEGER":
            case "DOUBLE":
            case "STRING":
                noteHtml = html`<span>${note.value}</span>`;
                break;
            case "ARRAY":
                noteHtml = html`<span>${note.value.join(", ")}</span>`;
                break;
            case "OBJECT":
                noteHtml = html`
                    <json-viewer
                        .data="${note.value}"
                        .simple="${true}">
                    </json-viewer>
                `;
                break;
        }
        return noteHtml;
    }

    renderVariantNotes(note) {
        if (!note) {
            return html`
                <span>No variant notes available for '${this.variant.id}'</span>
            `;
        }

        const variantNoteHtml = this.#renderNoteByType(note);
        return html`
            <h4>${note.id}</h4>
            ${variantNoteHtml || html`<span>${note.value}</span>`}
        `;
    }

    renderGeneNotes(notes) {
        if (!notes || notes.length === 0) {
            return html`
                <span>No gene notes available for this variant</span>
            `;
        }

        // FIXME filter by new note.entityType = "GENE"
        const geneNotes = notes.filter(note => this.genes.includes(note.id));
        const geneNoteHtml = {};
        for (const geneNote of geneNotes) {
            geneNoteHtml[geneNote.id] = this.#renderNoteByType(geneNote);
        }

        return html`
            ${geneNotes.map(note => html`
                <h4>${note.id}</h4>
                <div style="background-color:#f3f3f3; border-left: 2px solid #0c2f4c;padding:12px">
                    <div style="float: right">
                        <span class="px-2">Last modified on ${UtilsNew.dateFormatter(note.modificationDate)}.</span>
                        <span>(Version ${note.version})</span>
                    </div>
                    <div class="my-2">
                        <span style="font-weight: bold">Created by user:</span>
                        <span>${note.userId}</span>
                    </div>
                    <div class="my-2">
                        <span style="font-weight: bold">Note info:</span>
                        ${geneNoteHtml[note.id] || html`<span>${note.value}</span>`}
                    </div>
                </div>
            `)}
        `;
    }

    render() {
        if (!this.geneNotes || this.geneNotes.length === 0) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-info-circle pe-1"></i>
                    <span>No Notes available for this variant.</span>
                </div>
            `;
        }

        return html`
            <div style="">
                <div>
                    <div class="py-2">
                        <h2>Variant Note</h2>
                        <div class="px-2">
                            ${this.renderVariantNotes(this.variantNote)}
                        </div>
                    </div>

                    <div class="py-2">
                        <h2>Gene Notes</h2>
                        <div class="px-2">
                            ${this.renderGeneNotes(this.geneNotes)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-notes", VariantNotes);
