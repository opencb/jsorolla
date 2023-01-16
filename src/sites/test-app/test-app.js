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

import {html, LitElement} from "lit";
import "./getting-started.js";
import "./iva-settings.js";

// @dev[jsorolla]
import {OpenCGAClient} from "../../core/clients/opencga/opencga-client.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";
import {ReactomeClient} from "../../core/clients/reactome/reactome-client.js";

import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../../webcomponents/commons/utils/notification-utils.js";
import NotificationManager from "../../core/notification-manager.js";

import AnalysisRegistry from "../../webcomponents/variant/analysis/analysis-registry.js";
import "../../webcomponents/clinical/clinical-analysis-browser.js";
import "../../webcomponents/clinical/clinical-analysis-portal.js";
import "../../webcomponents/variant/variant-browser.js";
import "../../webcomponents/variant/variant-beacon.js";
import "../../webcomponents/opencga/opencga-gene-view.js";
import "../../webcomponents/opencga/opencga-transcript-view.js";
import "../../webcomponents/opencga/opencga-protein-view.js";
import "../../webcomponents/user/opencga-projects.js";
import "../../webcomponents/sample/sample-browser.js";
import "../../webcomponents/sample/sample-view.js";
import "../../webcomponents/sample/sample-variant-stats-browser.js";
import "../../webcomponents/sample/sample-cancer-variant-stats-browser.js";
import "../../webcomponents/sample/sample-update.js";
import "../../webcomponents/disease-panel/disease-panel-browser.js";
import "../../webcomponents/disease-panel/disease-panel-update.js";
import "../../webcomponents/file/file-browser.js";
// import "../../webcomponents/file/file-update.js";
import "../../webcomponents/family/family-browser.js";
import "../../webcomponents/family/family-update.js";
import "../../webcomponents/individual/individual-browser.js";
import "../../webcomponents/individual/individual-update.js";
import "../../webcomponents/cohort/cohort-browser.js";
import "../../webcomponents/job/job-browser.js";
import "../../webcomponents/job/job-view.js";
import "../../webcomponents/clinical/analysis/mutational-signature-analysis.js";
import "../../webcomponents/variant/analysis/gwas-analysis.js";
import "../../webcomponents/variant/analysis/sample-variant-stats-analysis.js";
import "../../webcomponents/variant/analysis/cohort-variant-stats-analysis.js";
import "../../webcomponents/variant/analysis/sample-eligibility-analysis.js";
import "../../webcomponents/variant/analysis/inferred-sex-analysis.js";
import "../../webcomponents/variant/analysis/individual-relatedness-analysis.js";
import "../../webcomponents/variant/analysis/mendelian-error-analysis.js";
import "../../webcomponents/variant/analysis/sample-qc-analysis.js";
import "../../webcomponents/variant/analysis/individual-qc-analysis.js";
import "../../webcomponents/variant/analysis/family-qc-analysis.js";
import "../../webcomponents/variant/analysis/knockout-analysis.js";
import "../../webcomponents/variant/analysis/opencga-plink-analysis.js";
import "../../webcomponents/variant/analysis/opencga-gatk-analysis.js";
import "../../webcomponents/variant/analysis/variant-export-analysis.js";
import "../../webcomponents/variant/analysis/opencga-variant-stats-exporter-analysis.js";
import "../../webcomponents/variant/interpretation/variant-interpreter-browser-rd.js";
import "../../webcomponents/variant/interpretation/variant-interpreter-browser-cancer.js";
import "../../webcomponents/variant/interpretation/variant-interpreter-browser-rearrangement.js";
import "../../webcomponents/variant/interpretation/variant-interpreter.js";
import "../../webcomponents/clinical/analysis/rd-tiering-analysis.js";
import "../../webcomponents/clinical/analysis/hrdetect-analysis.js";
import "../../webcomponents/clinical/clinical-analysis-create.js";
import "../../webcomponents/file/file-manager.js";
import "../../webcomponents/job/job-monitor.js";
import "../../webcomponents/loading-spinner.js";
import "../../webcomponents/project/projects-admin.js";
import "../../webcomponents/study/admin/study-admin.js";
import "../../webcomponents/study/admin/catalog-admin.js";
import "../../webcomponents/study/admin/variant/study-variant-admin.js";
import "../../webcomponents/user/user-login.js";
import "../../webcomponents/user/user-profile.js";
// import "../../webcomponents/user/user-password-reset.js";
import "../../webcomponents/api/rest-api.js";

import "../../webcomponents/commons/layouts/custom-footer.js";
import "../../webcomponents/commons/layouts/custom-navbar.js";
import "../../webcomponents/commons/layouts/custom-page.js";
import "../../webcomponents/commons/layouts/custom-sidebar.js";
import "../../webcomponents/commons/layouts/custom-welcome.js";
import "../../webcomponents/clinical/rga/rga-browser.js";
import "../../webcomponents/visualization/genome-browser.js";


class TestApp extends LitElement {

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
        _config.cellbase = typeof CELLBASE_CONFIG !== "undefined" ? CELLBASE_CONFIG : null;
        _config.pages = typeof CUSTOM_PAGES !== "undefined" ? CUSTOM_PAGES : [];
        _config.consequenceTypes = CONSEQUENCE_TYPES;
        _config.populationFrequencies = POPULATION_FREQUENCIES;
        _config.proteinSubstitutionScores = PROTEIN_SUBSTITUTION_SCORE.style;

        console.log(DATA_FORM_EXAMPLE);

        // We can customise which components are active by default, this improves the first loading time.
        _config.enabledComponents = {};
        _config.enabledComponents.home = true;

        const components = [
            "home",
            "gettingstarted",
            "login",

            "data-form",
            "utils-new",
            "catalog-filters",
            "opencga-update",
            "variant-filters",
            "genome-browser",
            "lollipop",
            "pedigree",
            "mutational-signatures",
        ];

        for (const component of components) {
            _config.enabledComponents[component] = false;
        }

        // Register custom page component
        // Only will be displayed if no other component matches the current url
        _config.enabledComponents["customPage"] = false;

        // We set the global Polymer variable, this produces one single event
        this.config = _config;

        this.updateCellBaseClient();
        
        // Get version from env variable
        // eslint-disable-next-line no-undef
        this.version = process.env.VERSION;

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
            // this.app = null;
        }

        // Go to the page that tool has
        if (window.location.hash !== this.tool) {
            window.location.hash = this.tool;
        }

        // Other initialisations
        // This manages the sample selected in each tool for updating the breadcrumb
        this.samples = [];
        this._samplesPerTool = {};

        // Notifications
        this.notificationManager = new NotificationManager({});

        // Global notification
        this.addEventListener(NotificationUtils.NOTIFY, e => this.notificationManager.showNotification(e.detail));

        // Shortcuts for common notifications
        this.addEventListener(NotificationUtils.NOTIFY_INFO, e => this.notificationManager.info(e.detail.title, e.detail.message));
        this.addEventListener(NotificationUtils.NOTIFY_SUCCESS, e => this.notificationManager.success(e.detail.title, e.detail.message));
        this.addEventListener(NotificationUtils.NOTIFY_WARNING, e => this.notificationManager.warning(e.detail.title, e.detail.message));
        this.addEventListener(NotificationUtils.NOTIFY_ERROR, e => this.notificationManager.error(e.detail.title, e.detail.message));

        // Notify a response
        this.addEventListener(NotificationUtils.NOTIFY_RESPONSE, e => this.notificationManager.response(e.detail));

        // Show confirmation
        this.addEventListener(NotificationUtils.NOTIFY_CONFIRMATION, e => this.notificationManager.showConfirmation(e.detail));


        // TODO remove browserSearchQuery
        this.browserSearchQuery = {};
        // keeps track of the executedQueries transitioning from browser tool to facet tool
        this.queries = [];
        // keeps track of status and version of the hosts (opencga and cellbase)
        this.host = {};
        globalThis.addEventListener("signingIn", e => {
            this.signingIn = e.detail.value;
            this.requestUpdate();
        }, false);

        globalThis.addEventListener("signingInError", e => {
            this.notificationManager.error("Signing in error", e.detail.value);
        }, false);

        globalThis.addEventListener("hostInit", e => {
            this.host = {...this.host, [e.detail.host]: e.detail.value};
            this.requestUpdate();
        }, false);

    }

    connectedCallback() {
        super.connectedCallback();

        // Import server configuration from conf/server.json file (if exists)
        // See issue https://github.com/opencb/jsorolla/issues/425
        UtilsNew.importJSONFile("conf/server.json").then(serverConf => {

            // Initialize opencga configuration
            const opencgaHost = serverConf?.host || this.config.opencga.host;
            const opencgaVersion = serverConf?.version || this.config.opencga.version;
            const opencgaPrefix = serverConf?.cookie?.prefix || this.config.opencga.cookie.prefix;
            // console.log(opencgaHost, opencgaVersion);

            // Initialise clients and create the session
            // this.opencgaClientConfig.serverVersion = this.config.opencga.serverVersion;
            const sid = Cookies.get(opencgaPrefix + "_sid");
            const userId = Cookies.get(opencgaPrefix + "_userId");

            this.opencgaClient = new OpenCGAClient({
                host: opencgaHost,
                version: opencgaVersion,
                token: sid,
                userId: userId,
                cookies: {
                    active: true,
                    prefix: opencgaPrefix,
                },
            });

            this.reactomeClient = new ReactomeClient();

            if (sid) {
                this.checkSessionActive();
                this.intervalCheckSession = setInterval(this.checkSessionActive.bind(this), this.config.session.checkTime);
                this._createOpenCGASession();
            } else {
                this._createOpencgaSessionFromConfig();
            }
        });
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
        // This check prevents displaying the annoying message of 'No valid token:null' when the token has expired
        if (!this.opencgaClient._config.token) {
            return;
        }
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
                this.updateCellBaseClient();
                // this.config.menu = [...application.menu];
                this.config = {...this.config};
            })
            .catch(e => {
                console.error(e);
                this.notificationManager.error("Error creating session", e.message);
            })
            .finally(() => {
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
                this.updateCellBaseClient();
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
                            this.updateCellBaseClient();
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

        // console.log("iva-app: roger I'm in", credentials);
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

    // TODO: we should move this code to an OpenCGA Utils
    checkSessionActive() {
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

                // Handle session refresh
                const handleSessionRefresh = () => {
                    this.opencgaClient.refresh().then(response => {
                        const sessionId = response.getResult(0).token;
                        const decoded = jwt_decode(sessionId);
                        const dateExpired = new Date(decoded.exp * 1000);
                        const validTimeSessionId = moment(dateExpired, "YYYYMMDDHHmmss").format("D MMM YY HH:mm:ss");

                        // Display confirmation message
                        this.notificationManager.success(null, `Your session is now valid until ${validTimeSessionId}.`);
                    });
                };

                // Display expiration notification
                this.notificationManager.showNotification({
                    type: "warning",
                    display: {
                        showIcon: true,
                        showCloseButton: true,
                    },
                    title: "Your session is close to expire",
                    message: `
                        In <b>${remainingMinutes} minutes</b> your session will be automatically closed.
                        To keep working, please click on <b>Refresh Session</b> button.
                    `,
                    removeAfter: 20000,
                    buttons: [
                        {
                            text: "Refresh session",
                            onClick: () => handleSessionRefresh(),
                            removeOnClick: true,
                        }
                    ]
                });

            } else {
                if (remainingTime < this.config.session.minRemainingTime) {
                    this.logout();
                    window.clearInterval(this.intervalCheckSession);

                    // Display notification message
                    this.notificationManager.info(null, "Your session has expired");
                }
            }
        }
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
            e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        }

        if (UtilsNew.isNotUndefined(target) && UtilsNew.isNotUndefined(target.attributes.href)) {
            //                    $(e.target.attributes.href.value).show(); // get the href and use it find which div to show
            this.tool = target.attributes.href.value;
            if (UtilsNew.isNotUndefinedOrNull(this._samplesPerTool)) {
                if (this._samplesPerTool.hasOwnProperty(this.tool.replace("#", ""))) {
                    this.samples = this._samplesPerTool[this.tool.replace("#", "")];
                } else {
                    this.samples = [];
                }
            }
            // this.renderBreadcrumb()
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

            switch (hashTool) {
                case "#browser":
                    this.browserSearchQuery = Object.assign({}, this.browserSearchQuery);
                    break;
                case "#protein":
                    break;
                case "#interpreter":
                    this.clinicalAnalysisId = feature;
                    if (!this.clinicalAnalysisId) {
                        // Redirect to Case Portal when trying to access the interpreter without a valid Clinical Analysis ID
                        window.location.hash = `#clinicalAnalysisPortal/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}`;
                    }
                    break;
                case "#sampleVariantStatsBrowser":
                case "#sampleCancerVariantStatsBrowser":
                case "#fileUpdate":
                    this.fileId = feature;
                    break;
                case "#sampleUpdate":
                    this.sampleId = feature;
                    break;
                case "#individualUpdate":
                    this.individualId = feature;
                    break;
                case "#familyUpdate":
                    this.familyId = feature;
                    break;
                case "#study-admin":
                    // this.studyAdminFqn = arr[1];
                    this.changeActiveStudy(arr[1]);
                    break;
                case "#diseasePanelUpdate":
                    this.diseasePanelId = feature;
                    break;
            }

            if (UtilsNew.isNotEmpty(feature)) {
                if (hashTool === "#protein") {
                    ctx.protein = feature;
                } else if (feature.startsWith("ENST")) {
                    ctx.transcript = feature;
                } else {
                    ctx.gene = feature;
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

            // Refresh the session and update cellbase
            this.opencgaSession = {...this.opencgaSession};
            this.updateCellBaseClient();
        } else {
            // TODO Convert this into a user notification
            console.error("Study not found!");
        }
    }

    updateCellBaseClient() {
        // this.cellbaseClient = null; // Reset cellbase client
        //
        // if (this.opencgaSession?.project && this.opencgaSession?.project?.cellbase?.url) {
        //     this.cellbaseClient = new CellBaseClient({
        //         host: this.opencgaSession.project.cellbase.url.replace(/\/$/, ""),
        //         version: this.opencgaSession.project.cellbase.version,
        //         species: this.opencgaSession.project.organism.scientificName,
        //     });
        // } else {
        //     // Josemi 20220216 NOTE: we keep this old way to be backward compatible with OpenCGA 2.1
        //     // But this should be removed in future releases
        //     this.cellbaseClient = new CellBaseClient({
        //         host: this.config.cellbase.host,
        //         version: this.config.cellbase.version,
        //         species: "hsapiens",
        //     });
        // }
        // // This simplifies passing cellbaseCLient to all components
        // this.opencgaSession.cellbaseClient = this.cellbaseClient;
debugger
        this.cellbaseClient = new CellBaseClient({
            host: this.config.cellbase.host,
            version: this.config.cellbase.version,
            species: "hsapiens",
        });
    }

    updateProject(e) {
        this.project = this.projects.find(project => project.name === e.detail.project.name);
        this.tool = "#project";
        this.renderHashFragments();
        // this.renderBreadcrumb();
    }

    updateStudy(e) {
        if (UtilsNew.isNotUndefined(e.detail.project) && UtilsNew.isNotEmpty(e.detail.project.name)) {
            this.project = e.detail.project;
        }
        this.study = this.project.studies.find(study => study.name === e.detail.study.name || study.alias === e.detail.study.alias);

        //                TODO: Opencga study will be shown later. For now variant browser is shown when the study changes
        //                this.tool = "studyInformation";
        this.tool = "#browser";
        this.renderHashFragments();
        // this.renderBreadcrumb();
    }

    onSampleChange(e) {
        if (UtilsNew.isNotUndefinedOrNull(this.samples) && UtilsNew.isNotUndefinedOrNull(e.detail)) {
            this.samples = e.detail.samples;
            this._samplesPerTool[this.tool.replace("#", "")] = this.samples;
            // this.renderBreadcrumb();
        }
    }

    quickSearch(e) {
        // debugger
        this.tool = "#browser";
        window.location.hash = "browser/" + this.opencgaSession.project.id + "/" + this.opencgaSession.study.id;
        // this.browserQuery = {xref: e.detail.value};

        this.browserSearchQuery = e.detail;
    }

    quickFacetSearch(e) {
        console.log("IVA-APP quickfacetsearch");
        this.tool = "#facet";
        window.location.hash = "facet/" + this.opencgaSession.project.id + "/" + this.opencgaSession.study.id;
        // this.browserQuery = {xref: e.detail.value};
        this.browserSearchQuery = e.detail;
    }

    onJobSelected(e) {
        this.jobSelected = e.detail.jobId;
        this.requestUpdate();
    }

    // TODO remove
    onNotifyMessage(e) {
        this.notificationManager.info(e.detail.title, e.detail.message);
    }

    // TODO this should keep in sync the query object between variant-browser and variant-facet
    onQueryChange(e) {
        console.log("onQueryChange", e);
        this.browserSearchQuery = {...e.detail.query};
    }


    onQueryFilterSearch(e, source) {
        // FIXME filters component emits a event containing {detail:{query:Object}} while active-filter emits {detail:{Object}}
        // TODO fix active-filters
        const q = e.detail.query ? {...e.detail.query} : {...e.detail};
        this.queries[source] = {...q};
        this.queries = {...this.queries};
        // console.log("this.queries",this.queries);
        this.requestUpdate();
    }

    onSelectClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.clinicalAnalysis;
    }

    /* Set the width of the side navigation to 250px */
    openNav() {
        this.querySelector("#side-nav").style.width = "250px";
        console.log("open");
    }

    /* Set the width of the side navigation to 0 */
    closeNav() {
        this.querySelector("#side-nav").style.width = "0";
    }

    toggleSideBar(e) {
        e.preventDefault();
        // const sidenav = this.querySelector("#side-nav");
        $("#side-nav").toggleClass("active");
        $("#overlay").toggleClass("active");
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

    onSessionUpdateRequest() {
        this._createOpenCGASession();
    }

    onStudyUpdateRequest(e) {
        if (e.detail.value) {
            this.opencgaSession.opencgaClient.studies()
                .info(e.detail.value)
                .then(res => {
                    const updatedStudy = res.responses[0].results[0];
                    for (const project of this.opencgaSession.user.projects) {
                        if (project.studies?.length > 0) {
                            const studyIndex = project.studies.findIndex(study => study.fqn === e.detail.value);
                            if (studyIndex >= 0) {
                                project.studies[studyIndex] = updatedStudy;
                                break;
                            }
                        }
                    }

                    // Update opencgaSession.study if the study updated is the active one
                    if (this.opencgaSession.study && this.opencgaSession.study.fqn === e.detail.value) {
                        this.opencgaSession.study = updatedStudy;
                    }

                    this.opencgaSession = {...this.opencgaSession};
                    // this.requestUpdate();
                })
                .catch(e => {
                    console.error(e);
                    params.error(e);
                });
        }
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

        // No page found --> Render a not found error page (TODO)
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
            </style>

            <!-- <loading-bar></loading-bar> -->

            <!-- Left Sidebar: we only display this if more than 1 visible app exist -->
            <custom-sidebar
                .config="${this.config}"
                .loggedIn="${this.isLoggedIn()}"
                @changeApp="${e => this.onChangeApp(e.detail.event, e.detail.toggle)}"
                @sideBarToggle="${e => this.toggleSideBar(e.detail.event)}">
            </custom-sidebar>

            <!-- Navbar -->
            <custom-navbar
                .app="${this.app}"
                .version="${this.version}"
                .loggedIn="${this.isLoggedIn()}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.config}"
                @logout="${() => this.logout()}"
                @sideBarToggle="${e => this.toggleSideBar(e.detail.event)}"
                @changeTool="${e => this.changeTool(e.detail.value)}"
                @changeApp="${e => this.onChangeApp(e.detail.event, e.detail.toggle)}"
                @studySelect="${ e => this.onStudySelect(e.detail.event, e.detail.study)}"
                @jobSelected="${e => this.onJobSelected(e)}"
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
            <!--<div class="alert alert-info">\${JSON.stringify(this.queries)}</div>-->

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

                ${this.config.enabledComponents.gettingstarted ? html`
                    <div class="content" id="getting-started">
                        <getting-started .opencgaSession="${this.opencgaSession}" .config="${this.config}"></getting-started>
                    </div>
                ` : null}

                ${this.config.enabledComponents.login ? html`
                    <div class="content" id="login">
                        <user-login
                            .opencgaSession="${this.opencgaSession}"
                            @login="${this.onLogin}"
                            @redirect="${this.route}">
                        </user-login>
                    </div>
                ` : null}

                ${this.config.enabledComponents["data-form"] ? html`
                    <div class="content" id="data-form">
                        <data-form
                            .data="${{}}"
                            .config="${DATA_FORM_EXAMPLE}"
                            @fieldChange="${e => this.onFieldChange(e)}"
                            @clear="${e => this.onClear(e)}"
                            @submit="${e => this.onSubmit(e)}">
                        </data-form>
                    </div>
                ` : null}

                ${this.config.enabledComponents["utils-new"] ? html`
                    <div class="content" id="clinicalAnalysisPortal">
                        No component found.
                    </div>
                ` : null}

                ${this.config.enabledComponents["catalog-filters"] ? html`
                    <div class="content" id="rga">
                        Not available yet...
                    </div>
                ` : null}

                ${this.config.enabledComponents["opencga-update"] ? html`
                    <div class="content" id="opencga-update">
                        <opencga-update
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .clinicalAnalysisId="${this.clinicalAnalysisId}"
                            .query="${this.interpretationSearchQuery}"
                            .consequenceTypes="${this.config.consequenceTypes}"
                            .populationFrequencies="${this.config.populationFrequencies}"
                            .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                            .config="${true}"
                            @gene="${this.geneSelected}"
                            @samplechange="${this.onSampleChange}">
                        </opencga-update>
                    </div>
                ` : null}

                ${this.config.enabledComponents["variant-filters"] ? html`
                    <div class="content" id="variant-filters">
                        <variant-browser-filter
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .clinicalAnalysisId="${this.clinicalAnalysisId}"
                            .query="${this.interpretationSearchQuery}"
                            .consequenceTypes="${this.config.consequenceTypes}"
                            .populationFrequencies="${this.config.populationFrequencies}"
                            .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                            @gene="${this.geneSelected}"
                            @samplechange="${this.onSampleChange}">
                        </variant-browser-filter>
                    </div>
                ` : null}

                ${this.config.enabledComponents["genome-browser"] ? html`
                    <div class="content" id="genome-browser">
                        <genome-browser
                            .opencgaSession="${this.opencgaSession}"
                            .region="${"1:1000000"}"
                            .active="${true}"
                            .config="${
                                {
                                    cellBaseClient: this.cellbaseClient,
                                    featuresOfInterest: [],
                                }
                            }"
                            .tracks="${GENOME_BROWSER_TRACKS_EXAMPLE}">
                        </genome-browser>
                    </div>
                ` : null}

                ${this.config.enabledComponents["lollipop"] ? html`
                    <div class="content" id="lollipop">
                        Not available yet...
                    </div>
                ` : null}

                ${this.config.enabledComponents["pedigree"] ? html`
                    <div class="content" id="pedigree">
                        Not available yet...
                    </div>
                ` : null}

                ${this.config.enabledComponents["mutational-signatures"] ? html`
                    <div class="content" id="mutational-signatures">
                        <sample-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries.sample}"
                            .settings="${OPENCGA_SAMPLE_BROWSER_SETTINGS}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "sample")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "sample")}">
                        </sample-browser>
                    </div>
                ` : null}

            </div>

            <custom-footer
                .version="${this.version}"
                .host="${this.host}"
                .config="${this.config}">
            </custom-footer>
        `;
    }

}

customElements.define("test-app", TestApp);
