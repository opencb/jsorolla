/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement} from "lit";
import LitUtils from "../commons/utils/lit-utils";

export default class RestMenu extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            apiInfo: {
                type: Object,
            },
            api: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    onClick(e, endpoint) {
        LitUtils.dispatchCustomEvent(this, "endpointSelect", "", {event: e, endpoint: endpoint}, null);
    }

    #renderList() {
        return html `
            <div id="rest-list">
                <div class="d-flex flex-column card-body gap-3" id="accordion" role="tablist" aria-multiselectable="false" data-cy="rest-api-endpoints">
                    ${
                        this.api?.map(category => {
                            const categoryName = category.name.replaceAll(" ", "_");
                            return html `
                                <div class="card">
                                    <div class="card-body" role="tab" id="${categoryName}HeadingOne">
                                        <h5 class="card-title">
                                            <div class="">
                                                <a class="text-decoration-none" role="button" data-bs-toggle="collapse"
                                                data-bs-parent="#accordion" href="#${categoryName}CollapseOne" aria-expanded="true" aria-controls="${category.name}CollapseOne">
                                                    <div class="mb-2">
                                                        ${category.name} <span class="badge bg-primary float-end rounded-pill">${category.endpoints?.length || "NA"}</span>
                                                    </div>
                                                    <div class="fs-5" style="text-transform: none;letter-spacing: 1px">
                                                        ${category.path}
                                                    </div>
                                                </a>
                                            </div>
                                        </h5>
                                    </div>
                                    <div id="${categoryName}CollapseOne" class="collapse" role="tabpanel" aria-labelledby="${categoryName}HeadingOne">
                                        ${
                                            category.endpoints.sort((a, b) => {
                                                return this.config.methodOrder[a.method] - this.config.methodOrder[b.method];
                                            }).map(endpoint => html `
                                                <div class="card-body py-2 px-3">
                                                    <a style="white-space:normal;cursor:pointer" @click="${e => this.onClick(e, endpoint)}"
                                                    class="link-offset-1 link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" role="link">
                                                    <span class="fw-bold me-3" style="color:${this.config.methodColor[endpoint.method]}">
                                                            ${endpoint.method}
                                                        </span>
                                                        <span class="fw-bold text-break" data-cy="endpoint-path">
                                                            ${endpoint.path.replace("/{apiVersion}", "")}
                                                        </span>
                                                    </a>
                                                    <div class="text-secondary">
                                                        ${endpoint.description}
                                                    </div>
                                                </div>
                                            `)
                                        }
                                    </div>
                                </div>
                            `;
                        })
                    }
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="d-flex flex-column card">
                <!-- SIDE-BAR: APIs title-->
                <div class="card-header">
                    <div>${this.apiInfo.title}</div>
                </div>
                <!-- SIDE-BAR FILTER-->
                <div class="rest-menu-filter-wrapper">
                    <!-- 1. Search jetbrains-like -->
                    <div class="rest-fuzzy-search"></div>
                    <!-- 2. Filters jetbrains-like -->
                    <div class="rest-filters"></div>
                </div>
                <!-- SIDE-BAR LIST-ENDPOINTS -->
                <div>
                    ${this.#renderList()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            methodOrder: {
                "GET": 1,
                "POST": 2,
                "DELETE": 3
            },
            methodColor: {
                "GET": "blue",
                "POST": "darkorange",
                "DELETE": "red"
            },
        };
    }

}

customElements.define("rest-menu", RestMenu);

