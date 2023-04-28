import {LitElement, html, nothing} from "lit";
import "../../sample/sample-update.js";

export default class ModalOperationList extends LitElement {

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

    render() {
        switch (this.operation.type) {
            case "sample-update":
                return html `
                    <sample-update
                            .sampleId="${this.operation.row}"
                            .opencgaSession="${this.opencgaSession}">
                    </sample-update>
                `;
            case "sample-create":
                return html `
                    <sample-create
                        .opencgaSession="${this.opencgaSession}">
                    </sample-create>
                `;
            default: return nothing;
        }
    }

}

customElements.define("modal-operation-list", ModalOperationList);
