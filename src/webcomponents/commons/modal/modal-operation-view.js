import {LitElement, html, nothing} from "lit";
import "./modal-operation-list.js";


export default class ModalOperationView extends LitElement {

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
            operation: {
                type: Object
            },
        };
    }

    #init() {}

    propertyObserver() {}

    updated(changedProperties) {
        // Show modal
        if (changedProperties.has("operation")) {
            $("#modal-operation").modal("show");
        }
    }
    render() {

        return html `
            <div class="modal fade" tabindex="-1" id="modal-operation" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">${this.operation.title}</h4>
                        </div>
                        <div class="modal-body">
                            <modal-operation-list
                                .operation="${this.operation}"
                                .opencgaSession="${this.opencgaSession}"
                            >
                        </div>
                    </div>
                </div>
            </div>
        `;

    }

}

customElements.define("modal-operation-view", ModalOperationView);
