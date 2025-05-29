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

import {html, LitElement, nothing} from "lit";

// import jsorolla styles
import "../../../styles/jsorolla-ui.scss";
import "../../genome-browser/css/genome-browser.css";
import "../../core/visualisation/viz-styles.css";

import {OpenCGAClient} from "../../core/clients/opencga/opencga-client.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";

import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../../webcomponents/commons/utils/notification-utils.js";
import NotificationManager from "../../core/notification-manager.js";

import "../../webcomponents/clinical/clinical-analysis-browser.js";
import "../../webcomponents/variant/variant-browser.js";
import "../../webcomponents/variant/variant-beacon.js";
import "../../webcomponents/opencga/opencga-gene-view.js";
import "../../webcomponents/opencga/opencga-transcript-view.js";
import "../../webcomponents/opencga/opencga-protein-view.js";
import "../../webcomponents/sample/sample-browser.js";
import "../../webcomponents/sample/sample-view.js";
import "../../webcomponents/sample/sample-variant-stats-browser.js";
import "../../webcomponents/sample/sample-update.js";
import "../../webcomponents/disease-panel/disease-panel-browser.js";
import "../../webcomponents/disease-panel/disease-panel-update.js";
import "../../webcomponents/file/file-browser.js";
import "../../webcomponents/family/family-browser.js";
import "../../webcomponents/family/family-update.js";
import "../../webcomponents/individual/individual-browser.js";
import "../../webcomponents/individual/individual-update.js";
import "../../webcomponents/cohort/cohort-browser.js";
import "../../webcomponents/job/job-browser.js";
import "../../webcomponents/job/job-view.js";
import "../../webcomponents/workflow/workflow-browser.js";
import "../../webcomponents/clinical/clinical-analysis-create.js";
import "../../webcomponents/job/job-monitor.js";
import "../../webcomponents/job/analysis/tool-analysis.js";
import "../../webcomponents/loading-spinner.js";
import "../../webcomponents/organization/admin/organization-admin.js";
import "../../webcomponents/project/projects-admin.js";
import "../../webcomponents/study/admin/study-admin.js";
import "../../webcomponents/study/admin/study-admin-iva.js";
import "../../webcomponents/study/admin/catalog-admin.js";
import "../../webcomponents/study/admin/variant/operations-admin.js";
import "../../webcomponents/study/study-dashboard.js";
import "../../webcomponents/user/user-profile.js";
import "../../webcomponents/api/rest-api.js";
import "../../webcomponents/api/swagger-ui.js";
import "../../webcomponents/note/note-browser.js";
import "../../webcomponents/commons/analysis/analysis-tools.js";
import "../../webcomponents/commons/analysis/jupyter-notebook.js";

import "../../webcomponents/commons/layout/layout-footer.js";
import "../../webcomponents/commons/layout/layout-primary-bar.js";
import "../../webcomponents/commons/layout/layout-secondary-bar.js";
import "../../webcomponents/commons/layout/layout-sidebar.js";

import "../../webcomponents/commons/pages/custom-page.js";
import "../../webcomponents/commons/pages/login-page.js";
import "../../webcomponents/commons/pages/welcome-page.js";

import "../../webcomponents/clinical/rga/rga-browser.js";

import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";
import ExtensionsManager from "../../webcomponents/extensions-manager.js";

class IvaApp extends LitElement {

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
        this.settings = {};
        this.bsOffcanvas = null;
        const _config = SUITE;
        _config.opencga = opencga;
        _config.cellbase = typeof cellbase !== "undefined" ? cellbase : null;
        _config.pages = typeof CUSTOM_PAGES !== "undefined" ? CUSTOM_PAGES : [];
        _config.consequenceTypes = CONSEQUENCE_TYPES;
        _config.populationFrequencies = POPULATION_FREQUENCIES;
        _config.proteinSubstitutionScores = PROTEIN_SUBSTITUTION_SCORE.style;

        // Reading the default settings from the config files, eg. browser.settings.js
        // Store them in a flat structure.
        this.DEFAULT_TOOL_SETTINGS = {
            ...CATALOG_SETTINGS,
            // ...VARIANT_SETTINGS,
            ...INTERPRETER_SETTINGS,
            ...USER_SETTINGS
            // CUSTOM_PAGES,
        };

        // We set the global Polymer variable, this produces one single event
        this.config = _config;

        // Get version from env variable
        // eslint-disable-next-line no-undef
        this.version = process.env.VERSION;

        // Initialize app and tool
        this.app = this.getActiveAppConfig();
        this.tool = "#home";

        // We need to listen to hash fragment changes to update the URL
        window.addEventListener("hashchange", () => {
            this.hashFragmentListener();
        });

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

        // keeps track of the executedQueries transitioning from browser tool to facet tool
        this.queries = {};

        // keeps track of status and version of the hosts (opencga and cellbase)
        this.host = {};

        globalThis.addEventListener("signingIn", e => {
            this.isCreatingSession = e.detail.value;
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
            const opencgaCookiePrefix = serverConf?.cookie?.prefix || this.config.opencga.cookie.prefix;
            const opencgaCookieSecure = serverConf?.cookie?.secure ?? this.config.opencga.cookie?.secure ?? true;
            const opencgaOrganizations = serverConf?.organizations || this.config.opencga.organizations || [];
            const opencgaSsoActive = serverConf?.sso?.active ?? this.config.opencga.sso?.active ?? false;
            const opencgaSsoCookie = serverConf?.sso?.cookie ?? this.config.opencga.sso?.cookie ?? "JSESSIONID";

            // Check if SSO mode is enabled
            if (opencgaSsoActive) {
                const currentUrl = new URL(window.location);
                if (currentUrl.searchParams.has("token") && currentUrl.searchParams.has(opencgaSsoCookie)) {
                    // Save token and session ID in cookies
                    // eslint-disable-next-line no-undef
                    Cookies.set(opencgaSsoCookie, currentUrl.searchParams.get(opencgaSsoCookie), {
                        secure: opencgaCookieSecure,
                    });
                    // eslint-disable-next-line no-undef
                    Cookies.set(opencgaCookiePrefix + "_sid", currentUrl.searchParams.get("token"), {
                        secure: opencgaCookieSecure,
                    });

                    // Decode token to get user ID
                    // eslint-disable-next-line no-undef
                    const decodedToken = jwt_decode(currentUrl.searchParams.get("token"));
                    // eslint-disable-next-line no-undef
                    Cookies.set(opencgaCookiePrefix + "_userId", decodedToken.sub, {
                        secure: opencgaCookieSecure,
                    });

                    // We need to remove the params from the url
                    Array.from(currentUrl.searchParams.keys()).forEach(key => {
                        currentUrl.searchParams.delete(key);
                    });

                    // Stop process, as we are going to reload IVA without the token and session ID in the URL
                    window.location = currentUrl.href;
                    return;
                }
            }

            // Initialise clients and create the session
            const sid = Cookies.get(opencgaCookiePrefix + "_sid");
            const userId = Cookies.get(opencgaCookiePrefix + "_userId");

            this.opencgaClient = new OpenCGAClient({
                host: opencgaHost,
                version: opencgaVersion,
                organizations: opencgaOrganizations,
                token: sid,
                userId: userId,
                cookies: {
                    active: true,
                    prefix: opencgaCookiePrefix,
                    secure: opencgaCookieSecure,
                },
                sso: {
                    active: opencgaSsoActive,
                    cookie: opencgaSsoCookie,
                },
            });

            if (sid) {
                this.checkSessionActive();
                this.intervalCheckSession = setInterval(this.checkSessionActive.bind(this), this.config.session.checkTime);
                this._createOpenCGASession();
            } else {
                this._createOpencgaSessionFromConfig();
            }
        });
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        // this.renderHashFragments();
        this.hashFragmentListener();
        // this.queries = {};
        // this.requestUpdate();
    }

    #initStudiesSettings() {
        // 1. Init with default settings all studies that do not have settings
        for (const project of this.opencgaSession.projects) {
            for (const study of project.studies) {
                let modified = false;

                // 1.1 If the study does not have IVA_CONFIG settings, store in opencgaSession the default settings
                if (UtilsNew.isEmpty(study?.attributes[SETTINGS_NAME]?.settings)) {
                    study.attributes[SETTINGS_NAME] = {
                        // We must initialise with the default settings
                        // TODO Implement visible: true ?
                        version: this.version.split("-")[0],
                        settings: UtilsNew.objectClone(this.opencgaSession.ivaDefaultSettings.settings),
                    };
                    modified = true;
                }

                // 1.2 Check if a migration is needed
                // TODO implement migration
                // if (this.version !== study.attributes[SETTINGS_NAME].version) {
                //     const newSettings = migration.run();
                //     study.attributes[SETTINGS_NAME + "_BACKUP"] = UitlsNew.objectClone(study.attributes[SETTINGS_NAME]);
                //     study.attributes[SETTINGS_NAME] = newSettings;
                //     modified = true;
                // }

                // 1.3. Save the default settings if the settings has changed and the user is admin/owner
                if (modified && OpencgaCatalogUtils.isAdmin(study, this.opencgaSession.user.id) && !study.internal.federated) {
                    this.#saveInitSettings(study);
                }
            }
        }
        // 2. Init settings
        this.settings = UtilsNew.objectClone(this.opencgaSession.study.attributes[SETTINGS_NAME].settings);
    }

    /**
     * To init IVA_CONFIG settings in memory
     */
    #saveInitSettings(study) {
        study.attributes[SETTINGS_NAME].userId = this.opencgaSession.user.id;
        study.attributes[SETTINGS_NAME].date = UtilsNew.getDatetime();
        const updateParams = {
            attributes: {...study.attributes},
        };
        const params = {
            includeResult: true,
        };

        this.opencgaSession.opencgaClient.studies()
            .update(study.fqn, updateParams, params)
            .then(response => {
                // study = response.responses[0].results[0];
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Study Settings Update",
                    message: `${study.id} settings updated correctly`,
                });
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    async _createOpenCGASession() {
        // This check prevents displaying the annoying message of 'No valid token:null' when the token has expired
        if (!this.opencgaClient._config.token) {
            return;
        }
        this.isCreatingSession = true;
        console.log("Init creating opencgaSession ...");
        this.requestUpdate();
        await this.updateComplete;
        this.opencgaClient.createSession()
            .then(response => {
                // 1. Check if project array has been defined in the config.js
                // This is only valid when public IVA/OpenCGA installations
                if (this.config.opencga.projects?.length > 0) {
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
                    response.projects = activeProjects || [];
                    if (UtilsNew.isNotEmptyArray(response.projects[0].studies)) {
                        response.project = response.projects[0];
                        response.study = response.projects[0].studies[0];
                    }
                }

                // 2. Set the default active project and study.
                // 2.1 Check if the user has set a project/study in the URL
                const [hashTool, hashProject, hashStudy, hashQuery] = window.location.hash.split("/");
                // TODO: REMOVE THIS SECTION --> DO NOT USE HASH TO SET PROJECT AND STUDY
                if (false && hashProject && hashStudy) {
                    const project = response.projects.find(p => p.id === hashProject);
                    const study = project.studies.find(s => s.id === hashStudy);
                    if (project && study) {
                        console.log("Setting active project and study from hash");
                        response.project = project;
                        response.study = study;
                    } else {
                        console.error(`Project '${hashProject}' and Study '${hashStudy}' not found`);
                    }
                } else {
                    // 2.2 Check if lastStudy form User Configuration matches
                    for (const project of response.projects) {
                        if (project.studies?.length > 0) {
                            for (const study of project.studies) {
                                if (response.user?.configs?.IVA?.lastStudy === study.fqn) {
                                    response.project = project;
                                    response.study = study;
                                    break;
                                }
                            }
                        }
                    }

                    // 2.3 if not 'lastStudy' found then set the first project and study.
                    // If the user doesn't have his own default study then we select the first project and study as default
                    if (!response.project && !response.study) {
                        for (const project of response.projects) {
                            if (project.studies?.length > 0) {
                                response.project = project;
                                response.study = project.studies[0];
                                break;
                            }
                        }
                    }
                }

                // 3. Update data structures and refresh.
                // This forces the observer to be executed.
                if (response.projects?.length > 0 && response.projects.some(p => UtilsNew.isNotEmptyArray(p.studies))) {
                    this.opencgaSession = {
                        ...response,
                        ivaDefaultSettings: {
                            version: this.version,
                            settings: UtilsNew.objectClone(this.DEFAULT_TOOL_SETTINGS),
                        }
                    };
                    this.opencgaSession.mode = this.config.mode;
                    console.log("Init study settings");
                    this.#initStudiesSettings();
                    this.updateCellBaseClient();

                    // this.config.menu = [...application.menu];
                    this.config = {...this.config};
                } else {
                    this.opencgaSession = {
                        ...response,
                    };
                    this.config = {...this.config};
                }
            })
            .catch(e => {
                console.error(e);
                this.notificationManager.error("Error creating session", e.message);
                // clear cookies and reset opencgaSession
                this.opencgaClient.logout();
                this._createOpencgaSessionFromConfig();
            })
            .finally(() => {
                this.isCreatingSession = false;
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

    logout() {
        // 1. Check if logged user is a local user
        // This is only needed if SSO mode is enabled. If not, logged user is always local
        let isLocalUser = true;
        if (this.opencgaClient?._config?.sso?.active && this.opencgaClient?._config?.token) {
            // eslint-disable-next-line no-undef
            const decoded = jwt_decode(this.opencgaClient._config.token);
            isLocalUser = decoded?.authOrigin === "OPENCGA";
        }

        // 2. Delete token and remove cookies
        this.opencgaClient.logout();

        // 3. Check if sso is active and logged user is not local
        // In this case, we will redirect to 'meta/sso/logout' endpoint
        if (this.opencgaClient?._config?.sso?.active && !isLocalUser) {
            const config = this.opencgaClient._config;
            const ivaUrl = window.location;
            window.location = `${config.host}/webservices/rest/${config.version}/meta/sso/logout?url=${ivaUrl}`;
            return;
        }

        this._createOpencgaSessionFromConfig();

        this.tool = "#home";
        this.app = this.getActiveAppConfig();
        window.location.hash = "home";
        window.clearInterval(this.intervalCheckSession);
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

    hashFragmentListener() {
        console.log("HASH_LISTENER", window.location.hash);
        this.app = null;
        this.tool = null;
        this.queries = {}; // reset queries object

        // 0. in case of empty hash fragments, redirect to home tool
        if (window.location.hash === "" || window.location.hash === "#") {
            window.location.hash = ["home", this.opencgaSession?.project?.id, this.opencgaSession?.study?.id].filter(Boolean).join("/");
            return;
        }

        // 1. parse hash fragments
        const [hashFragments, hashQuery] = window.location.hash.replace("#", "").split("?");
        const hashItems = hashFragments.split("/");
        let hashApp = null, hashTool = null, hashProject = null, hashStudy = null;

        // 2. check if the first hash fragment is an app
        if (this.config?.apps?.length > 0 && this.config.apps.some(app => app.id === hashItems[0])) {
            // example: "#research/home/germline/chinese"
            [hashApp, hashTool, hashProject, hashStudy] = hashItems;
        } else {
            // example: "#home/germline/chinese"
            [hashTool, hashProject, hashStudy] = hashItems;
        }

        // 3. make sure that project and study is in the hash fragment
        if (!hashProject || !hashStudy) {
            if (this.opencgaSession?.project?.id && this.opencgaSession?.study?.id) {
                window.location.hash = [hashApp, hashTool || "home", this.opencgaSession?.project?.id, this.opencgaSession?.study?.id].filter(Boolean).join("/");
                return;
            }
        }

        // 4. parse project and study
        if (!!hashProject && !!hashStudy && (hashProject !== this.opencgaSession?.project?.id || hashStudy !== this.opencgaSession?.study?.id)) {
            this.changeActiveStudy(`${this.opencgaSession.organization.id}@${hashProject}:${hashStudy}`);
        }

        // 5. save app and tool
        this.app = (this.config?.apps || []).find(app => app.id === hashApp);
        this.tool = hashTool;

        // 6. parse hashQuery
        if (hashQuery && this.tool) {
            const query = Object.fromEntries(Array.from(new URLSearchParams(hashQuery).entries()));
            this.queries[this.tool] = query;
        }

        // 7. update IVA
        this.requestUpdate();
    }

    onStudySelect(e, study) {
        // Prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        e.preventDefault();

        // Change study
        this.changeActiveStudy(study.fqn);
    }

    changeActiveStudy(studyFqn) {
        if (this.opencgaSession?.study?.fqn === studyFqn) {
            console.log("New selected study is already the current active study!");
            return;
        }

        // Change active study
        let studyFound = false;
        for (const project of (this.opencgaSession?.projects || [])) {
            const studyIndex = project.studies.findIndex(s => s.fqn === studyFqn);
            if (studyIndex >= 0) {
                this.opencgaSession.project = project;
                this.opencgaSession.study = project.studies[studyIndex];
                studyFound = true;
                break;
            }
        }

        if (studyFound) {
            // 1. Update the lastStudy in config if has changed
            this.opencgaClient.updateUserConfig("IVA", {
                ...this.opencgaSession.user.configs["IVA"],
                lastStudy: studyFqn
            });

            // 2. set the new Hash URL
            const [hashFragments, hashQuery] = window.location.hash.replace("#", "").split("?");
            const hashItems = hashFragments.split("/");
            let newHashFragmentUrl = "";

            // 2.1. If the hash fragment only contains one or three items, it is a single tool URL
            if (hashItems.length === 1 || hashItems.length === 3) {
                newHashFragmentUrl = `${hashItems[0]}/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}`;
            }

            // 2.2 if the hash fragment contains two or four items, it is an app/tool URL
            else if (hashItems.length === 2 || hashItems.length === 4) {
                // NOTE: if we change current sudy in the interpreter, we must remove the clinical analysis id from the hash fragment
                // and redirect to case portal
                const tool = hashItems[1] !== "interpreter" ? hashItems[1] : "clinical-analysis-portal";
                newHashFragmentUrl = `${hashItems[0]}/${tool}/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}`;
            }

            // 2.3. reset hash including queries (if any)
            window.location.hash = newHashFragmentUrl + (hashQuery ? `?${hashQuery}` : "");

            // 3. Reset queries from old studies
            this.queries = {};

            // Update CellBase and refresh the session.
            this.updateCellBaseClient();
            this.settings = UtilsNew.objectClone(this.opencgaSession.study.attributes[SETTINGS_NAME].settings);
            this.opencgaSession = {...this.opencgaSession};
        } else {
            // TODO Convert this into a user notification
            console.error(`Study '${studyFqn}' not found!`);
        }
    }

    // This method updates 'cellbaseClient' object but DO NOT refresh opencgaSession.
    updateCellBaseClient() {
        // 1. Reset CellBase client
        this.cellbaseClient = null;

        // 2. Build new CellBase client using 'project' info.
        if (this.opencgaSession?.project?.cellbase?.url) {
            this.cellbaseClient = new CellBaseClient({
                host: this.opencgaSession.project.cellbase.url.replace(/\/$/, ""),
                version: this.opencgaSession.project.cellbase.version,
                species: this.opencgaSession.project.organism.scientificName,
                apiKey: this.opencgaSession.project.cellbase.apiKey,
            });

            // 2.1 This simplifies passing 'cellbaseClient' to all components
            this.opencgaSession.cellbaseClient = this.cellbaseClient;
        }
    }

    onSampleChange(e) {
        // if (UtilsNew.isNotUndefinedOrNull(this.samples) && UtilsNew.isNotUndefinedOrNull(e.detail)) {
        // this.samples = e.detail.samples;
        // this._samplesPerTool[this.tool.replace("#", "")] = this.samples;
        // this.renderBreadcrumb();
        // }
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
        console.warn("onQueryChange", e);
        this.browserSearchQuery = {...e.detail.query};
        // this.browserSearchQuery = {};
    }

    onQueryFilterSearch(e, source) {
        // FIXME filters component emits a event containing {detail:{query:Object}} while active-filter emits {detail:{Object}}
        // TODO fix active-filters
        const q = e.detail.query ? {...e.detail.query} : {...e.detail};
        this.queries[source] = {...q};
        // this.queries = {...this.queries};
        // this.requestUpdate();
    }

    onSelectClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.clinicalAnalysis;
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
                // about: this.config.about,
                // userMenu: this.config.userMenu,
            };
        }
    }

    isLoggedIn() {
        return !!this?.opencgaSession?.token;
    }

    onSessionUpdateRequest() {
        this._createOpenCGASession();
    }

    onSessionPanelUpdate(e) {
        const action = e.detail.action || "CREATE";
        switch (action) {
            case "CREATE":
                if (this.opencgaSession.study) {
                    this.opencgaSession.study.panels = [
                        ...this.opencgaSession.study?.panels,
                        e.detail.value
                    ];
                }
                break;
        }
        this.opencgaSession = {...this.opencgaSession};
    }

    onStudyUpdateRequest() {
        // TODO: update only the current study instead of refreshing the whole session
        this._createOpenCGASession();
        
        // this.opencgaSession.opencgaClient.studies()
        //     .info(e.detail.value)
        //     .then(res => {
        //         const updatedStudy = res.responses[0].results[0];
        //         for (const project of this.opencgaSession.user.projects) {
        //             if (project.studies?.length > 0) {
        //                 const studyIndex = project.studies.findIndex(study => study.fqn === e.detail.value);
        //                 if (studyIndex >= 0) {
        //                     project.studies[studyIndex] = updatedStudy;
        //                     break;
        //                 }
        //             }
        //         }
        //
        //         // Update opencgaSession.study if the study updated is the active one
        //         if (this.opencgaSession.study && this.opencgaSession.study.fqn === e.detail.value) {
        //             this.opencgaSession.study = updatedStudy;
        //         }
        //
        //         this.settings = UtilsNew.objectClone(this.opencgaSession.study.attributes[SETTINGS_NAME].settings);
        //         this.opencgaSession = {...this.opencgaSession};
        //         // this.requestUpdate();
        //     })
        //     .catch(e => {
        //         console.error(e);
        //         // params.error(e);
        //     });
    }

    renderTool() {
        let content = nothing;
        switch (this.tool) {
            case "home":
                content = html`
                    <welcome-page
                        .app="${this.app}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${this.config}">
                    </welcome-page>
                `;
                break;
            case "dahsboard":
                content = html`
                    <div class="d-flex justify-content-center">
                        <span>Dashboard</span>
                    </div>
                `;
                break;
            case "aoutzetta":
            case "about":
                content = html`
                    <div class="content">
                        <custom-page
                            .page="${this.config.aboutPage}"
                            .opencgaSession="${this.opencgaSession}">
                        </custom-page>
                    </div>
                `;
                break;
            case "variant-browser":
                content = html`
                    <div class="content">
                        <variant-browser
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient || this.opencgaSession.cellbaseClient}"
                            .reactomeClient="${this.reactomeClient}"
                            .query="${this.queries["variant-browser"]}"
                            .settings="${this.settings.VARIANT_BROWSER}"
                            .consequenceTypes="${this.config.consequenceTypes}"
                            .populationFrequencies="${this.config.populationFrequencies}"
                            .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                            @onSamplechange="${this.onSampleChange}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "variant-browser")}"
                            onqueryChange="${e => this.onQueryChange(e, "variant")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "variant-browser")}">
                        </variant-browser>
                    </div>
                `;
                break;
            // case "clinical-analysis-portal":
            // case "clinicalAnalysisPortal":
            //     content = html`
            //         <div class="content">
            //             <clinical-analysis-portal
            //                 .opencgaSession="${this.opencgaSession}"
            //                 .settings="${this.settings.CLINICAL_ANALYSIS_PORTAL_BROWSER}"
            //                 @sessionPanelUpdate="${this.onSessionPanelUpdate}">
            //             </clinical-analysis-portal>
            //         </div>
            //     `;
            //     break;
            case "rga":
                content = html`
                    <div class="content">
                        <rga-browser
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient || this.opencgaSession.cellbaseClient}"
                            .settings="${this.settings.RGA_BROWSER}">
                        </rga-browser>
                    </div>
                `;
                break;
            case "beacon":
                content = html`
                    <div class="content">
                        <variant-beacon .opencgaSession="${this.opencgaSession}">
                        </variant-beacon>
                    </div>
                `;
                break;
            case "sample":
            case "sample-browser":
                content = html`
                    <div class="content">
                        <sample-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries.sample}"
                            .settings="${this.settings.SAMPLE_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "sample")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "sample")}">
                        </sample-browser>
                    </div>
                `;
                break;
            case "sampleUpdate":
            case "sample-update":
                content = html`
                    <tool-header
                        title="${`Sample <span class="inverse"> ${this.sampleId} </span>` }"
                        icon="fas fa-vial icon-padding">
                    </tool-header>
                    <div class="content">
                        <sample-update
                            .sampleId="${this.sampleId}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig=${
                                {
                                    showBtnSampleBrowser: true,
                                    width: "10",
                                    style: "margin: 10px",
                                    labelWidth: 3,
                                    labelAlign: "right",
                                    defaultLayout: "horizontal",
                                    defaultValue: "",
                                    help: {
                                        mode: "block" // icon
                                    }
                                }
                            }>
                        </sample-update>
                    </div>
                `;
                break;
            case "disease-panel":
            case "disease-panel-browser":
                content = html`
                    <div class="content">
                        <disease-panel-browser
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient || this.opencgaSession.cellbaseClient}"
                            .query="${this.queries["disease-panel"]}"
                            .settings="${this.settings.DISEASE_PANEL_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "disease-panel")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "disease-panel")}">
                        </disease-panel-browser>
                    </div>
                `;
                break;
            case "diseasePanelUpdate":
            case "disease-panel-update":
                content = html`
                    <div class="content">
                        <disease-panel-update
                            .diseasePanelId="${this.diseasePanelId}"
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .displayConfig=${
                                {
                                    showBtnSampleBrowser: true,
                                    width: "10",
                                    style: "margin: 10px",
                                    labelWidth: 3,
                                    labelAlign: "right",
                                    defaultLayout: "horizontal",
                                    defaultValue: "",
                                    help: {
                                        mode: "block" // icon
                                    }
                                }
                            }>
                        </disease-panel-update>
                    </div>
                `;
                break;
            case "file":
            case "file-browser":
            case "file-manager":
            case "file-data-manager":
                content = html`
                    <file-browser
                        .opencgaSession="${this.opencgaSession}"
                        .query="${this.queries.file}"
                        .settings="${this.settings.FILE_BROWSER}"
                        @querySearch="${e => this.onQueryFilterSearch(e, "file")}"
                        @activeFilterChange="${e => this.onQueryFilterSearch(e, "file")}">
                    </file-browser>
                `;
                break;
            case "individual":
            case "individual-browser":
                content = html`
                    <div class="content">
                        <individual-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries.individual}"
                            .settings="${this.settings.INDIVIDUAL_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "individual")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "individual")}">
                        </individual-browser>
                    </div>
                `;
                break;
            case "individualUpdate":
            case "individual-update":
                content = html`
                    <tool-header
                        title="${`Individual <span class="inverse"> ${this.individualId} </span>` }"
                        icon="fas fa-vial icon-padding">
                    </tool-header>
                    <div class="content">
                        <individual-update
                            .individualId="${this.individualId}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig=${
                                {
                                    showBtnSampleBrowser: true,
                                    width: "10",
                                    style: "margin: 10px",
                                    labelWidth: 3,
                                    labelAlign: "right",
                                    defaultLayout: "horizontal",
                                    defaultValue: "",
                                    help: {
                                        mode: "block" // icon
                                    }
                                }
                            }>
                        </individual-update>
                    </div>
                `;
                break;
            case "family":
            case "family-browser":
                content = html`
                    <div class="content">
                        <family-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries.family}"
                            .settings="${this.settings.FAMILY_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "family")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "family")}">
                        </family-browser>
                    </div>
                `;
                break;
            case "familyUpdate":
            case "family-update":
                content = html`
                    <tool-header
                        title="${`Family <span class="inverse"> ${this.familyId} </span>` }"
                        icon="fas fa-vial icon-padding">
                    </tool-header>
                    <div class="content">
                        <family-update
                            .familyId="${this.familyId}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig=${
                                {
                                    showBtnSampleBrowser: true,
                                    width: "10",
                                    style: "margin: 10px",
                                    labelWidth: 3,
                                    labelAlign: "right",
                                    defaultLayout: "horizontal",
                                    defaultValue: "",
                                    help: {
                                        mode: "block" // icon
                                    }
                                }
                            }>
                        </family-update>
                    </div>
                `;
                break;
            case "gene":
                content = html`
                    <div class="content">
                        <opencga-gene-view
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                            .geneId="${this.queries["gene"]?.id || ""}"
                            .populationFrequencies="${this.config.populationFrequencies}"
                            .consequenceTypes="${this.config.consequenceTypes}"
                            .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                            .settings="${OPENCGA_GENE_VIEW_SETTINGS}">
                        </opencga-gene-view>
                    </div>
                `;
                break;
            case "transcript":
                content = html`
                    <div class="content">
                        <opencga-transcript-view
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient || this.opencgaSession.cellbaseClient}"
                            .opencgaClient="${this.opencgaClient}"
                            .transcript="${this.transcript}"
                            .gene="${this.gene}"
                            .populationFrequencies="${this.config.populationFrequencies}"
                            .consequenceTypes="${this.config.consequenceTypes}"
                            .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                            .settings="${OPENCGA_GENE_VIEW_SETTINGS}">
                        </opencga-transcript-view>
                    </div>
                `;
                break;
            case "protein":
                content = html`
                    <div class="content">
                        <opencga-protein-view
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient || this.opencgaSession.cellbaseClient}"
                            .opencgaClient="${this.opencgaClient || this.opencgaSession.opencgaClient}"
                            .project="${this.opencgaSession.project}"
                            .study="${this.opencgaSession.study}"
                            .protein="${this.protein}"
                            .populationFrequencies="${this.config.populationFrequencies}"
                            .consequenceTypes="${this.config.consequenceTypes}"
                            .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                            .settings="${OPENCGA_GENE_VIEW_SETTINGS}">
                        </opencga-protein-view>
                    </div>
                `;
                break;
            case "cohort":
            case "cohort-browser":
            case "cohort-manager":
                content = html`
                    <div class="content">
                        <cohort-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries.cohort}"
                            .settings="${this.settings.COHORT_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "cohort")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "cohort")}">
                        </cohort-browser>
                    </div>
                `;
                break;
            case "clinical-analysis":
            case "clinicalAnalysis":
            case "clinical-analysis-browser":
            case "clinical-analysis-portal":
            case "clinicalAnalysisPortal":
                content = html`
                    <clinical-analysis-browser
                        .opencgaSession="${this.opencgaSession}"
                        .settings="${this.settings.CLINICAL_ANALYSIS_BROWSER}"
                        .query="${this.queries["clinical-analysis"]}"
                        @querySearch="${e => this.onQueryFilterSearch(e, "clinical-analysis")}"
                        @activeFilterChange="${e => this.onQueryFilterSearch(e, "clinical-analysis")}">
                    </clinical-analysis-browser>
                `;
                break;
            case "job":
            case "job-browser":
                content = html`
                    <div class="content">
                        <job-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings= ${this.settings.JOB_BROWSER}
                            .query="${this.queries.job}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "job")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "job")}">
                        </job-browser>
                    </div>
                `;
                break;
            case "note-browser":
                content = html`
                    <div class="content">
                        <note-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries["note-browser"]}"
                            .settings="${this.settings.NOTE_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "note-browser")}">
                        </note-browser>
                    </div>
                `;
                break;
            case "workflow-browser":
            case "workflow-manager":
                content = html`
                    <div class="content">
                        <workflow-browser
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.queries["workflow-browser"]}"
                            .settings="${this.settings.WORKFLOW_BROWSER}"
                            @querySearch="${e => this.onQueryFilterSearch(e, "workflow")}"
                            @activeFilterChange="${e => this.onQueryFilterSearch(e, "workflow")}">
                        </workflow-browser>
                    </div>
                `;
                break;
            case "cat-browser":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "variant-browser")}">
                        </category-page>
                    </div>
                `;
                break;
            case "cat-analysis":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "analysis")}">
                        </category-page>
                    </div>
                `;
                break;
            case "cat-clinical":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "clinical")}">
                        </category-page>
                    </div>
                `;
                break;
            case "cat-tools":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "tools")}">
                        </category-page>
                    </div>
                `;
                break;
            case "cat-catalog":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "catalog")}">
                        </category-page>
                    </div>
                `;
                break;
            case "cat-alignment":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "alignment")}">
                        </category-page>
                    </div>
                `;
            case "cat-ga4gh":
                content = html`
                    <div class="content">
                        <category-page
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.app?.menu?.find(item => item.id === "ga4gh")}">
                        </category-page>
                    </div>
                `;
                break;
            case "sampleVariantStatsBrowser":
            case "sample-variant-stats-browser":
                content = html`
                    <div class="content">
                        <sample-variant-stats-browser
                            .opencgaSession="${this.opencgaSession}"
                            .sampleId="${this.sampleId}"
                            .active="${true}"
                            .settings="${{...VARIANT_INTERPRETER_SAMPLE_VARIANT_STATS_SETTINGS, showTitle: true}}">
                        </sample-variant-stats-browser>
                    </div>
                `;
                break;
            case "clinical-analysis-create":
                content = html`
                    <tool-header
                        title="Create Case"
                        icon="fas fa-window-restore">
                    </tool-header>
                    <div class="content">
                        <clinical-analysis-create
                            .opencgaSession="${this.opencgaSession}"
                            @clinicalanalysischange="${this.onClinicalAnalysisEditor}">
                        </clinical-analysis-create>
                    </div>
                `;
                break;
            case "account":
            case "profile":
                content = html`
                    <div class="content">
                        <user-profile
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${this.settings.USER_PROFILE_SETTINGS}">
                        </user-profile>
                    </div>
                `;
                break;
            case "interpreter":
                content = html`
                    <div class="content">
                        <variant-interpreter
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient || this.opencgaSession.cellbaseClient}"
                            .clinicalAnalysisId="${this.queries["interpreter"]?.id}"
                            .settings="${this.settings.VARIANT_INTERPRETER_SETTINGS}"
                            @selectClinicalAnalysis="${this.onSelectClinicalAnalysis}">
                        </variant-interpreter>
                    </div>
                `;
                break;
            case "job-view":
                content = html`
                    <tool-header
                        title="${this.jobSelected || "No job selected"}"
                        icon="${"fas fa-rocket"}">
                    </tool-header>
                    <div class="content">
                        <job-view
                            mode="full"
                            .jobId="${this.jobSelected}"
                            .opencgaSession="${this.opencgaSession}">
                        </job-view>
                    </div>
                `;
                break;
            case "organization-admin":
                content = html`
                    <organization-admin
                        .opencgaSession="${this.opencgaSession}"
                        @studyUpdateRequest="${this.onStudyUpdateRequest}"
                        @sessionUpdateRequest="${this.onSessionUpdateRequest}">
                    </organization-admin>
                `;
                break;
            case "catalog-admin":
                content = html`
                    <catalog-admin
                        .opencgaSession="${this.opencgaSession}"
                        @sessionUpdateRequest="${this.onSessionUpdateRequest}">
                    </catalog-admin>
                `;
                break;
            // case "projects-admin":
            //     content = html`
            //         <tool-header
            //             title="Study Dashboard"
            //             icon="fas fa-rocket">
            //         </tool-header>
            //         <div class="content">
            //             <projects-admin
            //                 .opencgaSession="${this.opencgaSession}"
            //                 @sessionUpdateRequest="${this.onSessionUpdateRequest}">
            //             </projects-admin>
            //         </div>
            //     `;
            //     break;
            case "study-admin":
                content = html`
                    <study-admin
                        .opencgaSession="${this.opencgaSession}"
                        @studyUpdateRequest="${this.onStudyUpdateRequest}">
                    </study-admin>
                `;
                break;
            case "study-admin-iva":
                content = html`
                    <study-admin-iva
                        .opencgaSession="${this.opencgaSession}"
                        .settings="${this.settings}"
                        @studyUpdateRequest="${this.onStudyUpdateRequest}">
                    </study-admin-iva>
                `;
                break;
            case "operations-admin":
                content = html`
                    <operations-admin
                        .opencgaSession="${this.opencgaSession}"
                        @studyUpdateRequest="${this.onStudyUpdateRequest}">
                    </operations-admin>
                `;
                break;
            case "rest-api":
                content = html`
                    <tool-header
                        title="REST API"
                        icon="fas fa-rocket">
                    </tool-header>
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        <span>The <b>REST API</b> tool has been deprecated and will be removed in future releases. Please use the new <a href="#swagger-ui" class="alert-link">Swagger</a> tool instead.</span>
                    </div>
                    <rest-api
                        .opencgaSession="${this.opencgaSession}">
                    </rest-api>
                `;
                break;
            case "swagger-ui":
                content = html`
                    <tool-header
                        title="Swagger UI"
                        icon="https://raw.githubusercontent.com/swagger-api/swagger-ui/refs/heads/master/dist/favicon-32x32.png"
                        iconSize="32">
                    </tool-header>
                    <div class="content">
                        <swagger-ui
                            .opencgaSession="${this.opencgaSession}">
                        </swagger-ui>
                    </div>
                `;
                break;
            case "analysis-tools":
                content = html`
                    <analysis-tools
                        .opencgaSession="${this.opencgaSession}">
                    </analysis-tools>
                `;
                break;
            case "tool-analysis":
                content = html`
                    <tool-analysis
                        .opencgaSession="${this.opencgaSession}"
                        .config="${this.config.analysisTools}">
                    </tool-analysis>
                `;
                break;
            case "jupyter-notebook":
            case "jupyter-lab":
                content = html`
                    <jupyter-notebook
                        .opencgaSession="${this.opencgaSession}">
                    </jupyter-notebook>
                `;
                break;
            case "study-dashboard":
                content = html`
                    <study-dashboard
                        .opencgaSession="${this.opencgaSession}">
                    </study-dashboard>
                `;
                break;
            default:
                // check if there is an extension with this tool ID
                const extensionTool = ExtensionsManager.getTools()
                    .find(tool => tool.id === this.tool);

                if (extensionTool) {
                    content = extensionTool.render(this.opencgaSession);
                } else {
                    // check if there is a custom page with this tool ID
                    const pageName = (this.tool || "").replace("#", "");
                    const page = (this.config.pages || []).find(p => p.url === pageName);

                    if (page) {
                        return html`
                            <custom-page
                                .opencgaSession="${this.opencgaSession}"
                                .page="${page}">
                            </custom-page>
                        `;
                    } else {
                        // No tool found --> Render a not found error page (TODO)
                        content = html`
                            <div align="center">Not found</div>
                        `;
                    }
                }
        }
        return content;
    }

    render() {
        if (!this.isLoggedIn() && !this.isCreatingSession) {
            return html`
                <login-page
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.config}"
                    @login="${this.onLogin}">
                </login-page>
            `;
        }

        return html`
            <div class="d-flex flex-column flex-nowrap h-screen">
                <layout-primary-bar
                    .version="${this.version || ""}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.config}"
                    @logout="${() => this.logout()}"
                    @studySelect="${e => this.onStudySelect(e.detail.event, e.detail.study)}"
                    @jobSelected="${e => this.onJobSelected(e)}">
                </layout-primary-bar>

                <!-- Render the App -->
                <div class="d-flex flex-nowrap">
                    <layout-sidebar
                        .opencgaSession="${this.opencgaSession}"
                        .currentUrl="${window.location.hash || "#"}"
                        .config="${this.config}">
                    </layout-sidebar>

                    <!-- Render the center of the 'app': Secondary NavBar, the Tool and the Footer -->
                    <div class="w-full h-full overflow-auto" style="max-height:calc(100vh - 45px);">
                        <div class="px-4 pb-4" style="min-height:100vh;">
                            ${this.app?.menu?.length > 0 ? html`
                                <layout-secondary-bar
                                    .app="${this.app}"
                                    .currentUrl="${window.location.hash || "#"}">
                                </layout-secondary-bar>
                            ` : nothing}

                            ${this.isCreatingSession ? html`
                                <div class="login-overlay position-absolute top-50 start-50 translate-middle">
                                    <loading-spinner
                                        .description="${"Creating session..."}">
                                    </loading-spinner>
                                </div>
                            ` : this.renderTool()}
                        </div>

                        <layout-footer
                            .opencgaSession="${this.opencgaSession}"
                            .version="${this.version || ""}"
                            .host="${this.host}"
                            .config="${this.config}">
                        </layout-footer>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("iva-app", IvaApp);
