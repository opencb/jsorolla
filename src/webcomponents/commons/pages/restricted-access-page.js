import {LitElement, html} from "lit";

export default class RestrictedAccessPage extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            title: {
                type: String,
            },
            message: {
                type: String,
            },
        };
    }

    render() {
        return html`
            <div class="container pt-4">
                <div class="d-flex flex-column justify-content-center align-items-center pt-5">
                    <div class="display-2 mb-2">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <h1 class="display-3 text-center mb-3 fw-medium">
                        ${this.title || "Restricted access."}
                    </h1>
                    <h3 class="text-center lh-sm" style="max-width:640px;">
                        ${this.message}
                    </h3>
                </div>
            </div>
        `;
    }

}

customElements.define("restricted-access-page", RestrictedAccessPage);
