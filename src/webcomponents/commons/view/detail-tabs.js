/**
 * Copyright 2015-2019 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";

export default class DetailTabs extends LitElement {

    static TABS_MODE = "tabs";
    static PILLS_MODE = "pills";
    static PILLS_VERTICAL_MODE = "pills_vertical";

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
            cellbaseClient: {
                type: Object
            },
            data: {
                type: Object
            },
            mode: { // accepted values:  tabs, pills
                type: String
            },
            activeTab: {
                type: String,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = null;
        this._activeTab = null;

        // Mode by default, if the component no use this property
        this.mode = DetailTabs.TABS_MODE;
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("activeTab")) {
            this.activeTabObserver();
        }
        super.update(changedProperties);
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        // We need to check if the active tab is in the new config
        // If not, we will reset the activeTab for using the new config
        if (this._activeTab && !(this._config.items || []).find(item => item.id === this._activeTab)) {
            this._activeTab = null;
        }

        // Set default active tab
        if (this._config?.items?.length > 0 && !this._activeTab) {
            const activeIndex = this._config.items.findIndex(item => {
                return item.active && this.isTabVisible(item);
            });
            if (activeIndex >= 0) {
                this._activeTab = this._config.items[activeIndex].id;
            } else {
                // Get the first visible tab
                this._activeTab = this._config.items.find(item => this.isTabVisible(item)).id;
            }
        }
    }

    activeTabObserver() {
        if (this.activeTab) {
            this._activeTab = this.activeTab;
        }
    }

    changeTab(e) {
        this._activeTab = e.currentTarget.dataset.id;
        LitUtils.dispatchCustomEvent(this, "activeTabChange", this._activeTab, null, null, {bubbles: false});
        this.requestUpdate();
    }

    isTabVisible(tab) {
        if (typeof tab.visible === "function") {
            return !!tab.visible(this.data, this.opencgaSession, tab);
        } else if (typeof tab.visible === "boolean") {
            return tab.visible;
        } else {
            return true;
        }
    }

    getVisibleTabs() {
        return (this._config.items || []).filter(tab => this.isTabVisible(tab));
    }

    renderTitle() {
        const title = typeof this._config.title === "function" ? this._config.title(this.data) : this._config.title + " " + (this.data?.id || "");
        return html`
            <div class="mt-3 ${this._config?.display?.titleClass || ""}" style="${this._config?.display?.titleStyle || ""}">
                <h3>${title}</h3>
            </div>
        `;
    }

    renderTabTitle() {
        return this.getVisibleTabs().map(item => {
            const isActive = this._activeTab === item.id;
            return html`
                <li role="tablist"
                    class="nav-item"
                    style="${this._config.display?.tabTitleStyle}">
                    <a
                        class="nav-link fw-bold fs-5 ${this._config.display?.tabTitleClass} ${isActive ? "active" : ""}"
                        href="#${this._prefix}${item.id}"
                        role="tab"
                        data-bs-toggle="tab" data-id="${item.id}"
                        @click="${this.changeTab}">
                        <span class="fw-bold">${item.name}</span>
                    </a>
                </li>
            `;
        });
    }

    renderTabContent() {
        return this.getVisibleTabs().map(item => {
            const isActive = this._activeTab === item.id;
            return html`
                <div class="d-${isActive ? "block": "none"}" id="${item.id}-tab" role="tabpanel">
                    ${item.render(this.data, isActive, this.opencgaSession, this.cellbaseClient)}
                </div>
            `;
        });
    }

    render() {
        // 1. Check If data is undefined or null
        if (!this.data) {
            return html`<h3>${this._config?.errorMessage || "No data found"}</h3>`;
        }

        // 2. Check the 'mode' is correct
        if (this.mode !== DetailTabs.TABS_MODE && this.mode !== DetailTabs.PILLS_MODE && this.mode !== DetailTabs.PILLS_VERTICAL_MODE) {
            return html`<h3>No valid mode: '${this.mode || ""}'</h3>`;
        }

        // 3. Check tabs exist
        if (this._config?.items?.length === 0) {
            return html`<h3>No tab items provided</h3>`;
        }

        // Allow custom tabs alignment:  "center" or "justified"
        const align = this._config?.display?.align || ""; // deprecated
        const classes = this._config?.display?.classes;
        const contentClass = this.mode === DetailTabs.PILLS_VERTICAL_MODE ? "col-md-10" : "";
        const visibleTabsCount = this.getVisibleTabs().length;

        return html`
            ${this._config.title ? this.renderTitle() : null}
            <div class="detail-tabs row">
                ${!(this._config.hideTabsIfOnlyOneVisible && visibleTabsCount === 1) ? html`
                    <!-- TABS -->
                    ${this.mode === DetailTabs.TABS_MODE ? html`
                        <ul class="nav nav-tabs ${classes ? `${classes}` : ""}" role="tablist">
                            ${this.renderTabTitle()}
                        </ul>
                    ` : nothing}

                    <!-- PILLS -->
                    ${this.mode === DetailTabs.PILLS_MODE ? html`
                        <ul class="nav nav-pills" role="tablist">
                            ${this.renderTabTitle()}
                        </ul>
                    ` : nothing}

                    <!-- PILLS -->
                    ${this.mode === DetailTabs.PILLS_VERTICAL_MODE ? html`
                        <div class="col-md-2">
                            <ul class="nav flex-column nav-pills me-3" role="tablist">
                                ${this.renderTabTitle()}
                            </ul>
                        </div>
                    ` : nothing}
                ` : null}

                <!-- TAB CONTENT -->
                <div class="${contentClass} ${this._config.display?.contentClass}" style="${this._config.display?.contentStyle || nothing}">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "",
            hideTabsIfOnlyOneVisible: false, // Automatically hide tabs if only one tab is visible
            display: {
                align: "", // "center" | "justified"

                titleClass: "",
                titleStyle: "",

                tabTitleClass: "",
                tabTitleStyle: "",

                contentClass: "p-3",
                contentStyle: "",
            },
            items: [],
            // Example:
            // items: [
            //     {
            //         id: "clinical",
            //         name: "Clinical",
            //         icon: "fas fa-notes-medical",
            //         active: true,
            //         visible: () => true,
            //         render: () => {
            //             return html`
            //                 <h3>Clinical Component</h3>`;
            //         }
            //     },
            // ]
        };
    }

}

customElements.define("detail-tabs", DetailTabs);
