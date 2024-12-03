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

    isWelcomeSuite() {
        return !this.app || this.app?.id === "suite";
    }

    getWelcomePageConfig() {
        return this.isWelcomeSuite() ? this.config.welcomePage : this.app.welcomePage;
    }

    renderApplicationsOrTools() {
        const session = this.opencgaSession;

        if (this.isWelcomeSuite()) {
            // Render applications list
            const visibleApps = (this.config.apps || []).filter(app => {
                return UtilsNew.isAppVisible(app, session);
            });

            return html`
                <div class="row">
                    ${visibleApps.map(item => html`
                        <div class="col-3">
                            <div class="d-block text-decoration-none text-body rounded-3">
                                <div class="d-flex mb-3">
                                    <div class="d-flex fs-1 text-white bg-primary rounded-4 p-3">
                                        <i class="fas ${item.icon}"></i>
                                    </div>
                                </div>
                                <div class="text-decoration-none fs-3 fw-bold mb-1">${item.title || item.name}</div>
                                ${item.description ? html`
                                    <div class="fs-5 mb-3">${item.description}</div>
                                ` : nothing}
                                <div class="">
                                    <a href="#${item.id}/home" class="d-flex align-items-center gap-2 icon-link cursor-pointer fs-5 text-decoration-none">
                                        <span class="text-decoration-underline">Open ${item.name || item.title} App</span>
                                        <i class="fas fa-chevron-right text-decoration-none"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            `;
        } else {
            // Render tools list
            const featuredTools = [];
            (this.app.menu || []).forEach(item => {
                if (UtilsNew.isAppVisible(item, session)) {
                    // Check if the primary menu item is featured
                    if (item.featured) {
                        featuredTools.push(item);
                    }

                    // Check for submenu items
                    (item.submenu || []).forEach(subitem => {
                        if (UtilsNew.isAppVisible(subitem) && subitem.featured) {
                            featuredTools.push(subitem);
                        }
                    });
                }
            });

            return html`
                <div class="d-flex justify-content-center mt-2 gap-2">
                    ${
                        featuredTools.map(item => {
                            const itemLink = `${item.id}${session?.project ? `/${session?.project?.id}/${session?.study?.id}`: ""}`;
                            return html`
                                <div class="card w-50 shadow p-3 mb-5 bg-body rounded border-0" data-cy-welcome-card-id="${item.id}">
                                    <div class="card-body d-flex flex-column">
                                        <a class="text-decoration-none" href="#${itemLink}">
                                            <div class="text-center">
                                                ${ item?.icon.includes("fas") ? html`
                                                    <i class="${item.icon}" style="font-size: 5em;"></i>
                                                ` : html`
                                                    <img alt="${item.name}" width="100px" src="${item.icon}"/>
                                                `}
                                            </div>
                                            <h4 class="card-title text-center">${item.name}</h4>
                                        </a>
                                        ${item.description ? UtilsNew.renderHTML(item.description) : ""}
                                            <a class="btn btn-primary btn-lg mt-auto text-white" href="#${itemLink}">
                                                Enter
                                            </a>
                                    </div>
                                </div>
                            `;
                        })
                    }
                </div>
            `;
        }
    }

    render() {
        const welcomePage = this.getWelcomePageConfig();

        if (!UtilsNew.isNotEmptyArray(this.opencgaSession?.projects) ||
            this.opencgaSession.projects.every(p => !UtilsNew.isNotEmptyArray(p.studies))) {
            return guardPage("You don't have projects or/and studies. Please contact the admin");
        }

        return html`
            <div class="container mt-3">
                <!-- Welcome page logo -->
                ${welcomePage?.logo ? html`
                    <div class="text-center mt-5">
                        <img
                            alt="${welcomePage.display?.logoAlt || "logo"}"
                            class="${welcomePage.display?.logoClass}"
                            src="${welcomePage.logo}"
                            style="${welcomePage.display?.logoStyle}"
                            width="${welcomePage.display?.logoWidth || "300px"}"
                        />
                    </div>
                ` : nothing}

                <!-- Welcome page title -->
                ${welcomePage?.title ? html`
                    <div class="d-flex justify-content-center my-3">
                        <img src="${welcomePage.appLogo?.img}" height="${welcomePage.appLogo?.height || "40px"}"/>
                        <h1 class="${welcomePage.display?.titleClass}" style="${welcomePage.display?.titleStyle}">
                            ${welcomePage.title}
                        </h1>
                    </div>
                `: nothing}

                <!-- Welcome page subtitle -->
                ${welcomePage?.subtitle ? html`
                    <h4 class="${welcomePage.display?.subtitleClass}" style="${welcomePage.display?.subtitleStyle}">
                        ${welcomePage.subtitle}
                    </h4>
                ` : nothing}

                <!-- Custom content -->
                ${welcomePage?.content ? html`
                    <div style="${welcomePage.display?.contentStyle || "margin-bottom:16px;"}">
                        ${UtilsNew.renderHTML(welcomePage.content)}
                    </div>
                ` : nothing}

                <!-- Applications or tools -->
                ${this.renderApplicationsOrTools()}

                <!-- Display custom links -->
                <div class="text-center mt-5">
                    ${(welcomePage?.links || []).map(link => html`
                        <a class="getting-started" href="${link.url}" target="${link.target || "_blank"}"><span>${link.title}</span></a>
                    `)}
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
