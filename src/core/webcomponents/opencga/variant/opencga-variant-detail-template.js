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

import {LitElement, html} from "/web_modules/lit-element.js";

//TODO decomment at the end of the refactor (Polymer2 imports this as script and I cannot use it as module)
//import Region from './../../../region.js';

class OpencgaVariantDetailTemplate extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
            cellbaseClient: {
                type: Object
            },
            variant: {
                type: String
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    /**
     * Init the variables you need, keep in mind this is executed before the actual Polymer properties exist
     */
    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this.prefix = "ovdt" + Utils.randomString(6);

        this.active = false;
        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }

    updated(_changedProperties) {
        if (_changedProperties.has("opencgaSession") ||
            _changedProperties.has("variant") ||
            _changedProperties.has("active") ||
            _changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    propertyObserver(opencgaSession, variant, active, config) {
        this._config = Object.assign(this.getDefaultConfig(), config);
        this.fetchData();
    }

    fetchData() {
        // Make sure variant exists and that this plugin is active
        if (UtilsNew.isNotUndefinedOrNull(this.variant) && this.variant.split(":").length > 2 && this.active) {
            let [chromosome, start, ref, alt] = this.variant.split(":");
            this.region = new Region(chromosome + ":" + start);
            let params = {
                id: this.variant,
                studies: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
                includeStudy: "all",
                exclude: "annotation,studies.files,studies.samplesData",
                useSearchIndex: "no"
            };

            let _this = this;
            this.opencgaSession.opencgaClient.variants().query(params)
                .then(function(response) {
                    if (typeof response.response[0].result[0] !== "undefined") {
                        _this._variant = response.response[0].result[0];
                    }
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    getDefaultConfig() {
        return {
            property: "example property"
        };
    }

    render() {
        return html`
        <style include="jso-styles"></style>

        <div id="${this.prefix}}UniqueId" style="padding: 20px">
            <p>Put your HTML here. You can use opencgaSession, cellbaseClient, variant and _config objects</p>
            <p>Example:</p>
            <p>${this._variant.id}</p>
            <p>${this._config.property}</p>
        </div>
        `;
    }
};

customElements.define("opencga-variant-detail-template", OpencgaVariantDetailTemplate);
