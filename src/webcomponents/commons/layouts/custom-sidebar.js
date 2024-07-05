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

import {LitElement, html, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";

export default class CustomSidebar extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            loggedIn: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    onChangeApp(e) {
        LitUtils.dispatchCustomEvent(this, "changeApp", "", {event: e}, null);
    }

    render() {
        return html`
            <style>
                .hover-effect:hover {
                    background-color:#f8f9fa;
                }
            </style>
            <!-- Left Sidebar: we only display this if more than 1 visible app exist -->
            ${this.config?.apps?.filter(app => UtilsNew.isAppVisible(app, this.opencgaSession)).length > 0 ? html`
                <div id="overlay"></div>
                <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasIva">
                    <div class="offcanvas-header">
                        <div data-bs-dismiss="offcanvas" data-bs-target="#offcanvasIva">
                            <a href="#home" class="text-decoration-none" @click="${e => this.onChangeApp(e)}">
                                <div class="top-logo d-flex flex-column p-3">
                                    <img src="${this.config.logoAlt}" height="50px"/>
                                    <span class="fs-4">Suite</span>
                                </div>
                            </a>
                        </div>
                        <button type="button" class="btn-close mb-auto mt-1 me-1" data-bs-dismiss="offcanvas" data-bs-target="#offcanvasIva"
                            aria-label="Close">
                        </button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav">
                            ${this.config?.apps?.filter(item => UtilsNew.isAppVisible(item, this.opencgaSession)).map(item => html`
                                <li class="nav-item hover-effect" data-bs-dismiss="offcanvas" data-bs-target="#offcanvasIva">
                                    <a href="#home" class="nav-link fs-5" data-id="${item.id}" @click="${e => this.onChangeApp(e)}">
                                        <img src="${item.icon}" alt="${item.name}" width="48px"/> ${item.name}
                                    </a>
                                </li>
                            `)}
                        </ul>
                    </div>
                    <div class="d-flex justify-content-end p-3">
                        <div>
                            <img height="24px" src="${this.config.landingPage?.organisation?.logo?.img}"/>
                        </div>
                    </div>
                </div>
            ` : nothing}
        `;
    }

}

customElements.define("custom-sidebar", CustomSidebar);
