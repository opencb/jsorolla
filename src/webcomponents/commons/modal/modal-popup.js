/**
 * Copyright 2015-2023 OpenCB
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
import UtilsNew from "../../../core/utils-new";
import LitUtils from "../utils/lit-utils";
export default class ModalPopup extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            modalId: {
                type: String,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
    }

    updated() {
        this.showModal();
        // Todo: meet rodiel to discuss
        // $(`#${this.modalId}`).on("hide.bs.modal", e => {
        //     LitUtils.dispatchCustomEvent(this, "closeModal");
        // });
    }

    async showModal() {
        await this.updateComplete;
        $(`#${this.modalId}`).modal("show");
    }

    #onCloseModal() {
        LitUtils.dispatchCustomEvent(this, "closeModal", null);
    }

    #getTitleHeader(header, title, classes, style) {
        switch (header) {
            case "h1":
                return html`<h1 class="${classes}" style="${style}">${title}</h1>`;
            case "h2":
                return html`<h2 class="${classes}" style="${style}">${title}</h2>`;
            case "h3":
                return html`<h3 class="${classes}" style="${style}">${title}</h3>`;
            case "h4":
                return html`<h4 class="${classes}" style="${style}">${title}</h4>`;
            case "h5":
                return html`<h5 class="${classes}" style="${style}">${title}</h5>`;
            case "h6":
                return html`<h6 class="${classes}" style="${style}">${title}</h6>`;
        }
    }

    render() {
        const modalWidth = this.config?.display?.modalWidth || "768px";
        const modalTitle = this.config?.display?.modalTitle || "";
        const modalTitleHeader = this.config?.display?.modalTitleHeader || "h4";
        const modalTitleClassName = this.config?.display?.modalTitleClassName || "";
        const modalTitleStyle = this.config?.display?.modalTitleStyle || "";

        return html `
            <div class="modal fade" id="${this.modalId}"
                 tabindex="-1" role="dialog"
                 aria-labelledby="DataModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="width: ${modalWidth}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="${this.#onCloseModal}"><span aria-hidden="true">&times;</span></button>
                            ${this.#getTitleHeader(modalTitleHeader, modalTitle, "modal-title " + modalTitleClassName, modalTitleStyle)}
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                ${this.config?.render(true)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("modal-popup", ModalPopup);
