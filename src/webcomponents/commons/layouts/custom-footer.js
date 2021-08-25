/**
 * Copyright 2015-2021 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";

export default class CustomFooter extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            host: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("host")) {
            console.log("changed host...");
        }

        if (changedProperties.has("config")) {
            console.log("changed config...");
        }
        super.update(changedProperties);

    }

    render() {
        return html `
            <div class="footer">
                <div class="container">
                    <img style="height: 25px;" src="${this.config?.footerLogo}" alt="logo">
                    <p class="footer-item">
                        IVA <sup>${this.config?.version}</sup>
                    </p>
                    <p class="footer-item">
                        OpenCGA
                        ${this.host?.opencga ? html`<sup>${this.host?.opencga}</sup>` : html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`}
                    </p>

                    <p class="footer-item">
                        CellBase
                        ${this.host?.cellbase ? html`<sup>${this.host?.cellbase}</sup>` : html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`}
                    </p>
                </div>
            </div>`;
    }

}

customElements.define("custom-footer", CustomFooter);
