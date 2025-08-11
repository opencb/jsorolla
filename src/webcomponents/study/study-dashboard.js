import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";

export default class StudyDasboard extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            app: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    render() {
        return html`
            <div class="container pt-3">
                <h3>Fake Dashboard. Work in progress</h3>
                <div>
                    <img src="https://c7.alamy.com/comp/2B12GXK/graphs-dashboard-infographic-data-chart-web-site-admin-panel-and-finance-charts-vector-template-2B12GXK.jpg">
                </div>
            </div>
        `;
    }

}

customElements.define("study-dashboard", StudyDasboard);
