import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import {guardPage} from "../html-utils.js";

export default class WelcomePage extends LitElement {

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

    renderApplications() {
        const visibleApps = (this.config.apps || []).filter(app => {
            return UtilsNew.isAppVisible(app, this.opencgaSession);
        });

        return html`
            <div class="row">
                ${visibleApps.map(item => html`
                    <div class="col-3">
                        <div class="d-block text-decoration-none text-body rounded-3">
                            <div class="d-flex mb-3">
                                <div class="d-flex align-items-center justify-content-center text-white bg-primary rounded-4" style="width:4rem;height:4rem;">
                                    <i class="fas ${item.icon} fs-1"></i>
                                </div>
                            </div>
                            <div class="text-decoration-none fs-3 fw-bold mb-1">${item.title || item.name}</div>
                            ${item.description ? html`
                                <div class="fs-5 mb-3 text-gray-700">
                                    ${item.description}
                                </div>
                            ` : nothing}
                            <div class="">
                                <a href="#${item.id}/home" class="d-flex align-items-center gap-2 icon-link cursor-pointer fs-5 text-decoration-none">
                                    <span class="">Open ${item.name || item.title} App</span>
                                    <i class="fas fa-chevron-right text-decoration-none"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    renderTools() {
        const visibleTools = (this.app.menu || []).filter(item => {
            return UtilsNew.isAppVisible(item, this.opencgaSession);
        });

        return html`
            <div class="row">
                ${visibleTools.map(item => html`
                    <div class="col-3 mb-5" data-cy-welcome-card-id="${item.id}">
                        <div class="d-none mb-3">
                            <div class="d-flex align-items-center justify-content-center bg-gray-200 rounded-4" style="width:3rem;height:3rem;">
                                <i class="fas ${item.icon} fs-2"></i>
                            </div>
                        </div>
                        <div class="fs-3 fw-bold mb-1">${item.title || item.name}</div>
                        ${item.description ? html`
                            <div class="fs-5 mb-3 text-gray-700">
                                ${UtilsNew.renderHTML(item.description)}
                            </div>
                        ` : nothing}
                        <div class="d-flex">
                            <a class="d-inline-flex align-items-center gap-2 btn btn-primary text-white" href="#${this.app.id}/${item.id}">
                                <span class="fw-bold">Enter tool</span>
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    render() {
        // this checks if we are in the suite (global welcome) or in a specific app (app welcome)
        const isWelcomeSuite = !this.app || this.app?.id === "suite";
        const welcomePage = isWelcomeSuite ? this.config.welcomePage : this.app.welcomePage; // get the welcome page config

        if (!UtilsNew.isNotEmptyArray(this.opencgaSession?.projects) ||
            this.opencgaSession.projects.every(p => !UtilsNew.isNotEmptyArray(p.studies))) {
            return guardPage("You don't have projects or/and studies. Please contact the admin");
        }

        return html`
            <div class="container pt-5">
                <!-- Welcome page logo -->
                ${welcomePage?.logo ? html`
                    <div class="mb-3">
                        <img
                            alt="${welcomePage.display?.logoAlt || "logo"}"
                            class="${welcomePage.display?.logoClass}"
                            src="${welcomePage.logo}"
                            style="${welcomePage.display?.logoStyle}"
                            width="${welcomePage.display?.logoWidth || "240px"}"
                        />
                    </div>
                ` : nothing}

                <!-- Welcome page title -->
                ${welcomePage?.title ? html`
                    <div class="">
                        <div class="d-flex align-items-center mb-2">
                            ${welcomePage.appLogo?.img ? html`
                                <img src="${welcomePage.appLogo?.img}" height="${welcomePage.appLogo?.height || "40px"}"/>
                            ` : nothing}
                            <div class="${welcomePage.display?.titleClass || "display-4 fw-bold"}" style="${welcomePage.display?.titleStyle}">
                                ${welcomePage.title}
                            </div>
                        </div>
                        ${welcomePage?.subtitle ? html`
                            <div class="mb-4">
                                <div class="${welcomePage.display?.subtitleClass || "display-6 text-gray-700 fw-medium"}" style="${welcomePage.display?.subtitleStyle}">
                                    ${welcomePage.subtitle}
                                </div>
                            </div>
                        ` : nothing}
                    </div>
                `: nothing}

                <!-- Custom content -->
                ${welcomePage?.content ? html`
                    <div class="mb-5">
                        <div class="${welcomePage.display?.contentClass || "fs-4"}" style="${welcomePage.display?.contentStyle || "max-width: 1200px;"}">
                            ${UtilsNew.renderHTML(welcomePage.content)}
                        </div>
                    </div>
                ` : nothing}

                <!-- Applications or tools -->
                <div class="mt-5">
                    ${isWelcomeSuite ? this.renderApplications() : this.renderTools()}
                </div>

                <!-- Logo at the bottom of the content -->
                ${welcomePage?.bottomLogo?.img ? html`
                    <div id="bottomLogo">
                        ${welcomePage.bottomLogo.link ? html `
                            <a href="${welcomePage.bottomLogo.link}" target="blank">
                                <img
                                    src="${welcomePage.bottomLogo.img}"
                                    height="${welcomePage.bottomLogo.height || "60px"}"
                                />
                            </a>
                        ` : html `
                            <img
                                src="${welcomePage.bottomLogo.img}"
                                height="${welcomePage.bottomLogo.height || "60px"}"
                            />
                        `}
                    </div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("welcome-page", WelcomePage);
