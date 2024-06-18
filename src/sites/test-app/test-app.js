/* eslint-disable no-constant-condition */
/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */
/* eslint-disable valid-jsdoc */
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

import {html, LitElement, nothing} from "lit";

import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../../webcomponents/commons/utils/notification-utils.js";
import NotificationManager from "../../core/notification-manager.js";
import {OpenCGAClientMock} from "./clients/opencga-client-mock.js";
import {CellBaseClientMock} from "./clients/cellbase-client-mock.js";

import "../../webcomponents/loading-spinner.js";
import "../../webcomponents/variant/variant-browser-grid.js";
import "../../webcomponents/commons/layouts/custom-footer.js";
import "../../webcomponents/commons/layouts/custom-navbar.js";
import "../../webcomponents/commons/layouts/custom-sidebar.js";
import "../../webcomponents/commons/layouts/custom-welcome.js";

import "./webcomponents/data-form-test.js";
import "./webcomponents/data-form-table-test.js";
import "./webcomponents/custom-page-test.js";
import "./webcomponents/variant-browser-grid-test.js";
import "./webcomponents/sample-browser-grid-test.js";
import "./webcomponents/variant-interpreter-grid-test.js";
import "./webcomponents/file-browser-grid-test.js";
import "./webcomponents/individual-browser-grid-test.js";
import "./webcomponents/family-browser-grid-test.js";
import "./webcomponents/cohort-browser-grid-test.js";
import "./webcomponents/job-browser-grid-test.js";
import "./webcomponents/disease-panel-browser-grid-test.js";

import "./webcomponents/interpreter/variant-interpreter-rd-grid-test.js";

import "./webcomponents/genome-browser-test.js";
import "./webcomponents/protein-lollipop-test.js";

import {DATA_FORM_EXAMPLE} from "./conf/data-form.js";
import {SAMPLE_DATA} from "./data/data-example.js";

class TestApp extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    /**
     * This function creates all the initial configuration
     * @private
     */
    #init() {
        this.dataTest = {...SAMPLE_DATA};
        this._dataFormConfig = DATA_FORM_EXAMPLE;
        // Create the 'config' , this objects contains all the different configuration
        const _config = SUITE;
        _config.opencga = opencga;
        _config.cellbase = typeof CELLBASE_CONFIG !== "undefined" ? CELLBASE_CONFIG : null;
        _config.pages = typeof CUSTOM_PAGES !== "undefined" ? CUSTOM_PAGES : [];
        _config.consequenceTypes = CONSEQUENCE_TYPES;
        _config.populationFrequencies = POPULATION_FREQUENCIES;
        _config.proteinSubstitutionScores = PROTEIN_SUBSTITUTION_SCORE.style;

        // We can customise which components are active by default, this improves the first loading time.
        _config.enabledComponents = {};
        _config.enabledComponents.home = true;

        const components = [
            "home",
            "gettingstarted",
            "login",
            "aboutzetta",
            "data-form",
            "data-form-table",
            "utils-new",
            "catalog-filters",
            "file-browser-grid",
            "individual-browser-grid",
            "family-browser-grid",
            "cohort-browser-grid",
            "sample-browser-grid",
            "job-browser-grid",
            "disease-panel-browser-grid",
            "opencga-update",
            "variant-browser-grid",
            "variant-interpreter-grid-germline",
            "variant-interpreter-grid-cancer",
            "variant-interpreter-grid-cancer-cnv",
            "variant-filters",
            "genome-browser",
            "protein-lollipop",
            "pedigree",
            "mutational-signatures",

            "variant-interpreter-rd-grid",
        ];

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

        const array = this.version.split(".");
        this.testDataVersion = array[0] + "." + array[1];

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
        this.initOpencgaSessionMock();
        // this.opencgaSession.projects = this.opencgaSession.user.projects;
        // this.opencgaSession.project = this.opencgaSession.projects[0];
        // this.opencgaSession.study = this.opencgaSession.project.studies[0];
        // this.mutate();
    }

    initOpencgaSessionMock() {
        console.log("This opencgaClient Mock Session");
        // UtilsTest.getFileJson("data/variant-browser-data.zip", "variant-browser-data.json")
        //     .then(content => {
        //         this.opencgaSession = content;
        //         this.requestUpdate();
        //     });
        // this.opencgaSession = {};
        this.opencgaSession = null;
        this.initProjectMock();
    }

    initProjectMock() {
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/opencga-session.json`)
            .then(content => {
                this.opencgaSession = content;

                // Initialise opencgaSession
                this.opencgaSession.projects = content.user.projects;
                this.opencgaSession.project = content.user.projects[0];
                this.opencgaSession.study = content.user.projects[0].studies[0];

                // Initialise opencgaSession Client Mock
                this.opencgaSession.opencgaClient = new OpenCGAClientMock();
                this.opencgaSession.cellbaseClient = new CellBaseClientMock();
                // We need to save the testDataVersion in the configuration of each client
                this.opencgaSession.opencgaClient._config.testDataVersion = this.testDataVersion;
                this.opencgaSession.cellbaseClient._config.testDataVersion = this.testDataVersion;
                this.opencgaSession.testEnv = {
                    test: {
                        prefix: "test",
                        active: true,
                    }
                };
                this.requestUpdate();
            })
            .catch(err => {
                console.log(err);
            });
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
    }

    opencgaSessionObserver() {
        this.renderHashFragments();
        // this.requestUpdate();
    }

    changeTool(e) {
        e.preventDefault();
        const target = e.currentTarget;
        $(".navbar-zetta ul > li > a", this).removeClass("active");
        $(target).addClass("active");
        if ($(target).closest("ul").hasClass("dropdown-menu")) {
            $(target).closest("ul").closest("li > a").addClass("active");
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

    onSubmit(e) {
        console.log("Data Test", this.dataTest);
        console.log("Data form Data", e);
        console.log("test input", e);
    }

    renderCustomPage() {
        const pageName = this.tool.replace("#", "");
        const page = (this.config.pages || []).find(p => p.url === pageName);

        if (page) {
            return html`
                <div class="content" id="page">
                    <custom-page
                        .page="${page}">
                    </custom-page>
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
                @changeApp="${e => this.onChangeApp(e.detail.event, e.detail.toggle)}"
                @sideBarToggle="${e => this.toggleSideBar(e.detail.event)}">
            </custom-sidebar>

            <!-- Navbar -->
            <custom-navbar
                .app="${this.app}"
                .version="${this.version}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.config}"
                @logout="${() => this.logout()}"
                @sideBarToggle="${e => this.toggleSideBar(e.detail.event)}"
                @changeTool="${e => this.changeTool(e.detail.value)}"
                @changeApp="${e => this.onChangeApp(e.detail.event, e.detail.toggle)}"
                @studySelect="${e => this.onStudySelect(e.detail.event, e.detail.study)}"
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
            <div class="container-fluid" style="min-height:calc(100vh - 101px);">
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
                    <div class="content mt-3" id="data-form">
                        <data-form-test
                            .data="${this.dataTest}"
                            .config="${this._dataFormConfig}"
                            @submit="${e => this.onSubmit(e)}">
                        </data-form-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["data-form-table"] ? html`
                    <div class="content" id="data-form-table" style="padding:2%">
                        <data-form-table-test
                            testVariantFile="variant-browser-germline"
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}"
                            @fieldChange="${e => this.onFieldChange(e)}"
                            @clear="${e => this.onClear(e)}"
                            @submit="${e => this.onSubmit(e)}">
                        </data-form-table-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["data-form-table"] ? html`
                    <div class="content" id="data-form-table" style="padding:2%">
                        <data-form-table-test
                            testVariantFile="variant-browser-germline"
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}"
                            @fieldChange="${e => this.onFieldChange(e)}"
                            @clear="${e => this.onClear(e)}"
                            @submit="${e => this.onSubmit(e)}">
                        </data-form-table-test>
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

                ${this.config.enabledComponents?.aboutzetta ? html`
                    <div class="content mt-3" id="faq">
                        <custom-page-test
                            .page="${this.config.aboutPage}"
                            .opencgaSession="${this.opencgaSession}">
                        </custom-page-test>
                    </div>
                ` : null}


                ${this.config.enabledComponents["file-browser-grid"] ? html`
                    <div class="content mt-3" id="file-browser-grid">
                        <file-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </file-browser-grid-test>
                    </div>
                ` : nothing}

                ${this.config.enabledComponents["individual-browser-grid"] ? html`
                    <div class="content mt-3" id="individual-browser-grid">
                        <individual-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-browser-grid-test>
                    </div>
                ` : nothing}

                ${this.config.enabledComponents["family-browser-grid"] ? html`
                    <div class="content mt-3" id="family-browser-grid">
                        <family-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </family-browser-grid-test>
                    </div>
                ` : nothing}

                ${this.config.enabledComponents["cohort-browser-grid"] ? html`
                    <div class="content mt-3" id="cohort-browser-grid">
                        <cohort-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </cohort-browser-grid-test>
                    </div>
                ` : nothing}

                ${this.config.enabledComponents["sample-browser-grid"] ? html`
                    <div class="content mt-3" id="sample-browser-grid">
                        <sample-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </sample-browser-grid-test>
                    </div>
                ` : nothing}

                ${this.config.enabledComponents["job-browser-grid"] ? html`
                    <div class="content mt-3" id="job-browser-grid">
                        <job-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </job-browser-grid-test>
                    </div>
                ` : nothing}

                ${this.config.enabledComponents["disease-panel-browser-grid"] ? html`
                    <div class="content mt-3" id="disease-panel-browser-grid">
                        <disease-panel-browser-grid-test
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}">
                        </disease-panel-browser-grid-test>
                    </div>
                ` : nothing}


                ${this.config.enabledComponents["opencga-update"] ? html`
                    <div class="content mt-3" id="opencga-update">
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

                ${this.config.enabledComponents["variant-browser-grid"] ? html`
                    <div class="content mt-3" id="variant-grid">
                        <variant-browser-grid-test
                            testVariantFile="variant-browser-data"
                            testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config}">
                        </variant-browser-grid-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["variant-interpreter-rd-grid"] ? html`
                    <div style="padding:2%" class="content" id="variant-interpreter-rd-grid">
                        <variant-interpreter-rd-grid-test
                            .testDataVersion="${this.testDataVersion}"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config}">
                        </variant-interpreter-rd-grid-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["variant-interpreter-grid-germline"] ? html`
                    <div class="content mt-3" id="variant-interpreter-grid">
                        <variant-interpreter-grid-test
                            testVariantFile="variant-interpreter-germline"
                            testDataVersion="${this.testDataVersion}"
                            testClinicalData="clinical-analysis-CA-11-platinum"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config}">
                        </variant-interpreter-grid-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["variant-interpreter-grid-cancer"] ? html`
                    <div class="content mt-3" id="variant-interpreter-grid">
                        <variant-interpreter-grid-test
                            testVariantFile="variant-interpreter-cancer"
                            testDataVersion="${this.testDataVersion}"
                            testClinicalData="clinical-analysis-AN-1-test38"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config}">
                        </variant-interpreter-grid-test>
                    </div>
                ` : null}


                ${this.config.enabledComponents["variant-interpreter-grid-cancer-cnv"] ? html`
                <div class="content mt-3" id="variant-interpreter-grid">
                    <variant-interpreter-grid-test
                        testVariantFile="variant-interpreter-cnv"
                        testDataVersion="${this.testDataVersion}"
                        testClinicalData="clinical-analysis-AN-1-test38"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${this.config}">
                    </variant-interpreter-grid-test>
                </div>
            ` : null}

                ${this.config.enabledComponents["variant-filters"] ? html`
                    <div class="content mt-3" id="variant-filters">
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
                    <div class="content mt-3" id="genome-browser">
                        <genome-browser-test
                            .opencgaSession="${this.opencgaSession}"
                            .testDataVersion="${this.testDataVersion}">
                        </genome-browser-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["protein-lollipop"] ? html`
                    <div class="content mt-3" id="protein-lollipop">
                        <protein-lollipop-test
                            .opencgaSession="${this.opencgaSession}"
                            .testDataVersion="${this.testDataVersion}">
                        </protein-lollipop-test>
                    </div>
                ` : null}

                ${this.config.enabledComponents["pedigree"] ? html`
                    <div class="content" id="pedigree">
                        Not available yet...
                    </div>
                ` : null}

                ${this.config.enabledComponents["mutational-signatures"] ? html`
                    <div class="content mt-3" id="mutational-signatures">
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
