/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";

export default class ToolHeader extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            subtitle: {
                type: String
            },
            icon: {
                type: String
            },
            class: {
                type: String
            },
            rightContent: {
                type: Object,
            },
            // 'rhs' is deprecated, use 'rightContent' instead
            rhs: {
                type: Object
            },
        };
    }

    renderIcon() {
        if (this.icon) {
            if (this.icon.match(/\./)?.length) {
                return html`
                    <img width="48px" height="48px" src="${this.icon}" alt="${this.title}">
                `;
            } else {
                return html`
                    <i class="fas ${this.icon}"></i>
                `;
            }
        } else {
            return nothing;
        }
    }

    render() {
        return html`
            <div class="d-flex align-items-center my-3 py-2 ${this.class ?? ""}">
                <h1 class="d-flex align-items-center gap-3 user-select-none">
                    ${this.renderIcon()}
                    <span class="fw-bold">${UtilsNew.renderHTML(this.title)}</span>
                </h1>
                ${this.subtitle ? html`
                    <h3>${this.subtitle}</h3>
                ` : nothing}
                ${(this.rightContent || this.rhs) ? html`
                    <div class="ms-auto">${this.rightContent || this.rhs}</div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("tool-header", ToolHeader);
