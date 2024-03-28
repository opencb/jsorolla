/*
 * Copyright 2015-2016 OpenCB
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

export default class DropdownMenu extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            config: {
                type: Object
            }
        };
    }

    renderDropdownSection(section) {
        return html`
            ${this.config.display?.separator && this.config.sections[0].title !== section.title ? html`
                <li><hr class="dropdown-divider"></li>
            ` : null
            }
            ${section.title ? html`
                <li class="dropdown-header">${section.title}</li>
            ` : null
            }
            ${section.elements.map(element => this.renderDropdownElement(element))}
        `;
    }

    renderDropdownElement(element) {
        return html`
            ${element.link ? html`
                <li>
                    <a href="${element.link}" target="_blank" class="dropdown-item text-start" data-action="${element.id}"
                        ?disabled=${!!element?.disabled}>
                        <i class="${element.icon ?? ""} pe-1" aria-hidden="true"></i> ${element.title}
                    </a>
                </li>
            ` : html`
                <li>
                    <a href="javascript: void 0" class="dropdown-item text-start" data-action="${element.id}"
                        ?disabled=${!!element?.disabled}>
                        <i class="${element.icon ?? ""} pe-1" aria-hidden="true"></i> ${element.title}
                    </a>
                </li>
            `}
        `;
    }

    render() {
        if (this.config?.sections?.length === 0) {
            return html`No sections have been configured.`;
        }

        return html`
            <div class="dropdown">
                <button type="button" data-bs-toggle="dropdown" class="btn ${this.config.display?.className ? this.config.display.className : "btn-light btn-sm"} dropdown-toggle one-line">
                    ${this.config.icon ? html`
                        <i class="${this.config.icon ?? ""} pe-1" aria-hidden="true"></i>
                    ` : null
                    }
                    ${this.config.title}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${this.config.sections
                        .filter(section => section.elements?.length > 0)
                        .map(section => this.renderDropdownSection(section))
                    }
                </ul>
            </div>
        `;
    }

    exampleConfig() {
        return {
            title: "Actions",
            icon: "fas fa-edit",
            display: {
                separator: true
            },
            sections: [
                {
                    title: "",
                    elements: [
                        {
                            id: "edit",
                            title: "Edit ...",
                            icon: "fas fa-edit"
                        }
                    ]
                },
                {
                    title: "Genome Browser",
                    elements: [
                        {
                            id: "ensembl",
                            title: "Ensembl Genome Browser",
                            icon: "fas fa-external-link-alt",
                            link: `https://www.google.com`
                        },
                        {
                            id: "ucsc",
                            title: "UCSC Genome Browser",
                            icon: "fas fa-external-link-alt",
                            link: `https://www.google.com`
                        }
                    ]
                },
                {
                    title: "Fetch Variant",
                    elements: [
                        {
                            id: "copy-json",
                            title: "Copy JSON",
                            icon: "fas fa-copy",
                        },
                        {
                            id: "download-json",
                            title: "Download JSON",
                            icon: "fas fa-download",
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("dropdown-menu", DropdownMenu);
