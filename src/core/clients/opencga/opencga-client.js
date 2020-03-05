/*
 * Copyright 2016 OpenCB
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

import {RestResponse} from "../RestResponse.js";
import UtilsNew from "../../utilsNew.js";
import Admin from "./api/Admin.js";
import Alignment from "./api/Alignment.js";
import Clinical from "./api/Clinical.js";
import Cohort from "./api/Cohort.js";
import DiseasePanel from "./api/DiseasePanel.js";
import Family from "./api/Family.js";
import File from "./api/File.js";
import GA4GH from "./api/GA4GH.js";
import Individual from "./api/Individual.js";
import Job from "./api/Job.js";
import Meta from "./api/Meta.js";
import Project from "./api/Project.js";
import Sample from "./api/Sample.js";
import Study from "./api/Study.js";
import User from "./api/User.js";
import Variant from "./api/Variant.js";
import VariantOperation from "./api/VariantOperation.js";


export class OpenCGAClient {

    constructor(config) {
        // this._config = config;
        this.setConfig(config);
    }

    getDefaultConfig() {
        return {
            host: "",
            version: "",
            userId: "",
            token: "",
            query: {
                batchSize: "",
                limit: 10
            },
            cookies: {
                active: true,
                prefix: ""
                // expirationTime: ""
            }
        };
    }

    // TODO check OpeCGA URL and other variables.
    check() {}

    /*
     * Client singleton functions
     */
    users() {
        if (!this.clients.has("users")) {
            this.clients.set("users", new User(this._config));
        }
        return this.clients.get("users");
    }

    projects() {
        if (!this.clients.has("projects")) {
            this.clients.set("projects", new Project(this._config));
        }
        return this.clients.get("projects");
    }

    studies() {
        if (!this.clients.has("studies")) {
            this.clients.set("studies", new Study(this._config));
        }
        return this.clients.get("studies");
    }

    files() {
        if (!this.clients.has("files")) {
            this.clients.set("files", new File(this._config));
        }
        return this.clients.get("files");
    }

    jobs() {
        if (!this.clients.has("jobs")) {
            this.clients.set("jobs", new Job(this._config));
        }
        return this.clients.get("jobs");
    }

    samples() {
        if (!this.clients.has("samples")) {
            this.clients.set("samples", new Sample(this._config));
        }
        return this.clients.get("samples");
    }

    cohorts() {
        if (!this.clients.has("cohorts")) {
            this.clients.set("cohorts", new Cohort(this._config));
        }
        return this.clients.get("cohorts");
    }

    individuals() {
        if (!this.clients.has("individuals")) {
            this.clients.set("individuals", new Individual(this._config));
        }
        return this.clients.get("individuals");
    }

    families() {
        if (!this.clients.has("families")) {
            this.clients.set("families", new Family(this._config));
        }
        return this.clients.get("families");
    }

    panels() {
        if (!this.clients.has("panels")) {
            this.clients.set("panels", new DiseasePanel(this._config));
        }
        return this.clients.get("panels");
    }

    meta() {
        if (!this.clients.has("meta")) {
            this.clients.set("meta", new Meta(this._config));
        }
        return this.clients.get("meta");
    }

    admin() {
        if (!this.clients.has("admin")) {
            this.clients.set("admin", new Admin(this._config));
        }
        return this.clients.get("admin");
    }

    // Analysis
    alignments() {
        if (!this.clients.has("alignments")) {
            this.clients.set("alignments", new Alignment(this._config));
        }
        return this.clients.get("alignments");
    }

    variants() {
        if (!this.clients.has("variants")) {
            this.clients.set("variants", new Variant(this._config));
        }
        return this.clients.get("variants");
    }

    clinical() {
        if (!this.clients.has("clinical")) {
            this.clients.set("clinical", new Clinical(this._config));
        }
        return this.clients.get("clinical");
    }

    variantOperations() {
        if (!this.clients.has("variantOperations")) {
            this.clients.set("variantOperations", new VariantOperation(this._config));
        }
        return this.clients.get("variantOperations");
    }

    ga4gh() {
        if (!this.clients.has("ga4gh")) {
            this.clients.set("ga4gh", new GA4GH(this._config));
        }
        return this.clients.get("ga4gh");
    }

    async login(userId, password) {
        try {
            const response = await this.users().login(userId, {password: password});
            const restResponse = new RestResponse(response);

            // TODO search for Errors in restResponse.events
            this._config.userId = userId;
            this._config.token = restResponse.getResult(0).token;

            // Check if cookies being used
            if (this._config.cookies.active) {
                this.setCookies(userId, this._config.token);
            }
            this.clients.forEach(client => client.setToken(this._config.token));
            return restResponse;
        } catch (e) {
            console.error(e);
        }
    }

    setCookies(userId, token) {
        if (userId && token) {
            Cookies.set(this._config.cookies.prefix + "_userId", userId);
            Cookies.set(this._config.cookies.prefix + "_sid", this._config.token);
        } else {
            Cookies.expire(this._config.cookies.prefix + "_userId");
            Cookies.expire(this._config.cookies.prefix + "_sid");
        }
    }

    // refresh only works if cookies are enabled
    async refresh() {
        const userId = this._config.userId;
        const response = await this.users().login(userId);
        const restResponse = new RestResponse(response);
        this._config.token = restResponse.getResult(0).token;
        if (this._config.cookies.active) {
            this.setCookies(userId, this._config.token);
        }
        this.clients.forEach(client => client.setToken(this._config.token));
        return restResponse;
    }

    logout() {
        this._config.userId = null;
        this._config.token = null;

        // Remove cookies
        if (this._config.cookies.active) {
            this.setCookies();
        }
        return Promise.resolve();
    }

    /**
     * Creates and return an anonymous session object, it is a sync function.
     */
    createAnonymousSession() {
        const opencgaSession = {};
        opencgaSession.user = {
            id: "anonymous", projects: []
        };
        opencgaSession.token = "";
        opencgaSession.date = new Date().toISOString();
        opencgaSession.server = {
            host: this._config.host,
            version: this._config.version
        };
        opencgaSession.opencgaClient = this;

        return opencgaSession;
    }

    /**
     * Creates an authenticated session for the user and token of the current OpenCGAClient. The token is taken from the
     * opencgaClient object itself.
     * @returns {Promise<any>}
     */
    // TODO refactor
    createSession() {
        const _this = this;
        return new Promise(function(resolve, reject) {
            // check that a session exists
            // TODO should we check the session has not expired?
            console.log("_this._config",_this._config) // ------------ TODO refreshing a page userId is empty
            if (UtilsNew.isNotUndefined(_this._config.token)) {

                _this.users().info(_this._config.userId)
                    .then(function(response) {
                        const session = {};
                        console.log("response", response);

                        session.user = response.response[0].result[0];
                        session.token = _this._config.token;
                        session.date = new Date().toISOString();
                        session.server = {
                            host: _this._config.host,
                            version: _this._config.version,
                            serverVersion: _this._config.serverVersion
                        };
                        session.opencgaClient = _this;

                        // Fetch authorised Projects and Studies
                        _this.projects().search({})
                            .then(function(response) {
                                console.log("response", response);
                                const res = new RestResponse(response);
                                session.projects = response.response[0].result;
                                if (UtilsNew.isNotEmptyArray(session.projects) && UtilsNew.isNotEmptyArray(session.projects[0].studies)) {
                                    const studies = [];
                                    // FIXME This is needed to keep backward compatibility with OpenCGA 1.3.x
                                    for (const project of session.projects) {
                                        project.alias = project.alias || project.fqn || null;
                                        if (project.studies !== undefined) {
                                            for (const study of project.studies) {
                                                // If study.alias does not exist we are NOT in version 1.3, we set fqn from 1.4
                                                if (study.alias === undefined || study.alias === "") {
                                                    if (study.fqn.includes(":")) {
                                                        study.alias = study.fqn.split(":")[1];
                                                    } else {
                                                        study.alias = study.fqn;
                                                    }
                                                }
                                                // Keep track of the studies to fetch Disease Panels
                                                studies.push(project.id + ":" + study.id);
                                            }
                                        }
                                    }

                                    // this sets the current active project and study
                                    session.project = session.projects[0];
                                    session.study = session.projects[0].studies[0];

                                    // Fetch the Disease Panels for each Study
                                    const panelPromises = [];
                                    for (const study of studies) {
                                        const promise = _this.panels().search({
                                            study: study,
                                            include: "id,name,stats,source,genes.id,genes.name,regions.id"
                                        }).then(function(response) {
                                            return new RestResponse(response).getResult(0);
                                        });
                                        panelPromises.push(promise);
                                    }

                                    Promise.all(panelPromises)
                                        .then(function(values) {
                                            const studiesMap = {};
                                            for (let i = 0; i < studies.length; i++) {
                                                studiesMap[studies[i]] = values[i];
                                            }
                                            // This set the panels in the object reference of the session object
                                            for (const project of session.projects) {
                                                for (const study of project.studies) {
                                                    study.panels = studiesMap[project.id + ":" + study.id];
                                                }
                                            }
                                        });
                                }
                                resolve(session);
                            })
                            .catch(function(response) {
                                reject({message: "An error when getting projects", value: response});
                            });
                    })
                    .catch(function(response) {
                        reject({message: "An error when getting projects", value: response});
                    });
            } else {
                reject({message: "No valid token", value: _this._config.token});
            }
        });
    }

    getConfig() {
        return this._config;
    }

    setConfig(config) {
        this._config = {...this.getDefaultConfig(), ...config};
        this.clients = new Map();
    }

    getClients() {
        return this.clients;
    }

}
// TODO OpenCGAClient maybe should be a singleton exported module..
// Object.freeze(OpenCGAClient);
