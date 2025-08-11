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
                            <div class="mb-3">
                                ${item.illustration ?
                                    html`
                                        <a href="#${item.id}/home"
                                           class="text-decoration-none rounded-4">
                                            <img src="${item.illustration}" height="100px" width="100px">
                                        </a>
                                    ` : html`
                                        <a href="#${item.id}/home"
                                           class="text-decoration-none d-flex align-items-center justify-content-center bg-primary bg-gradient rounded-4" style="width:4.5rem;height:4.5rem;">
                                            <i class="fas ${item.icon} fs-1 text-white"></i>
                                        </a>
                                    `
                                }
                            </div>
                            <a href="#${item.id}/home" class="d-block text-decoration-none text-body fs-3 fw-bold mb-1">
                                <span>${item.title || item.name}</span>
                            </a>
                            ${item.description ? html`
                                <div class="fs-5 mb-3 text-gray-700">
                                    ${item.description}
                                </div>
                            ` : nothing}
                            <div class="d-flex">
                                <a class="btn border border-dark rounded-circle" href="#${item.id}/home">
                                    <i class="fas fa-arrow-right"></i>
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
                    <div class="col-3 mb-5 d-flex flex-column justify-content-between gap-3" data-cy-welcome-card-id="${item.id}">
                        <div class="d-none mb-3">
                            <div class="d-flex align-items-center justify-content-center bg-gray-200 rounded-4" style="width:3rem;height:3rem;">
                                <i class="fas ${item.icon} fs-2"></i>
                            </div>
                        </div>
                        <div class="d-flex flex-column gap-1">
                            <a href="#${this.app.id}/${item.id}" class="d-block fs-3 fw-bold text-decoration-none text-body">
                                <span>${item.title || item.name}</span>
                            </a>
                            ${item.description ? html`
                                <div class="fs-5 text-gray-700">
                                    ${UtilsNew.renderHTML(item.description)}
                                </div>
                            ` : nothing}
                        </div>
                        <div class="d-flex">
                            <a class="btn border border-dark rounded-circle" href="#${this.app.id}/${item.id}">
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
                <div class="mb-5">
                <!-- Welcome page logo -->
                ${welcomePage?.logo ? html`
                    <div class="mb-3">
                        <img
                            alt="${welcomePage.display?.logoAlt || "logo"}"
                            class="${welcomePage.display?.logoClass}"
                            src="${welcomePage.logo}"
                            style="${welcomePage.display?.logoStyle}"
                            width="${welcomePage.display?.logoWidth ?? "240px"}"
                            height="${welcomePage.display?.logoHeight ?? "auto"}"
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
                                <div class="${welcomePage.display?.subtitleClass || "fs-1 text-gray-700 fw-medium"}" style="${welcomePage.display?.subtitleStyle}">
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
                </div>

                <!-- Applications or tools -->
                <div class="pt-5 pb-5 mb-5">
                    ${isWelcomeSuite ? this.renderApplications() : this.renderTools()}
                </div>

                <!-- Logo at the bottom of the content -->
                ${welcomePage?.bottomLogo ? html`
                    <div class="mt-5 pt-5">
                        <img
                            src="${welcomePage.bottomLogo}"
                            width="${welcomePage.display?.bottomLogoWidth ?? ""}"
                            height="${welcomePage.display?.bottomLogoHeight ?? "auto"}"
                        />
                    </div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("welcome-page", WelcomePage);
