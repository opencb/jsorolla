import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";

export default class CustomPage extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            page: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    render() {
        return html`
            <div class="container py-5" data-cy="custom-page">
                <!-- Page title -->
                ${this.page.title && this.page.display?.showTitle !== false ? html`
                    <h1 class="${this.page.display?.titleClass}" style="${this.page.display?.titleStyle}">
                        ${this.page.title}
                    </h1>
                ` : nothing}
                <!-- Page content -->
                ${this.page.content ? html`
                    ${UtilsNew.renderHTML(typeof this.page.content === "function" ? this.page.content(this.opencgaSession) : this.page.content)}
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("custom-page", CustomPage);
