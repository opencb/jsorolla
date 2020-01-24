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
import "./annotation/cellbase-variantannotation-view.js";
import "./opencga-variant-file-metrics.js";
import "./opencga-interpretation-variant-review.js";
import "./variant-beacon-network.js";

export default class OpencgaVariantInterpretationDetail extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            variant: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "oivd" + Utils.randomString(6);

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
        this.detailActiveTabs = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("variant") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        if (UtilsNew.isNotEmpty(this.variant)) {
            this._variantId = `${this.variant.chromosome}:${this.variant.start}:${this.variant.reference}:${this.variant.alternate}`;
        }
    }

    checkVariant(variant) {
        if (UtilsNew.isNotUndefinedOrNull(variant)) {
            return variant.id.startsWith("rs") || variant.id.split(":").length > 2;
        } else {
            return false;
        }
    }

    _changeBottomTab(e) {
        const _activeTabs = {};
        for (const detail of this.config) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
    }

    getDefaultConfig() {
        return {

        };
    }

    render() {
        return html`
        <style include="jso-styles"></style>

        ${this.checkVariant(this.variant) ? html`
        <div style="padding-top: 20px">
            <h3>Variant: ${this.variant.id}</h3>

            <div style="padding-top: 20px">
                <!-- Dynamically create the Detail Tabs from Browser config -->
                <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                    
                    ${this.config && this.config.length ? this.config.map( item => html`
                        ${this.active ? html`
                            <li role="presentation" class="active">
                                <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}"
                                   class="browser-variant-tab-title" @click="${this._changeBottomTab}">${item.title}</a>
                            </li>
                        ` : html`
                            <li role="presentation" class="">
                                <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}"
                                   class="browser-variant-tab-title" @click="${this._changeBottomTab}">${item.title}</a>
                            </li>
                        `}
                    `) : null }
                    
                </ul>

<!--                style="height: 680px"-->
                <div class="tab-content">
<!--                    &lt;!&ndash; Annotation Tab &ndash;&gt;-->
<!--                    <div id="${this._prefix}variantReview" role="tabpanel" class="tab-pane">-->
<!--                        <div style="width: 75%;padding-top: 8px">-->
<!--                            <opencga-interpretation-variant-review opencga-session="{{opencgaSession}}"-->
<!--                                                                   variant="{{variant}}">-->
<!--                            </opencga-interpretation-variant-review>-->
<!--                        </div>-->
<!--                    </div>-->

                    <!-- Annotation Tab -->
                    <div id="${this._prefix}annotation" role="tabpanel" class="tab-pane active">
                        <div style="width: 75%;padding-top: 8px">
                            <cellbase-variantannotation-view .data="${this._variantId}"
                                                             .assembly="${this.opencgaSession.project.organism.assembly}"
                                                             _prefix="${this._prefix}"
                                                             .cellbaseClient="${this.cellbaseClient}"
                                                             mode="vertical"
                                                             .consequenceTypes="${this.consequenceTypes}"
                                                             .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                             style="font-size: 12px">
                            </cellbase-variantannotation-view>
                        </div>
                    </div>

                    <!-- Cohort Stats Tab -->
                    <div id="${this._prefix}fileMetrics" role="tabpanel" class="tab-pane">
                        <div style="width: 75%;padding-top: 8px">
                            <opencga-variant-file-metrics .opencgaSession="${this.opencgaSession}"
                                                          .variant="${this.variant}"
                                                          .clinicalAnalysis="${this.clinicalAnalysis}"
                            </opencga-variant-file-metrics>
                        </div>
                    </div>

                    <!-- Cohort Stats Tab -->
                    <div id="${this._prefix}cohortStats" role="tabpanel" class="tab-pane">
                        <div style="width: 75%;padding-top: 8px">
                            <opencga-variant-cohort-stats .opencgaSession="${this.opencgaSession}"
                                                          .variant="${this.variant.id}"
                                                          .active="${this.detailActiveTabs.cohortStats}">
                            </opencga-variant-cohort-stats>
                        </div>
                    </div>

                    <!-- Samples Tab -->
                    <div id="${this._prefix}samples" role="tabpanel" class="tab-pane">
                        <div style="width: 75%;padding-top: 8px">
                            <opencga-variant-samples .opencgaSession="${this.opencgaSession}"
                                                     .variant="${this.variant.id}"
                                                     .active="${this.detailActiveTabs.samples}">
                            </opencga-variant-samples>
                        </div>
                    </div>

                    <!-- Beacon Network Tab-->
                    <div id="${this._prefix}beacon" role="tabpanel" class="tab-pane">
                        <div style="width: 75%;padding-top: 8px">
                            <variant-beacon-network .variant="${this.variant.id}" .clear="${this.variant.id}" .config="${this.beaconConfig}">
                            </variant-beacon-network>
                        </div>
                    </div>

                    <!-- Example Template Tab-->
                    <div id="${this._prefix}template" role="tabpanel" class="tab-pane">
                        <div style="width: 75%;padding-top: 8px">
                            <opencga-variant-detail-template .opencgaSession="${this.opencgaSession}"
                                                             .variant="${this.variant.id}"
                                                             .active="${this.detailActiveTabs.template}">
                            </opencga-variant-detail-template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : null }
        
        `;
    }

}

customElements.define("opencga-variant-interpretation-detail", OpencgaVariantInterpretationDetail);
