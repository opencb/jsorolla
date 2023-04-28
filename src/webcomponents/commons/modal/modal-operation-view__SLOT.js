import {LitElement, html} from "lit";
import "./modal-operation-list.js";
import "./modal-popup.js";

export default class ModalOperationView extends LitElement {

    constructor() {
        super();
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

    render() {
        return html `
            <modal-popup .modalId="${"modal-operation"}" .title="${this.operation.title}">
                <modal-operation-list .operation="${this.operation}" .opencgaSession="${this.opencgaSession}">
            </modal-popup>
        `;
    }

}

customElements.define("modal-operation-view", ModalOperationView);
