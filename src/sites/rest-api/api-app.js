/* eslint-disable no-constant-condition */
/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */
/* eslint-disable valid-jsdoc */
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

import {LitElement, html} from "lit";
import {OpenCGAClient} from "../../core/clients/opencga/opencga-client.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";
import {ReactomeClient} from "../../core/clients/reactome/reactome-client.js";
import UtilsNew from "../../core/utilsNew.js";
import NotificationUtils from "../../webcomponents/NotificationUtils.js";
import LitUtils from "../../webcomponents/commons/utils/lit-utils.js";
import "../../webcomponents/user/opencga-login.js";
import "../../webcomponents/loading-spinner.js";
import "../../webcomponents/commons/tool-header.js";
import "../../webcomponents/Notification.js";
import "../../webcomponents/commons/layouts/custom-footer.js";
import "../../webcomponents/commons/layouts/custom-navbar.js";
import "../../webcomponents/commons/layouts/custom-page.js";
import "../../webcomponents/commons/layouts/custom-sidebar.js";
import "../../webcomponents/commons/layouts/custom-welcome.js";
import "../../webcomponents/api/rest-api.js";

class ApiApp extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    /**
     * This function creates all the initial configuration
     * @private
     */
    _init() {
        // Create the 'config' , this objects contains all the different configuration
        const _config = SUITE;
        _config.opencga = opencga;
        _config.cellbase = cellbase;
        _config.tools = tools;
        _config.pages = typeof CUSTOM_PAGES !== "undefined" ? CUSTOM_PAGES : [];

        // We can customise which components are active by default, this improves the first loading time.
        _config.enabledComponents = {};
        _config.enabledComponents.home = true;

        // Enable tools reading the configuration
        for (const tool in _config.tools) {
            if (UtilsNew.isNotUndefinedOrNull(_config.tools[tool].active)) {
                _config.enabledComponents[tool] = _config.tools[tool].active;
            }
        }

        // console.log("this.config.enabledComponents",_config.enabledComponents)
        const components = [
            "home",
            "login",
            "settings",
            "account",
            "projects",
            "project",
            "rest-api"];

        for (const component of components) {
            _config.enabledComponents[component] = false;
        }

        // Register custom page component
        // Only will be displayed if no other component matches the current url
        _config.enabledComponents["customPage"] = false;

        // We set the global Polymer variable, this produces one single event
        this.config = _config;

        // Initially we load the SUIte config
        this.app = this.getActiveAppConfig();

        // We need to listen to hash fragment changes to update the display and breadcrumb
        const _this = this;
        window.onhashchange = function (e) {
            // e.preventDefault();
            _this.hashFragmentListener(_this);
        };

        // Remember the tool that was previously set
        this.tool = window.location.hash.split("/")[0];
        if (UtilsNew.isEmpty(this.tool)) {
            this.tool = "#home";
        }

        // Go to the page that tool has
        if (window.location.hash !== this.tool) {
            window.location.hash = this.tool;
        }

        // Other initialisations
        this._isBreadcrumbVisible = false;
        // This manages the sample selected in each tool for updating the breadcrumb

        // this.samples = [];
        // this._samplesPerTool = {};


        // TODO remove browserSearchQuery
        // this.browserSearchQuery = {};
        // keeps track of the executedQueries transitioning from browser tool to facet tool
        this.queries = [];
        // keeps track of status and version of the hosts (opencga and cellbase)
        this.host = {};
        globalThis.addEventListener("signingIn", e => {
            this.signingIn = e.detail.value;
            this.requestUpdate();
        }, false);

        globalThis.addEventListener("signingInError", e => {
            new NotificationQueue().push("Error", e.detail.value, "error", true, false);
        }, false);

        globalThis.addEventListener("hostInit", e => {
            this.host = {...this.host, [e.detail.host]: e.detail.value};
            this.requestUpdate();
        }, false);

    }

    connectedCallback() {
        super.connectedCallback();
        new NotificationQueue().setContext(this);

        // Initialise clients and create the session
        // this.opencgaClientConfig = new OpenCGAClientConfig(this.config.opencga.host, this.config.opencga.version, true, this.config.opencga.cookie.prefix);
        // this.opencgaClientConfig.serverVersion = this.config.opencga.serverVersion;
        const sid = Cookies.get(this.config.opencga.cookie.prefix + "_sid");
        const userId = Cookies.get(this.config.opencga.cookie.prefix + "_userId");
        this.opencgaClient = new OpenCGAClient({
            host: this.config.opencga.host,
            version: this.config.opencga.version,
            token: sid,
            userId: userId,
            cookies: {active: true, prefix: this.config.opencga.cookie.prefix},
            // TODO remove this soon!
            // serverVersion: this.config.opencga.serverVersion
        });

        // this.cellBaseClientConfig = new CellBaseClientConfig(this.config.cellbase.hosts, this.config.cellbase.version, "hsapiens");
        this.cellbaseClient = new CellBaseClient({
            host: this.config.cellbase.host,
            version: this.config.cellbase.version,
            species: "hsapiens"
        });

        console.log("cellbaseClient iva-app", this.cellbaseClient);

        this.reactomeClient = new ReactomeClient();

        if (UtilsNew.isNotEmpty(sid)) { // && !this._publicMode
            // this.opencgaClient._config.token = sid;
            this._createOpenCGASession();
            // This must happen after creating the OpencgaClient
            this.checkSessionActive();
            this.intervalCheckSession = setInterval(this.checkSessionActive.bind(this), this.config.session.checkTime);
        } else {
            this._createOpencgaSessionFromConfig();
        }
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
    }

    opencgaSessionObserver() {
        this.renderHashFragments();
        this.queries = {};
        this.requestUpdate();
    }

    async _createOpenCGASession() {
        this.signingIn = "Creating session..";
        this.requestUpdate();
        await this.updateComplete;
        this.opencgaClient.createSession()
            .then(response => {
                const _response = response;
                console.log("_createOpenCGASession", response);
                // check if project array has been defined in the config.js
                if (UtilsNew.isNotEmptyArray(this.config.opencga.projects)) {
                    // We store the project and study ids the user needs to visualise (defined in the config.js)
                    const configProjects = {};
                    for (let i = 0; i < this.config.opencga.projects.length; i++) {
                        configProjects[this.config.opencga.projects[i].id] = [];

                        for (let j = 0; j < this.config.opencga.projects[i].studies.length; j++) {
                            configProjects[this.config.opencga.projects[i].id].push(
                                this.config.opencga.projects[i].studies[j].id
                            );
                        }
                    }

                    // We must keep only the projects defined in the configuration file
                    const activeProjects = [];
                    for (let i = 0; i < response.projects.length; i++) {
                        if (response.projects[i].id in configProjects) {
                            const project = response.projects[i];
                            const activeStudies = [];
                            for (let j = 0; j < project.studies.length; j++) {
                                const study = project.studies[j];
                                if (configProjects[project.id].indexOf(study.id) > -1) {
                                    activeStudies.push(study);
                                }
                            }

                            // We replace the studies obtained with the ones from the configuration file
                            project.studies = activeStudies;
                            activeProjects.push(project);
                        }
                    }

                    // TODO we must query projects/info URL to get the whole object
                    _response.projects = activeProjects || [];
                    if (UtilsNew.isNotEmptyArray(response.projects[0].studies)) {
                        _response.project = response.projects[0];
                        _response.study = response.projects[0].studies[0];
                    }
                }
                // this forces the observer to be executed.
                this.opencgaSession = {..._response};
                this.opencgaSession.mode = this.config.mode;
                // this.config.menu = [...application.menu];
                this.config = {...this.config};
            })
            .catch(e => {
                // console.error(e);
                // UtilsNew.notifyError(e);
                LitUtils.dispatchEventCustom(this, "notifyResponse", e);
            }).finally(() => {
                this.signingIn = false;
                this.requestUpdate();
                // this.updateComplete;
            });
    }

    // TODO turn this into a Promise
    _createOpencgaSessionFromConfig() {
        // Create a private opencga-session to avoid calling to the Observer
        const opencgaSession = this.opencgaClient.createAnonymousSession();

        // If 'config.opencga.anonymous' exists and contains either 'user' or 'projects'
        if (UtilsNew.isNotUndefinedOrNull(this.config.opencga.anonymous) && Object.keys(this.config.opencga.anonymous).length > 0) {
            // If 'projects' is defined we only load those projects
            if (UtilsNew.isNotUndefinedOrNull(this.config.opencga.anonymous.projects)) {
                if (this.config.opencga.anonymous.projects.length > 0) {
                    // TODO we must query projects/info URL to get the whole object
                    opencgaSession.projects = this.config.opencga.anonymous.projects;
                    if (UtilsNew.isNotEmptyArray(opencgaSession.projects[0].studies)) {
                        opencgaSession.project = opencgaSession.projects[0];
                        opencgaSession.study = opencgaSession.projects[0].studies[0];
                    }
                }

                // This triggers the event and call to opencgaSessionObserver
                this.opencgaSession = opencgaSession;
            } else {
                // When no 'projects' is defined we fetch all public projects
                if (UtilsNew.isNotUndefinedOrNull(this.config.opencga.anonymous.user)) {
                    this.opencgaClient.users().projects(this.config.opencga.anonymous.user, {})
                        .then(restResponse => {
                            // _this._setup(_projects);

                            opencgaSession.projects = restResponse.response[0].result;
                            if (UtilsNew.isNotEmptyArray(opencgaSession.projects) && UtilsNew.isNotEmptyArray(opencgaSession.projects[0].studies)) {
                                // this sets the current active project and study
                                opencgaSession.project = opencgaSession.projects[0];
                                opencgaSession.study = opencgaSession.projects[0].studies[0];
                            }

                            // This triggers the event and call to opencgaSessionObserver
                            this.opencgaSession = opencgaSession;
                        })
                        .catch(function (response) {
                            console.log("An error when getting projects");
                            console.log(response);
                        });
                }
            }
        } else {
            // This triggers the event and call to opencgaSessionObserver
            this.opencgaSession = opencgaSession;
        }
    }

    onLogin(credentials) {
        // This creates a new authenticated opencga-session object
        this.opencgaClient._config.token = credentials.detail.token;
        this._createOpenCGASession();

        if (this.tool === "#login") {
            this.tool = "#home";
            this.app = this.getActiveAppConfig();
        }

        // 60000 ms = 1 min. Every 1 min we check if session is close to expire.
        this.intervalCheckSession = setInterval(this.checkSessionActive.bind(this), this.config.session.checkTime);
    }

    refresh() {
        this.opencgaClient.refresh();
    }

    async logout() {
        // this delete token in the client and removes the Cookies
        await this.opencgaClient.logout();
        this._createOpencgaSessionFromConfig();

        this.tool = "#home";
        this.app = this.getActiveAppConfig();
        window.location.hash = "home";
        window.clearInterval(this.intervalCheckSession);
    }

    async saveLastStudy(newStudy) {
        const userConfig = await this.opencgaClient.updateUserConfigs({
            ...this.opencgaSession.user.configs.IVA,
            lastStudy: newStudy.fqn
        });
        this.opencgaSession.user.configs.IVA = userConfig.responses[0].results[0];
    }

    onUrlChange(e) {
        let hashFrag = e.detail.id;
        if (UtilsNew.isNotUndefined(this.opencgaSession.project) && UtilsNew.isNotEmpty(this.opencgaSession.project.alias)) {

            hashFrag += "/" + this.opencgaSession.project.alias;
            if (UtilsNew.isNotUndefined(this.opencgaSession.study) && UtilsNew.isNotEmpty(this.opencgaSession.study.alias)) {
                hashFrag += "/" + this.opencgaSession.study.alias;
            }
        }

        const myQueryParams = [];
        for (const key in e.detail.query) {
            myQueryParams.push(key + "=" + e.detail.query[key]);
        }
        if (myQueryParams.length > 0) {
            hashFrag += `?${myQueryParams.join("&")}`;
        }

        window.location.hash = hashFrag;
    }

    checkSessionActive() {
        let _message = "";
        // We check if refresh token has updated session id cookie
        // let sid = Cookies.get(this.config.opencga.cookie.prefix + "_sid");

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaClient._config.token)) { // UtilsNew.isNotEmpty(this.opencgaSession.token) &&
            // this.token = sid;
            const decoded = jwt_decode(this.opencgaClient._config.token);
            const currentTime = new Date().getTime();
            const remainingTime = ((decoded.exp * 1000) - currentTime);
            // 600000 ms = 10 min = 1000(1sec) * 60(60 sec = 1min) * 10(10 min)
            if (remainingTime <= this.config.session.maxRemainingTime && remainingTime >= this.config.session.minRemainingTime) {
                const remainingMinutes = Math.floor(remainingTime / this.config.session.minRemainingTime);

                // _message = html`Your session is close to expire. <strong>${remainingMinutes}
                // minutes remaining</strong> <a href="javascript:void 0" @click="${() => this.notifySession.refreshToken()}"> Click here to refresh </a>`
                new NotificationQueue().pushRemainingTime(remainingMinutes, this.opencgaClient);

            } else {
                // TODO remove NotificationUtils
                if (remainingTime < this.config.session.minRemainingTime) {
                    _message = "Your session has expired.";
                    this.logout();
                    window.clearInterval(this.intervalCheckSession);
                } else {
                    if (UtilsNew.isNotUndefinedOrNull(this.notifySession)) {
                        NotificationUtils.closeNotify(this.notifySession);
                    }
                    return;
                }
            }
        } else {
            // _message = "Your session has expired.";
            // window.clearInterval(this.intervalCheckSession);
        }
        // delay = 0 to fix the notify until user closes it.
        if (UtilsNew.isNotEmpty(_message)) {
            this.notifySession = NotificationUtils.showNotify(_message, UtilsNew.MESSAGE_INFO,
                {}, {
                    delay: 0,
                    onClosed: this.onCloseRefreshNotify.bind(this)
                }, this.opencgaClient, this.notifySession);
        }
    }

    onCloseRefreshNotify() {
        delete this.notifySession;
    }

    changeTool(e) {
        e.preventDefault();
        const target = e.currentTarget;
        $(".navbar-inverse ul > li", this).removeClass("active");
        $(target).parent("li").addClass("active");
        if ($(target).closest("ul").hasClass("dropdown-menu")) {
            $(target).closest("ul").closest("li").addClass("active");
        }

        if (UtilsNew.isNotUndefined(e)) {
            // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
            e.preventDefault();
        }

        if (UtilsNew.isNotUndefined(target) && UtilsNew.isNotUndefined(target.attributes.href)) {
            this.tool = target.attributes.href.value;
        } else {
            this.tool = "#home";
        }

        this.renderHashFragments();
    }

    renderHashFragments() {
        console.log("renderHashFragments - DEBUG", this.tool);
        let hashFrag = this.tool;
        if (this.opencgaSession?.project?.alias) {

            hashFrag += "/" + this.opencgaSession.project.id;
            if (UtilsNew.isNotUndefined(this.opencgaSession.study) && UtilsNew.isNotEmpty(this.opencgaSession.study.alias)) {
                hashFrag += "/" + this.opencgaSession.study.id;
            }
        }

        if (window.location.hash === hashFrag) {
            // debugger
            this.hashFragmentListener(this);
        } else {
            // debugger
            window.location.hash = hashFrag;
        }
    }

    route(e) {
        this.tool = e.detail.hash;
        if (e.detail?.resource) {
            this.queries = {...this.queries, [e.detail.resource]: e.detail?.query};
        }
        this.renderHashFragments();
    }

    hashFragmentListener(ctx) {
        console.log("hashFragmentListener - DEBUG", this.tool);
        // Hide all elements
        for (const element in this.config.enabledComponents) {
            if (UtilsNew.isNotUndefined(this.config.enabledComponents[element])) {
                this.config.enabledComponents[element] = false;
            }
        }
        let arr = window.location.hash.split("/");

        // TODO evaluate refactor
        const [hashTool, hashProject, hashStudy, feature] = arr;

        // Stopping the recursive call
        if (hashTool !== this.tool || hashProject !== this.opencgaSession?.project?.id || hashStudy !== this.opencgaSession?.study?.id) {
            if (arr.length > 1) {
                // Field 'project' is being observed, just in case Polymer triggers
                // an unnecessary event we can check they are really different
                if (ctx.opencgaSession?.project?.id !== hashProject) {
                    // eslint-disable-next-line no-param-reassign
                    ctx.opencgaSession.project.id = hashProject;
                }
                if (ctx.opencgaSession?.study && arr.length > 2 && ctx.opencgaSession.study !== hashStudy) {
                    for (let i = 0; i < ctx.opencgaSession.projects.length; i++) {
                        if (ctx.opencgaSession.projects[i].name === ctx.opencgaSession.project.name ||
                            ctx.opencgaSession.projects[i].id === ctx.opencgaSession.project.id) {
                            for (let j = 0; j < ctx.opencgaSession.projects[i].studies.length; j++) {
                                if (ctx.opencgaSession.projects[i].studies[j].name === hashStudy || ctx.opencgaSession.projects[i].studies[j].id === hashStudy) {
                                    ctx.opencgaSession.study = ctx.opencgaSession.projects[i].studies[j];
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
            ctx.tool = hashTool;
        }

        const searchArr = window.location.hash.split("?");
        if (searchArr.length > 1) {
            const search = searchArr[1];
            arr = search.split("&");
            const query = {};
            for (let i = 0; i < arr.length; i++) {
                const split = arr[i].split("=");
                query[split[0]] = split[1];
            }
            this.query = query;
        }

        const componentName = this.tool.replace("#", "");
        if (UtilsNew.isNotUndefined(this.config.enabledComponents[componentName])) {
            this.config.enabledComponents[componentName] = true;
        } else {
            // If the component does not exist, mark as custom page
            this.config.enabledComponents["customPage"] = true;
        }

        this.config = {...this.config};

        // TODO quickfix to avoid hash browser scroll
        $("body,html").animate({
            scrollTop: 0
        }, 1);
    }

    onStudySelect(e, study, project) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        this.changeActiveStudy(study.fqn);
    }

    changeActiveStudy(studyFqn) {
        if (this.opencgaSession.study.fqn === studyFqn) {
            console.log("New selected study is already the current active study!");
            return;
        }

        // Change active study
        let studyFound = false;
        for (const project of this.opencgaSession.projects) {
            const studyIndex = project.studies.findIndex(s => s.fqn === studyFqn);
            if (studyIndex >= 0) {
                this.opencgaSession.project = project;
                this.opencgaSession.study = project.studies[studyIndex];
                studyFound = true;
                break;
            }
        }

        if (studyFound) {
            // Update the lastStudy in config iff has changed
            this.opencgaClient.updateUserConfigs({...this.opencgaSession.user.configs, lastStudy: studyFqn});

            // Refresh the session
            this.opencgaSession = {...this.opencgaSession};
        } else {
            // TODO Convert this into a user notification
            console.error("Study not found!");
        }
    }

    // TODO remove
    onNotifyMessage(e) {
        new NotificationQueue().push(e.detail.title, e.detail.message, e.detail.type);
    }

    onChangeApp(e, toggle) {
        // If an App ID exists we display the corresponding app. If not we just show the Suite
        if (e.currentTarget.dataset.id) {
            this.app = this.config.apps.find(app => app.id === e.currentTarget.dataset.id);
        } else {
            this.app = this.getActiveAppConfig();
        }

        // We only want to toggle when clicked in the sidenav
        if (toggle) {
            this.toggleSideBar(e);
        }

        this.changeTool(e);
        this.requestUpdate();
    }

    getActiveAppConfig() {
        const visibleApps = this.config.apps.filter(app => app.visibility === "public");
        // If there is only ona visible App we DO NOT need to show the Suite welcome, just the App.
        if (visibleApps.length === 1) {
            return visibleApps[0];
        } else {
            // Render the Suite welcome page.
            return {
                id: this.config.id,
                name: this.config.name,
                welcome: this.config.welcome,
                version: this.config.version,
                logo: this.config.logo,
                about: this.config.about,
                userMenu: this.config.userMenu,
            };
        }
    }

    isLoggedIn() {
        return !!this?.opencgaSession?.token;
    }

    renderCustomPage() {
        const pageName = this.tool.replace("#", "");
        const page = (this.config.pages || []).find(p => p.url === pageName);

        if (page) {
            return html`
                <div class="content" id="page">
                    <custom-page .page="${page}"></custom-page>
                </div>
            `;
        }

        return html`Not found :(`;
    }

    render() {
        return html`
            <style>
                .notification-nav {
                    margin-right: 0;
                }

                .notification-nav > li > a .badge  {
                    position: relative;
                    z-index: 10;
                    bottom: -7px;
                    left: 11px;
                    background-color: #41a7ff;
                }

                .center {
                    margin: auto;
                    text-align: justify;
                    width: 60%;
                    font-size: 18px;
                    color: #797979;
                }

                .feature-view {
                    margin: auto;
                    text-align: justify;
                    width: 90%;
                }

                #login {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>

            <!-- Navbar -->
            <custom-navbar
                .app=${this.app}
                .loggedIn=${this.isLoggedIn()}
                .opencgaSession=${this.opencgaSession}
                .config=${this.config}
                @logout=${e => this.logout()}
                @changeTool=${e => this.changeTool(e.detail.value)}
                @changeApp=${e => this.onChangeApp(e.detail.event, e.detail.toggle)}
                @route="${this.route}">
            </custom-navbar>
            <!-- End of navigation bar -->

            ${this.signingIn ? html`
                <div class="login-overlay">
                    <loading-spinner
                        .description="${this.signingIn}">
                    </loading-spinner>
                </div>
            ` : null}

            <!-- This is where main IVA application is rendered -->
            <div class="container-fluid">
                ${this.config.enabledComponents.home ? html`
                        <div class="content" id="home">
                            <custom-welcome
                                .app="${this.app}"
                                .config="${this.config}"
                                .opencgaSession="${this.opencgaSession}"
                                .version="${this.config.version}"
                                @changeApp="${e => this.onChangeApp(e.detail.e, false)}">
                            </custom-welcome>
                        </div>
                    ` : null}
                <!-- Render custom page content if enabled -->
                ${this.config.enabledComponents.customPage ? this.renderCustomPage() : null}

                ${this.config.enabledComponents.terms ? html`
                    <div class="content" id="terms">
                        <terms-web version="${this.config.version}"></terms-web>
                    </div>
                ` : null}

                ${this.config.enabledComponents.contact ? html`
                    <div class="content" id="contact">
                        <contact-web version="${this.config.version}"></contact-web>
                    </div>
                ` : null}

                ${this.config.enabledComponents.faq ? html`
                    <div class="content" id="faq">
                        <faq-web version="${this.config.version}"></faq-web>
                    </div>
                ` : null}

                ${this.config.enabledComponents.login ? html`
                    <div class="content" id="login">
                        <opencga-login
                            .opencgaSession="${this.opencgaSession}"
                            loginTitle="Sign in"
                            .notifyEventMessage="${this.config.notifyEventMessage}"
                            @login="${this.onLogin}"
                            @route="${this.route}">
                        </opencga-login>
                    </div>
                ` : null}

                ${this.config.enabledComponents["rest-api"] ? html`
                    <tool-header title="REST API" icon="${"fas fa-rocket"}"></tool-header>
                    <div class="content">
                        <rest-api .opencgaSession="${this.opencgaSession}"></rest-api>
                    </div>
                ` : null}
            </div>

            <custom-footer
                .host=${this.host}
                .config=${this.config}>
            </custom-footer>

            <notification-element
                .queue="${new NotificationQueue().get()}">
            </notification-element>
        `;
    }

}

customElements.define("api-app", ApiApp);

