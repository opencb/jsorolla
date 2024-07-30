/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../../core/utils-new";

export default class CustomVerticalNavBar extends LitElement {

    // --- PRIVATE FIELDS ---
    #divMenu;
    #divContent;

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    // --- PROPERTIES ---
    static get properties() {
        return {
            studyId: {
                type: String,
            },
            study: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            activeMenuItem: {
                type: String,
            },
            // CAUTION: possibly a different name for this property
            config: {
                type: Object,
            },
            clicked: {
                type: String,
            },
            _activeItem: {
                type: String,
                state: true
            }
        };
    }

    // --- PRIVATE METHODS ---
    #init() {
        this.isLoading = false;
        this._activeMenuItem = "";
        this._config = this.getDefaultConfig();
        this.clicked = "";
        // Selectors
        this.#divMenu = "admin-vertical-navbar";
        this.#divContent = "admin-vertical-content";
        this._activeItem = "";
    }

    #initActiveMenu() {
        const activeElement = document.querySelector(`#${this.#divMenu} li[data-id=${this._activeMenuItem}]`);
        activeElement.click();
    }

    // --- LIT LIFECYCLE ---
    update(changedProperties) {
        if (changedProperties.has("studyId") || changedProperties.has("opencgaSession")) {
            this.studyIdObserver();
        }
        if (changedProperties.has("activeMenuItem")) {
            this.activeMenuItemObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    firstUpdated() {
        // this.#initActiveMenu();
    }

    // --- OBSERVERS ---
    studyIdObserver() {
        for (const project of this.opencgaSession?.projects) {
            for (const study of project.studies) {
                if (study.id === this.studyId || study.fqn === this.studyId) {
                    this.study = study;
                    break;
                }
            }
        }
    }

    activeMenuItemObserver() {
        if (this.activeMenuItem) {
            this._activeMenuItem = this.activeMenuItem;
        }
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        this.requestUpdate();
    }

    // --- EVENTS ---
    _onItemNavClick(e) {
        e.preventDefault();
        // Set menu id clicked
        if (e.target !== e.currentTarget) {
            this.clicked = e.target.dataset?.id || e.target.parentElement.dataset.id;
        }

        // Set current active-item
        const navItems = document.querySelectorAll(`#${this.#divMenu} .nav-item`);
        [...navItems].forEach(item => item.classList.remove("active"));
        document.querySelector(`[data-id=${this.clicked}]`)
            .querySelector(".nav-link").classList.add("active");

        // Display selected content
        const navContents = document.querySelectorAll(`#${this.#divContent} > div[role=tabpanel]`);
        [...navContents].forEach(item => item.style.display = "none");
        const currentContent = document.querySelector(`#${this.#divContent}  #${this.clicked}`);
        currentContent.style.display = "block";

        this.requestUpdate();
    }

    #onClickTool(e) {
        e.preventDefault();
        this._activeItem = e.currentTarget.dataset.id;
    }

    // --- RENDER METHODS ---

    // QUESTION: Make it optional?
    #renderToggle() {
        return html`
            <a class="d-flex text-decoration-none align-items-center text-white">
                <span class="fs-4">${this.study?.name}</span>
            </a>
            <hr class="text-white">
        `;
    }

    /* QUESTION 1: in config submenu, should we consider category and separator?
       QUESTION 2: in config, item can exclusively be of type: [category | separator | navitem] Proposal:
         To replace [category | separator] keys with 'type'.
    */
    #renderMenu() {
        // d-inline-flex align-items-center rounded border-0 text-white text-decoration-none bg-secondary rounded-5 w-100 px-2 py-2
        const getMenuItem = name => name.replaceAll(/\s/g, "").toLowerCase();
        const isFirstMenuItem = (idx, subIdx) => this._activeItem === "" && idx === 0 && subIdx === 0;
        return html`
                <!-- To check the visibility of each menu and submenu item-->
                <ul class="list-unstyled ps-0">
                ${
                    UtilsNew.getVisibleItems(this._config.menu, this.opencgaSession)
                        .map((item, idx) => item.submenu && UtilsNew.hasVisibleItems(item.submenu, this.opencgaSession) ? html `
                            <li class="mb-1">
                                <a class="d-inline-flex align-items-center rounded border-0 collapsed text-white text-decoration-none"
                                    role="button" data-bs-toggle="collapse" data-bs-target="#${getMenuItem(item.name)}-collapse" aria-haspopup="true" aria-expanded="true">
                                    ${item.name}
                                </a>
                                <div class="collapse show" id="${getMenuItem(item.name)}-collapse">
                                    <ul class="nav nav-pills flex-column mt-2"
                                    style="--bs-nav-link-color: rgba(255, 255, 255, .75); --bs-nav-link-hover-color: #fff; --bs-nav-pills-link-active-color: var(--bs-white); --bs-nav-pills-link-active-bg: var(--bs-orange);">
                                        ${
                                            UtilsNew.getVisibleItems(item.submenu, this.opencgaSession).map((subItem, subIdx) => {
                                                const type = ["category", "separator"].find(type => type in subItem);
                                                switch (type) {
                                                    case "category":
                                                        return html `
                                                            <li class="nav-item">
                                                                <a class="nav-link" style="cursor:auto!important;">
                                                                    <strong>${subItem.name}</strong>
                                                                </a>
                                                            </li>
                                                            `;
                                                    case "separator":
                                                        return html `
                                                            <li class="border-top my-3">
                                                                <hr class="text-white">
                                                            </li>
                                                            `;
                                                    default:
                                                        return html `
                                                            <li class="nav-item" data-id="${subItem.id}" @click=${this.#onClickTool}>
                                                            <!-- TODO: fix for formatting icon | name -->
                                                                <a class="nav-link ${this._activeItem === subItem.id || isFirstMenuItem(idx, subIdx) ? "active" : ""}" id="${subItem.id}-tab"
                                                                    type="button" role="tab" aria-controls="${subItem.id}-tab" aria-selected="false">
                                                                    ${subItem.name}
                                                                </a>
                                                            </li>
                                                        `;
                                                }
                                            })
                                        }
                                    </ul>
                                </div>
                            </li>
                        ` : html `
                            <li>TODO: NO SUBMENU</li>
                        `)}
                </ul>
        `;
    }

    #renderMenuOld() {
        return html`
            <div class="collapse navbar-collapse navbar-ex1-collapse admin-side-navbar" id="${this.#divMenu}">
                <!-- To check the visibility of each menu and submenu item-->
                <ul class="nav navbar-nav left">
                ${
                    UtilsNew.getVisibleItems(this._config.menu, this.opencgaSession)
                        .map(item => item.submenu && UtilsNew.hasVisibleItems(item.submenu, this.opencgaSession) ? html `
                            <li class="dropdown open">
                                <!-- CAUTION: href attribute removed. To discuss: toggle open always-->
                                <a class="dropdown-toggle" data-bs-toggle="dropdown open"
                                role="button" aria-haspopup="true" aria-expanded="true">
                                    ${item.name}
                                </a>
                                <ul class="dropdown-menu" @click="${this._onItemNavClick}">
                                ${
                                    UtilsNew.getVisibleItems(item.submenu, this.opencgaSession)
                                        .map(subItem => {
                                            const type = ["category", "separator"].find(type => type in subItem);
                                            switch (type) {
                                                case "category":
                                                    return html `
                                                        <li>
                                                        <a class="nav-item-category"
                                                        style="cursor:auto!important;">
                                                            <strong>${subItem.name}</strong>
                                                        </a>
                                                        <!--<p class="navbar-text">$submenuItem.name}</p>-->
                                                    </li>
                                                    `;
                                                case "separator":
                                                    return html `
                                                        <li><hr class="dropdown-divider"></li>
                                                    `;
                                                default:
                                                    return html `
                                                        <li class="nav-item" data-id="${subItem.id}">
                                                        <!-- TODO: fix for formatting icon | name -->
                                                            <a class="nav-link">${subItem.name}</a>
                                                        </li>
                                                    `;
                                            }
                                        })
                                }
                                </ul>
                            </li>
                        ` : html `
                            <li>TODO: NO SUBMENU</li>
                        `)}
                </ul>
            </div>
        `;
    }

    #renderContent() {
        const isFirstMenuItem = (idx, subIdx) => this._activeItem === "" && idx === 0 && subIdx === 0;
        return html`
            <div class="tab-content" id="${this.#divContent}" style="margin: 0 20px">
            ${
                UtilsNew.getVisibleItems(this._config.menu, this.opencgaSession)
                    .map((menuItem, idx) => menuItem.submenu && UtilsNew.hasVisibleItems(menuItem.submenu, this.opencgaSession) ? html `
                        ${
                            UtilsNew.getVisibleItems(menuItem.submenu, this.opencgaSession).map((subItem, subIdx) => !subItem.render ? nothing : html `
                                <div class="tab-pane fade ${this._activeItem === subItem.id || isFirstMenuItem(idx, subIdx) ?
                                "active show" :""}" id="${subItem.id}" role="tabpanel"  aria-labelledby="${subItem.id}-tab" tabindex="0">
                                    <!-- TODO: HEADER in a div-->
                                    <div class="d-flex">
                                        <h3 class="fs-3 text-body-emphasis">
                                            <i class="${subItem.icon}"></i>
                                            ${subItem.name}
                                        </h3>
                                    </div>
                                    <hr class="mt-0 mb-3">
                                    <!-- TODO: CONTENT in a div -->
                                    <div class="settings-content-wrapper" id="settings-content-wrapper">
                                        ${subItem.render(this.opencgaSession, this.study)}
                                    </div>
                                </div>
                            `)
                        }` : html` <li>TODO: NO SUBMENU</li>
                        `)
            }
            </div>
        `;
    }

    render() {
        return html`
            <!-- STYLE -->
            <!-- \${this.#renderStyle()} -->
            <!-- TOOL HEADER -->
            <!-- <tool-header title="$this._config.name}" icon="$this._config.icon}"></tool-header> -->
            <div class="d-flex flex-nowrap">
                <!-- NAVIGATION -->
                <div class="d-flex flex-column flex-shrink-0 p-3 min-vh-100" style="background-color: var(--main-bg-color); margin-left:-1rem; margin-top: -1rem; width: 300px;">
                    <!-- 1. Brand and toggle get grouped for better mobile display -->
                    ${this.#renderToggle()}
                    <!-- 1. MENU -->
                    ${this.#renderMenu()}
                </div>
                <!-- 2. CONTENT -->
                <!-- CAUTION: Enable this option if config has key "display" instead of "render" -->
                <!-- <div class="this._config.display?.contentClass}" style="this._config.display?.contentStyle}">-->
                <div class="w-100">
                    ${this.#renderContent()}
                </div>
            </div>
        `;
    }

    // --- DEFAULT CONFIG ---
    getDefaultConfig() {}


}

customElements.define("custom-vertical-navbar", CustomVerticalNavBar);


