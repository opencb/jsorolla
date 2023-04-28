import {LitElement, html} from "lit";
import "./modal-operation-list.js";

export default class ModalPopup extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            modalId: {
                type: String,
            },
            title: {
                type: String
            },
        };
    }
    updated(changedProperties) {
        if (changedProperties.has("modalId")) {
            // Show modal
            $("#modal-operation").modal("show");
        }
    }

    render() {
        return html `
            <div class="modal fade" tabindex="-1" id="${this.modalId}" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 class="modal-title">${this.title}</h4>
                        </div>
                        <div class="modal-body">
                            <!-- Children components composed here-->
                            <slot></slot>
                        </div>
                    </div>
                </div>
            </div>
        `;

    }

}

customElements.define("modal-popup", ModalPopup);
