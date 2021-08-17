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

export default class OpencgaBreadcrumb extends LitElement {

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

    _init() {
        this._prefix = "bc-";
    }

    render() {
        let breadcrumHtml, projectAndStudy;
        if (this.opencgaSession.project && this.opencgaSession.project.id) {
            let studyId = this.opencgaSession.study ? this.opencgaSession.study.id : "null";
            projectAndStudy = this.opencgaSession.project.id + "/" + studyId;
            breadcrumHtml = html`
                                <li>
                                    ${this.opencgaSession.project.id}
                                </li>
                                <li class="active">
                                    ${studyId}
                                </li>`;
        } else {
            projectAndStudy = "null";
            breadcrumHtml = html`
                                <li class="active">
                                    null
                                </li>`;
        }

        return html`
            <style>
                .breadcrumb{
                    padding-left: 40px;
                    margin-bottom: 10px;
                }
            </style>
            <div>
                <ol class="breadcrumb">
                    <li>
                        <a href="#projects/${projectAndStudy}" data-category="${this.config.breadcrumb.title}">${this.config.breadcrumb.title}</a></li>
                    </li>
                    ${breadcrumHtml}
                </ol>
            </div>
        `;
    }

}

customElements.define("opencga-breadcrumb", OpencgaBreadcrumb);
