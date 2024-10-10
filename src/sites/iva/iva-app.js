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
import "./getting-started.js";
import "./iva-settings.js";

import {OpenCGAClient} from "../../core/clients/opencga/opencga-client.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";

import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../../webcomponents/commons/utils/notification-utils.js";
import NotificationManager from "../../core/notification-manager.js";

import "../../webcomponents/clinical/clinical-analysis-browser.js";
import "../../webcomponents/clinical/clinical-analysis-portal.js";
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
import "../../webcomponents/clinical/analysis/mutational-signature-analysis.js";
import "../../webcomponents/clinical/analysis/mutational-signature-view.js";
import "../../webcomponents/clinical/clinical-analysis-create.js";
import "../../webcomponents/file/file-manager.js";
import "../../webcomponents/job/job-monitor.js";
import "../../webcomponents/loading-spinner.js";
import "../../webcomponents/organization/admin/organization-admin.js";
import "../../webcomponents/project/projects-admin.js";
import "../../webcomponents/study/admin/study-admin.js";
import "../../webcomponents/study/admin/study-admin-iva.js";
import "../../webcomponents/study/admin/catalog-admin.js";
import "../../webcomponents/study/admin/variant/operations-admin.js";
import "../../webcomponents/user/user-profile.js";
import "../../webcomponents/api/rest-api.js";
import "../../webcomponents/note/note-browser.js";

import "../../webcomponents/commons/layouts/custom-footer.js";
import "../../webcomponents/commons/layouts/custom-navbar.js";
import "../../webcomponents/commons/layouts/custom-page.js";
import "../../webcomponents/commons/layouts/custom-sidebar.js";
import "../../webcomponents/commons/layouts/custom-welcome.js";
import "../../webcomponents/commons/layouts/custom-landing.js";

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

        // We can customise which components are active by default, this improves the first loading time.
        _config.enabledComponents = {};
        _config.enabledComponents.home = true;

        // Reading the default settings from the config files, eg. browser.settings.js
        // Store them in a flat structure.
        this.DEFAULT_TOOL_SETTINGS = {
            ...CATALOG_SETTINGS,
            // ...VARIANT_SETTINGS,
            ...INTERPRETER_SETTINGS,
            ...USER_SETTINGS
            // CUSTOM_PAGES,
        };

        const components = [
            "home",
            "gettingstarted",
            "aboutzetta",
            // "reset-password",
            "settings",
            "account",
            "projects",
            "file-manager",
            "beacon",
            "project",
            "file",
            "fileUpdate",
            // Sample
            "sample",
            "sample-view",
            "sampleVariantStatsBrowser",
            "sampleUpdate",
            "sample-variant-stats",
            "individual",
            "individualUpdate",
            "family",
            "familyUpdate",
            "cohort",
            "clinicalAnalysis",
            "clinicalAnalysisPortal",
            "clinicalAnalysisCreator",
            "settings",
            "gene",
            "transcript",
            "protein",
            "variant-browser",
            "job",
            "cat-browser",
            "cat-analysis",
            "cat-clinical",
            "cat-tools",
            "cat-catalog",
            "cat-alignment",
            "cat-ga4gh",
            // Variant
            "eligibility",
            "gwas",
            "cohort-variant-stats",
            "sample-eligibility",
            "knockout",
            "inferred-sex",
            "mutational-signature",
            "individual-relatedness",
            "mendelian-error",
            "plink",
            "gatk",
            "variant-export",
            "variant-stats-exporter",
            // Quality Control
            "sample-qc",
            "individual-qc",
            "family-qc",
            // Clinical
            "clinical-analysis-create",
            "interpreter",
            "rd-tiering",
            // Alignment
            "alignment-index",
            "alignment-stats",
            "coverage-index",
            "job-view",
            "rga",
            "disease-panel",
            "diseasePanelUpdate",
            "clinicalAnalysis",
            // Admin
            "organization-admin",
            "study-admin",
            "study-admin-iva",
            // "catalog-admin",
            "operations-admin",
            "opencga-admin",
            "variants-admin",
            // "projects-admin",
            // REST-API
            "rest-api",
            // note
            "note-browser",
        ];

        // Add custom tools
        ExtensionsManager
            .getTools()
            .forEach(tool => components.push(tool.id));

        for (const component of components) {
            _config.enabledComponents[component] = false;
        }

        // Register custom page component
        // Only will be displayed if no other component matches the current url
        _config.enabledComponents["customPage"] = false;

        // We set the global Polymer variable, this produces one single event
        this.config = _config;

        // Get version from env variable
        // eslint-disable-next-line no-undef
        this.version = process.env.VERSION;

        // Initially we load the SUIte config
        this.app = this.getActiveAppConfig();

        // We need to listen to hash fragment changes to update the URL
        window.onhashchange = e => {
            // e.preventDefault();
            console.log("URL Hash changed: ", e);
            this.hashFragmentListener();
        };

        // Remember the tool that was previously set
        this.tool = window.location.hash.split("/")[0];
        if (UtilsNew.isEmpty(this.tool)) {
            this.tool = "#home";
            // this.app = null;
        }

        // Go to the page that tool has
        // if (window.location.hash !== this.tool) {
        //     window.location.hash = this.tool;
        // }

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
                if (modified && OpencgaCatalogUtils.isAdmin(study, this.opencgaSession.user.id)) {
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
                if (hashProject && hashStudy) {
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
            // eslint-disable-next-line no-undef
            Cookies.expire(this.opencgaClient._config.sso.cookie);

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

    // async saveLastStudy(newStudy) {
    //     const userConfig = await this.opencgaClient.updateUserConfig({
    //         ...this.opencgaSession.user.configs.IVA,
    //         lastStudy: newStudy.fqn
    //     });
    //     this.opencgaSession.user.configs.IVA = userConfig.responses[0].results[0];
    // }

    // onUrlChange(e) {
    //     let hashFrag = e.detail.id;
    //     if (UtilsNew.isNotUndefined(this.opencgaSession.project) && UtilsNew.isNotEmpty(this.opencgaSession.project.alias)) {
    //
    //         hashFrag += "/" + this.opencgaSession.project.alias;
    //         if (UtilsNew.isNotUndefined(this.opencgaSession.study) && UtilsNew.isNotEmpty(this.opencgaSession.study.alias)) {
    //             hashFrag += "/" + this.opencgaSession.study.alias;
    //         }
    //     }
    //
    //     const myQueryParams = [];
    //     for (const key in e.detail.query) {
    //         myQueryParams.push(key + "=" + e.detail.query[key]);
    //     }
    //     if (myQueryParams.length > 0) {
    //         hashFrag += `?${myQueryParams.join("&")}`;
    //     }
    //
    //     window.location.hash = hashFrag;
    // }

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
        // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        // e.preventDefault();

        const target = e.currentTarget;
        $(".navbar-zetta ul > li > a", this).removeClass("active");
        $(target).addClass("active");
        if ($(target).closest("ul").hasClass("dropdown-menu")) {
            $(target).closest("ul").closest("li > a").addClass("active");
        }

        // if (target?.attributes?.href) {
        //     this.tool = target.attributes.href.value;
        // } else {
        //     this.tool = "#home";
        // }

        // // this.renderHashFragments();
        // this.hashFragmentListener();
    }

    hashFragmentListener() {
        console.log("hashFragmentListener - Hide all enabled elements");

        // 1. Hide all elements
        for (const element in this.config.enabledComponents) {
            if (this.config.enabledComponents[element]) {
                this.config.enabledComponents[element] = false;
            }
        }

        // 2. Parse hash fragment URL
        const [hashTool, hashProject, hashStudy, hashQuery] = window.location.hash.split("/");

        // 3. Processing the actions
        // NOTE: remove this check: hashTool === "#interpreter" ||
        if (hashTool !== this.tool) {
            this.tool = hashTool;
        }

        // 4. Parse project and study
        if (hashProject !== this.opencgaSession?.project?.id || hashStudy !== this.opencgaSession?.study?.id) {
            if (hashProject && hashStudy) {
                this.changeActiveStudy(`${this.opencgaSession.user.id}@${hashProject}:${hashStudy}`);
            }
        }

        // 5. Update location.hash (only if project.id and study.id are defined)
        if (this.opencgaSession?.project?.id && this.opencgaSession?.study?.id) {
            // Josemi NOTE 2024-04-25 Added additional check to prevent removing the query section of the url if the tool is interpreter
            // as we need it tell IVA which clinical analysis should open if user reloads the browser tab.
            if (hashTool !== "#interpreter") {
                window.location.hash = `${hashTool || "home"}/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}`;
            }
        }

        // 6. Parse query fragment in 'featureId'
        if (hashTool && hashQuery) {
            const componentId = hashTool.replace("#", "");

            let query = {};
            // Check if key=value list exist
            if (hashQuery.includes("=")) {
                Array.from(new URLSearchParams(hashQuery).entries()).forEach(entry => {
                    query[entry[0]] = entry[1];
                });
            } else {
                // Default query filter is 'id'
                query = {id: hashQuery};
            }

            switch (hashTool) {
                case "#variant-browser":
                case "#sample":
                    this.queries[componentId] = query;
                    break;
                case "#gene":
                    this.gene = hashQuery || null;
                    break;
                case "#transcript":
                    if (hashQuery.startsWith("ENST")) {
                        this.transcript = hashQuery;
                    } else {
                        this.gene = hashQuery;
                    }
                    break;
                case "#protein":
                    this.protein = hashQuery || null;
                    break;
                case "#interpreter":
                    this.clinicalAnalysisId = hashQuery;
                    if (!this.clinicalAnalysisId) {
                        // Redirect to Case Portal when trying to access the interpreter without a valid Clinical Analysis ID
                        window.location.hash = `#clinicalAnalysisPortal/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}`;
                    }
                    break;
                case "#sampleVariantStatsBrowser":
                case "#sampleUpdate":
                    this.sampleId = hashQuery;
                    break;
                case "#fileUpdate":
                    this.fileId = hashQuery;
                    break;
                case "#individualUpdate":
                    this.individualId = hashQuery;
                    break;
                case "#familyUpdate":
                    this.familyId = hashQuery;
                    break;
                case "#study-admin":
                    // this.studyAdminFqn = arr[1];
                    const arr = window.location.hash.split("/");
                    this.changeActiveStudy(arr[1]);
                    break;
                case "#diseasePanelUpdate":
                    this.diseasePanelId = hashQuery;
                    break;
            }
            // this.requestUpdate();
        }

        // 7. Enable component
        console.log("hashFragmentListener - Show enabled element " + this.tool);
        const componentName = this.tool.replace("#", "");
        if (this.config.enabledComponents.hasOwnProperty(componentName)) {
            this.config.enabledComponents[componentName] = true;
        } else {
            // If the component does not exist, mark as custom page
            this.config.enabledComponents["customPage"] = true;
        }

        this.requestUpdate();

        // TODO quickfix to avoid hash browser scroll
        $("body,html").animate({
            scrollTop: 0
        }, 1);
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
            // 1. Update the lastStudy in config iff has changed
            this.opencgaClient.updateUserConfig("IVA", {
                ...this.opencgaSession.user.configs["IVA"],
                lastStudy: studyFqn
            });

            // 2. Set the new Hash URL
            let newHashFragmentUrl = this.tool !== "#interpreter" ? this.tool : "#clinicalAnalysisPortal";
            if (this.opencgaSession?.project) {
                newHashFragmentUrl += "/" + this.opencgaSession.project.id;
                if (this.opencgaSession.study) {
                    newHashFragmentUrl += "/" + this.opencgaSession.study.id;
                }
            }
            window.location.hash = newHashFragmentUrl;

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
            });

            // 2.1 This simplifies passing 'cellbaseClient' to all components
            this.opencgaSession.cellbaseClient = this.cellbaseClient;
        }
    }

    // updateProject(e) {
    //     this.project = this.projects.find(project => project.name === e.detail.project.name);
    //     // this.tool = "#project";
    //     this.renderHashFragments("project");
    //     // this.renderBreadcrumb();
    // }

    // updateStudy(e) {
    //     if (e.detail.project?.name) {
    //         this.project = e.detail.project;
    //     }
    //     this.study = this.project.studies.find(study => study.name === e.detail.study.name);
    //
    //     //                TODO: Opencga study will be shown later. For now variant browser is shown when the study changes
    //     //                this.tool = "studyInformation";
    //     // this.tool = "#variant-browser";
    //     this.renderHashFragments("variant-browser");
    //     // this.renderBreadcrumb();
    // }

    onSampleChange(e) {
        // if (UtilsNew.isNotUndefinedOrNull(this.samples) && UtilsNew.isNotUndefinedOrNull(e.detail)) {
        // this.samples = e.detail.samples;
        // this._samplesPerTool[this.tool.replace("#", "")] = this.samples;
        // this.renderBreadcrumb();
        // }
    }

    // quickSearch(e) {
    //     this.tool = "#variant-browser";
    //     window.location.hash = "variant-browser/" + this.opencgaSession.project.id + "/" + this.opencgaSession.study.id;
    //     // this.browserQuery = {xref: e.detail.value};
    //
    //     this.browserSearchQuery = e.detail;
    // }

    // quickFacetSearch(e) {
    //     console.log("IVA-APP quickfacetsearch");
    //     this.tool = "#facet";
    //     window.location.hash = "facet/" + this.opencgaSession.project.id + "/" + this.opencgaSession.study.id;
    //     // this.browserQuery = {xref: e.detail.value};
    //     this.browserSearchQuery = e.detail;
    // }

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

    onChangeApp(e) {
        // If an App ID exists we display the corresponding app. If not we just show the Suite
        if (e.currentTarget.dataset.id) {
            this.app = this.config.apps.find(app => app.id === e.currentTarget.dataset.id);
        } else {
            this.app = this.getActiveAppConfig();
        }

        // Change current tool in navbar
        this.changeTool(e);
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

    // createAboutLink(link, button) {
    //     const url = link.url ? `${link.url}` : `#${link.id}`;
    //     const iconHtml = link.icon ? html`<i class="${link.icon} icon-padding" aria-hidden="true"></i>` : null;
    //     if (link.url) {
    //         return html`
    //             <a href="${url}" role="${button ? "button" : "link"}" target="_blank">${iconHtml} ${link.name}</a>`;
    //     } else {
    //         return html`
    //             <a href="${url}" role="${button ? "button" : "link"}">${iconHtml} ${link.name}</a>`;
    //     }
    // }

    onSessionUpdateRequest() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            title: "Refresh Session: Session Update Request",
            message: "Session updated correctly",
        });
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

    onStudyUpdateRequest(e) {
        if (e.detail.value) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                title: "Refresh Session",
                message: "Session updated correctly",
            });
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
    }

    renderCustomPage() {
        const pageName = this.tool.replace("#", "");
        const page = (this.config.pages || []).find(p => p.url === pageName);

        if (page) {
            return html`
                <div class="d-flex justify-content-center align-items-center vh-100" id="page">
                    <custom-page .page="${page}"></custom-page>
                </div>
            `;
        }

        // No page found --> Render a not found error page (TODO)
        return html`Not found :-(`;
    }

    render() {
        if (!this.isLoggedIn() && !this.isCreatingSession) {
            return html`
                <custom-landing
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.config}"
                    @login="${this.onLogin}">
                </custom-landing>
            `;
        }

        return html`
            <style>
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

            <!-- Left Sidebar: we only display this if more than 1 visible app exist -->
            <custom-sidebar
                .config="${this.config}"
                .loggedIn="${this.isLoggedIn()}"
                @changeApp="${e => this.onChangeApp(e.detail.event, e.detail.toggle)}">
            </custom-sidebar>

            <!-- Navbar -->
            <custom-navbar
                .app="${this.app}"
                .version="${this.version}"
                .loggedIn="${this.isLoggedIn()}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.config}"
                @logout="${() => this.logout()}"
                @changeTool="${e => this.changeTool(e.detail.value)}"
                @changeApp="${e => this.onChangeApp(e.detail.event, e.detail.toggle)}"
                @studySelect="${ e => this.onStudySelect(e.detail.event, e.detail.study)}"
                @jobSelected="${e => this.onJobSelected(e)}">
            </custom-navbar>

            ${ this.isCreatingSession ? html`
                <div class="login-overlay position-absolute top-50 start-50 translate-middle">
                    <loading-spinner
                        .description="${"Creating session..."}">
                    </loading-spinner>
                </div>
            ` : nothing}

            <!-- This is where main IVA application is rendered -->
            <div class="container-fluid" style="min-height:calc(100vh - 101px);">
                ${!this.isCreatingSession ? html`
                    ${this.config.enabledComponents.home ? html`
                        <div class="d-flex justify-content-center" id="home">
                            <custom-welcome
                                .app="${this.app}"
                                .config="${this.config}"
                                .opencgaSession="${this.opencgaSession}"
                                .version="${this.config.version}"
                                @changeApp="${e => this.onChangeApp(e.detail.e, false)}">
                            </custom-welcome>
                        </div>
                    ` : nothing}

                    <!-- Render custom page content if enabled -->
                    ${this.config.enabledComponents.customPage ? this.renderCustomPage() : nothing}

                    ${this.config.enabledComponents.terms ? html`
                        <div class="content" id="terms">
                            <terms-web version="${this.config.version}"></terms-web>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.contact ? html`
                        <div class="content" id="contact">
                            <contact-web version="${this.config.version}"></contact-web>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.faq ? html`
                        <div class="content" id="faq">
                            <faq-web version="${this.config.version}"></faq-web>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.gettingstarted ? html`
                        <div class="content" id="getting-started">
                            <getting-started .opencgaSession="${this.opencgaSession}" .config="${this.config}"></getting-started>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents?.aboutzetta ? html`
                        <div class="content" id="faq">
                            <custom-page
                                .page="${this.config.aboutPage}"
                                .opencgaSession="${this.opencgaSession}">
                            </custom-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["variant-browser"] ? html`
                        <div class="content" id="variant-browser">
                            <variant-browser
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .reactomeClient="${this.reactomeClient}"
                                .query="${this.queries["variant-browser"]}"
                                .settings="${this.settings.VARIANT_BROWSER}"
                                .consequenceTypes="${this.config.consequenceTypes}"
                                .populationFrequencies="${this.config.populationFrequencies}"
                                .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                                @onGene="${this.geneSelected}"
                                @onSamplechange="${this.onSampleChange}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "variant-browser")}"
                                onqueryChange="${e => this.onQueryChange(e, "variant")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "variant-browser")}">
                            </variant-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["clinicalAnalysisPortal"] ? html`
                        <div class="content" id="clinicalAnalysisPortal">
                            <clinical-analysis-portal
                                .opencgaSession="${this.opencgaSession}"
                                .settings="${this.settings.CLINICAL_ANALYSIS_PORTAL_BROWSER}"
                                @sessionPanelUpdate="${this.onSessionPanelUpdate}">
                            </clinical-analysis-portal>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["rga"] ? html`
                        <div class="content" id="rga">
                            <rga-browser
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .settings="${this.settings.RGA_BROWSER}">
                            </rga-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["rd-interpreter"] ? html`
                        <div class="content" id="rd-interpreter">
                            <variant-rd-interpreter
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
                            </variant-rd-interpreter>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cancer-interpreter"] ? html`
                        <div class="content" id="cancer-interpreter">
                            <variant-cancer-interpreter
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .clinicalAnalysisId="${this.clinicalAnalysisId}"
                                .query="${this.interpretationSearchQuery}"
                                .consequenceTypes="${this.config.consequenceTypes}"
                                .populationFrequencies="${this.config.populationFrequencies}"
                                .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                                @gene="${this.geneSelected}"
                                @samplechange="${this.onSampleChange}">
                            </variant-cancer-interpreter>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.beacon ? html`
                        <div class="content" id="beacon">
                            <variant-beacon .opencgaSession="${this.opencgaSession}">
                            </variant-beacon>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.genomeBrowser ? html`
                        <div class="content" id="genomeBrowser">
                            Not available yet...
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.sample ? html`
                        <div class="content" id="sample">
                            <sample-browser
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.queries.sample}"
                                .settings="${this.settings.SAMPLE_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "sample")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "sample")}">
                            </sample-browser>
                        </div>
                    ` : nothing}


                    ${this.config.enabledComponents.panel ? html`
                        <div class="content" id="panel">
                            <opencga-panel-browser
                                .opencgaSession="${this.opencgaSession}"
                                .opencgaClient="${this.opencgaClient}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .eventNotifyName="${this.config.notifyEventMessage}"
                                @notifymessage="${this.onNotifyMessage}">
                            </opencga-panel-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.file ? html`
                        <div class="content" id="file">
                            <file-browser
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.queries.file}"
                                .settings="${this.settings.FILE_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "file")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "file")}">
                            </file-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["disease-panel"] ? html`
                        <div class="content" id="disease-panel">
                            <disease-panel-browser
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .query="${this.queries["disease-panel"]}"
                                .settings="${this.settings.DISEASE_PANEL_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "disease-panel")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "disease-panel")}">
                            </disease-panel-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["diseasePanelUpdate"] ? html`
                        <div class="content" id="disease-panel">
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
                    ` : nothing}

                    <!--todo check-->
                    ${this.config.enabledComponents["sample-view"] ? html`
                        <div class="content" id="sample-view">
                            <opencga-sample-view
                                .opencgaSession="${this.opencgaSession}"
                                .config="${this.config.sampleView}">
                            </opencga-sample-view>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["fileUpdate"] ? html`
                        <tool-header title="${`File <span class="inverse"> ${this.fileId} </span>` }" icon="fas fa-vial icon-padding"></tool-header>
                        <div class="content" id="fileUpdate">
                            <file-update
                                .fileId="${this.fileId}"
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
                            </file-update>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["sampleUpdate"] ? html`
                        <tool-header title="${`Sample <span class="inverse"> ${this.sampleId} </span>` }" icon="fas fa-vial icon-padding"></tool-header>
                        <div class="content" id="sampleUpdate">
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
                    ` : nothing}

                    ${this.config.enabledComponents["individualUpdate"] ? html`
                        <tool-header title="${`Individual <span class="inverse"> ${this.individualId} </span>` }" icon="fas fa-vial icon-padding"></tool-header>
                        <div class="content" id="individualUpdate">
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
                    ` : nothing}

                    ${this.config.enabledComponents["familyUpdate"] ? html`
                        <tool-header title="${`Family <span class="inverse"> ${this.familyId} </span>` }" icon="fas fa-vial icon-padding"></tool-header>
                        <div class="content" id="familyUpdate">
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
                    ` : nothing}

                    ${this.config.enabledComponents.gene ? html`
                        <div class="content" id="gene">
                            <opencga-gene-view
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .geneId="${this.gene}"
                                .populationFrequencies="${this.config.populationFrequencies}"
                                .consequenceTypes="${this.config.consequenceTypes}"
                                .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                                .settings="${OPENCGA_GENE_VIEW_SETTINGS}"
                                .summary="${this.config.opencga.summary}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "variant")}">
                            </opencga-gene-view>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.transcript ? html`
                        <div class="content feature-view" id="transcript">
                            <opencga-transcript-view
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .opencgaClient="${this.opencgaClient}"
                                .transcript="${this.transcript}"
                                .gene="${this.gene}"
                                .populationFrequencies="${this.config.populationFrequencies}"
                                .consequenceTypes="${this.config.consequenceTypes}"
                                .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                                .settings="${OPENCGA_GENE_VIEW_SETTINGS}">
                            </opencga-transcript-view>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.protein ? html`
                        <div class="content feature-view" id="protein">
                            <opencga-protein-view
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .opencgaClient="${this.opencgaClient}"
                                .project="${this.opencgaSession.project}"
                                .study="${this.opencgaSession.study}"
                                .protein="${this.protein}"
                                .populationFrequencies="${this.config.populationFrequencies}"
                                .consequenceTypes="${this.config.consequenceTypes}"
                                .proteinSubstitutionScores="${this.config.proteinSubstitutionScores}"
                                .settings="${OPENCGA_GENE_VIEW_SETTINGS}">
                            </opencga-protein-view>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.individual ? html`
                        <div class="content" id="individual">
                            <individual-browser
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.queries.individual}"
                                .settings="${this.settings.INDIVIDUAL_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "individual")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "individual")}">
                            </individual-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.family ? html`
                        <div class="content" id="family">
                            <family-browser
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.queries.family}"
                                .settings="${this.settings.FAMILY_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "family")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "family")}">
                            </family-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.cohort ? html`
                        <div class="content" id="cohort">
                            <cohort-browser
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.queries.cohort}"
                                .settings="${this.settings.COHORT_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "cohort")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "cohort")}">
                            </cohort-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.clinicalAnalysis ? html`
                        <div class="content" id="clinicalAnalysis">
                            <clinical-analysis-browser
                                .opencgaSession="${this.opencgaSession}"
                                .settings="${this.settings.CLINICAL_ANALYSIS_BROWSER}"
                                .config="${{componentId: "clinicalAnalysisBrowserCatalog"}}"
                                .query="${this.queries["clinical-analysis"]}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "clinical-analysis")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "clinical-analysis")}">
                            </clinical-analysis-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.job ? html`
                        <div class="content" id="job">
                            <job-browser
                                .opencgaSession="${this.opencgaSession}"
                                .settings= ${this.settings.JOB_BROWSER}
                                .query="${this.queries.job}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "job")}"
                                @activeFilterChange="${e => this.onQueryFilterSearch(e, "job")}">
                            </job-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["note-browser"] ? html`
                        <div class="content" id="note-browser">
                            <note-browser
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.queries["note-browser"]}"
                                .settings="${this.settings.NOTE_BROWSER}"
                                @querySearch="${e => this.onQueryFilterSearch(e, "note-browser")}">
                            </note-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-browser"] ? html`
                        <div class="content" id="cat-browser">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "variant-browser")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-analysis"] ? html`
                        <div class="content" id="cat-analysis">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "analysis")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-clinical"] ? html`
                        <div class="content" id="cat-clinical">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "clinical")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-tools"] ? html`
                        <div class="content" id="cat-tools">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "tools")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-catalog"] ? html`
                        <div class="content" id="cat-catalog">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "catalog")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-alignment"] ? html`
                        <div class="content" id="cat-alignment">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "alignment")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cat-ga4gh"] ? html`
                        <div class="content" id="cat-ga4gh">
                            <category-page .opencgaSession="${this.opencgaSession}" .config="${this.app?.menu?.find(item => item.id === "ga4gh")}">
                            </category-page>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["sampleVariantStatsBrowser"] ? html`
                        <div class="content" id="sampleVariantStatsBrowser">
                            <sample-variant-stats-browser
                                .opencgaSession="${this.opencgaSession}"
                                .sampleId="${this.sampleId}"
                                .active="${true}"
                                .settings="${{...VARIANT_INTERPRETER_SAMPLE_VARIANT_STATS_SETTINGS, showTitle: true}}">
                            </sample-variant-stats-browser>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["sample-variant-stats"] ? html`
                        <div class="container py-3" id="sample-variant-stats-analysis">
                            <sample-variant-stats-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </sample-variant-stats-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["cohort-variant-stats"] ? html`
                        <div class="container py-3" id="cohort-variant-stats-analysis">
                            <cohort-variant-stats-analysis .opencgaSession="${this.opencgaSession}"></cohort-variant-stats-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["eligibility"] ? html`
                        <div class="content" id="opencga-variant-eligibility-analysis">
                            <opencga-variant-eligibility-analysis .opencgaSession="${this.opencgaSession}"></opencga-variant-eligibility-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["sample-eligibility"] ? html`
                        <div class="container py-3" id="sample-eligibility-analysis">
                            <sample-eligibility-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </sample-eligibility-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["knockout"] ? html`
                        <div class="container py-3" id="knockout-analysis">
                            <knockout-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </knockout-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["inferred-sex"] ? html`
                        <div class="container py-3" id="inferred-sex-analysis">
                            <inferred-sex-analysis
                                .opencgaSession="${this.opencgaSession}"
                                .config=${{title: ""}}>
                            </inferred-sex-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["individual-relatedness"] ? html`
                        <div class="container py-3" id="individual-relatedness-analysis">
                            <individual-relatedness-analysis
                                .opencgaSession="${this.opencgaSession}"
                                .config=${{title: ""}}>
                            </individual-relatedness-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["mendelian-error"] ? html`
                        <div class="container py-3" id="mendelian-error-analysis">
                            <mendelian-error-analysis .opencgaSession="${this.opencgaSession}"></mendelian-error-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["sample-qc"] ? html`
                        <div class="container py-3" id="sample-qc-analysis">
                            <sample-qc-analysis
                                .opencgaSession="${this.opencgaSession}"
                                .config=${{title: ""}}>
                            </sample-qc-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["individual-qc"] ? html`
                        <div class="container py-3" id="individual-qc-analysis">
                            <individual-qc-analysis
                                .opencgaSession="${this.opencgaSession}"
                                .config=${{title: ""}}>
                            </individual-qc-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["family-qc"] ? html`
                        <div class="container py-3" id="family-qc-analysis">
                            <family-qc-analysis
                                .opencgaSession="${this.opencgaSession}"
                                .config=${{title: ""}}>
                            </family-qc-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["plink"] ? html`
                        <div class="content" id="opencga-plink-analysis">
                            <opencga-plink-analysis .opencgaSession="${this.opencgaSession}"></opencga-plink-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["gatk"] ? html`
                        <div class="content" id="opencga-gatk-analysis">
                            <opencga-gatk-analysis .opencgaSession="${this.opencgaSession}"></opencga-gatk-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["variant-export"] ? html`
                        <div class="container py-3" id="variant-export-analysis">
                            <variant-export-analysis .opencgaSession="${this.opencgaSession}"></variant-export-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["variant-stats-exporter"] ? html`
                        <div id="opencga-variant-stats-exporter-analysis">
                            <opencga-variant-stats-exporter-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </opencga-variant-stats-exporter-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["mutational-signature"] ? html`
                        <div class="container py-3" id="mutational-signature-analysis">
                            <mutational-signature-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </mutational-signature-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["gwas"] ? html`
                        <div class="container py-3" id="gwas-analysis">
                            <gwas-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </gwas-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["rd-tiering"] ? html`
                        <div class="container py-3" id="rd-tiering-analysis">
                            <rd-tiering-analysis
                                .opencgaSession="${this.opencgaSession}">
                            </rd-tiering-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["clinical-analysis-create"] ? html`
                        <tool-header title="${"Create Case"}" icon="${"fas fa-window-restore"}"></tool-header>
                        <div class="content container" id="opencga-clinical-analysis-create">
                            <clinical-analysis-create
                                .opencgaSession="${this.opencgaSession}"
                                @clinicalanalysischange="${this.onClinicalAnalysisEditor}">
                            </clinical-analysis-create>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.account ? html`
                        <div class="content" id="account">
                            <user-profile
                                .opencgaSession="${this.opencgaSession}"
                                .settings="${this.settings.USER_PROFILE_SETTINGS}">
                            </user-profile>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["file-manager"] ? html`
                        <div class="content" id="file-manager">
                            <file-manager .opencgaSession="${this.opencgaSession}"></file-manager>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents.settings ? html`
                        <div class="content" id="settings">
                            <iva-settings .opencgaSession="${this.opencgaSession}"></iva-settings>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["interpreter"] ? html`
                        <div class="content" id="interpreter">
                            <variant-interpreter
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .clinicalAnalysisId="${this.clinicalAnalysisId}"
                                .settings="${this.settings.VARIANT_INTERPRETER_SETTINGS}"
                                @selectClinicalAnalysis="${this.onSelectClinicalAnalysis}">
                            </variant-interpreter>
                        </div>
                    ` : nothing}

                    <!-- Alignment Analysis-->
                    ${this.config.enabledComponents["alignment-index"] ? html`
                        <div id="alignment-index" class="content">
                            <opencga-alignment-index-analysis .opencgaSession="${this.opencgaSession}"></opencga-alignment-index-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["coverage-index"] ? html`
                        <div id="coverage-index" class="content">
                            <opencga-coverage-index-analysis .opencgaSession="${this.opencgaSession}"></opencga-coverage-index-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["alignment-stats"] ? html`
                        <div id="alignment-stats" class="content col-md-6 col-md-offset-3">
                            <opencga-alignment-stats-analysis .opencgaSession="${this.opencgaSession}"></opencga-alignment-stats-analysis>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["job-view"] ? html`
                        <tool-header title="${this.jobSelected || "No job selected"}" icon="${"fas fa-rocket"}"></tool-header>
                        <div class="container py-3" id="job-view">
                            <job-view
                                mode="full"
                                .jobId="${this.jobSelected}"
                                .opencgaSession="${this.opencgaSession}">
                            </job-view>
                        </div>
                    ` : nothing}

                    <!-- Admin -->
                    ${this.config.enabledComponents["organization-admin"] ? html`
                        <tool-header title="Organization Admin: ${this.opencgaSession?.user?.organization}" icon="${"fas fa-sitemap"}"></tool-header>
                        <div id="organization-admin">
                            <organization-admin
                                .organization="${this.opencgaSession?.organization}"
                                .opencgaSession="${this.opencgaSession}"
                                @studyUpdateRequest="${this.onStudyUpdateRequest}"
                                @sessionUpdateRequest="${this.onSessionUpdateRequest}">
                            </organization-admin>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["catalog-admin"] ? html`
                        <div class="content row" id="catalog-admin">
                            <catalog-admin
                                .opencgaSession="${this.opencgaSession}"
                                @sessionUpdateRequest="${this.onSessionUpdateRequest}">
                            </catalog-admin>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["projects-admin"] ? html`
                        <tool-header title="Study Dashboard" icon="${"fas fa-rocket"}"></tool-header>
                        <div id="projects-admin">
                            <projects-admin
                                .opencgaSession="${this.opencgaSession}"
                                @sessionUpdateRequest="${this.onSessionUpdateRequest}">
                            </projects-admin>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["study-admin"] ? html`
                        <div class="content" id="study-admin">
                            <study-admin
                                .opencgaSession="${this.opencgaSession}"
                                @studyUpdateRequest="${this.onStudyUpdateRequest}">
                            </study-admin>
                        </div>
                    ` : nothing}

                    <!-- NOTE Vero: "row" class to avoid tricky css for undoing the margin bootstrap of container-fluid -->
                    <!-- Remove this from the parameters: .study="$ {this.opencgaSession.study}" -->
                    ${this.config.enabledComponents["study-admin-iva"] ? html`
                        <div class="content row">
                            <study-admin-iva
                                .organizationId="${this.opencgaSession?.user?.organization}"
                                .opencgaSession="${this.opencgaSession}"
                                .settings="${this.settings}"
                                @studyUpdateRequest="${this.onStudyUpdateRequest}">
                            </study-admin-iva>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["operations-admin"] ? html`
                        <div class="content row">
                            <operations-admin
                                .organizationId="${this.opencgaSession?.user?.organization}"
                                .study="${this.opencgaSession.study}"
                                .opencgaSession="${this.opencgaSession}"
                                @studyUpdateRequest="${this.onStudyUpdateRequest}">
                            </operations-admin>
                        </div>
                    ` : nothing}

                    ${this.config.enabledComponents["rest-api"] ? html`
                        <tool-header title="REST API" icon="${"fas fa-rocket"}"></tool-header>
                        <div class="content">
                            <rest-api .opencgaSession="${this.opencgaSession}"></rest-api>
                        </div>
                    ` : nothing}

                    ${ExtensionsManager.getTools().map(tool => html`
                        ${this.config.enabledComponents[tool.id] ? html`
                            <div class="content">
                                ${tool.render(this.opencgaSession)}
                            </div>
                        ` : nothing}
                    `)}
                ` : nothing}
            </div>

            <custom-footer
                .version="${this.version}"
                .host="${this.host}"
                .config="${this.config}">
            </custom-footer>
        `;
    }

}

customElements.define("iva-app", IvaApp);
