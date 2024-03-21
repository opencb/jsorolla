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

import Admin from "./api-mock/Admin";
import Alignment from "./api-mock/Alignment.js";
import ClinicalAnalysis from "./api-mock/ClinicalAnalysis.js";
import Cohort from "./api-mock/Cohort.js";
import DiseasePanel from "./api-mock/DiseasePanel.js";
import Family from "./api-mock/Family.js";
import File from "./api-mock/File.js";
import GA4GH from "./api-mock/GA4GH.js";
import Individual from "./api-mock/Individual.js";
import Job from "./api-mock/Job.js";
import Meta from "./api-mock/Meta.js";
import Organization from "./api-mock/Organization.js";
import Project from "./api-mock/Project.js";
import Sample from "./api-mock/Sample.js";
import Study from "./api-mock/Study.js";
import User from "./api-mock/User.js";
import Variant from "./api-mock/Variant.js";
import VariantOperation from "./api-mock/VariantOperation.js";


export class OpenCGAClientMock {

    constructor(config) {
        this.setConfig(config);
        this.check();
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

    async check() {
        const globalEvent = (type, value) => {
            globalThis.dispatchEvent(
                new CustomEvent(type, {
                    detail: value
                }));
        };
        try {
            this.about = await this.meta().about();
            if (this.about.getResult(0)) {
                globalEvent("hostInit", {host: "opencga", value: "v" + this.about.getResult(0)["Version"]});
            } else {
                globalEvent("signingInError", {value: "Opencga host not available."});
                globalEvent("hostInit", {host: "opencga", value: "NOT AVAILABLE"});
            }
        } catch (e) {
            console.error(e);
            globalEvent("signingInError", {value: "Opencga host not available."});
            globalEvent("hostInit", {host: "opencga", value: "NOT AVAILABLE"});
        }
    }

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
            this.clients.set("clinical", new ClinicalAnalysis(this._config));
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

    organization() {
        if (!this.clients.has("organization")) {
            this.clients.set("organization", new Organization(this._config));
        }
        return this.clients.get("organizaton");
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

    getUserConfigs() {
        return this.users().configs(this._config.userId, "IVA");
    }

    // Nacho (22/10/2023): This method needs a config ID and VALUE now,
    // different sites or apps may need to store configurations.
    updateUserConfig(id, newConfig) {
        return this.users()
            .updateConfigs(this._config.userId, {
                id: id,
                configuration: {
                    ...newConfig
                }
            });
    }

}
