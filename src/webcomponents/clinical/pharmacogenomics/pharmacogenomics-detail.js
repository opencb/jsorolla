import {LitElement, html} from "lit";
import "../../commons/view/detail-tabs.js";
import "../../commons/json-viewer.js";

export default class PharmacogenomicsDetail extends LitElement {

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
            variant: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    render() {
        return html`
            <detail-tabs
                .data="${this.variant}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Selected Variant: ",
            showTitle: true,
            items: [
                {
                    id: "overview",
                    name: "Overview",
                    active: true,
                    render: variant => {
                        const drugsRows = variant.annotation.pharmacogenomics.map(item => {
                            return item.annotations.map(annotation => {
                                const allelesContent = annotation.alleles.map(allele => html`
                                    <div style="">
                                        <div style="font-weight:bold;">Allele: ${allele.allele}</div>
                                        <div>${allele.annotation || "-"}</div>
                                    </div>
                                `);
                                return html`
                                    <tr>
                                        <td>
                                            <div style="font-weight:bold;">${item.name}</div>
                                            <div style="font-size:12px;color:#737373;width:120px;">
                                                ${(annotation.phenotypes || []).join(", ")}
                                            </div>
                                        </td>
                                        <td>${annotation.phenotypeType || "-"}</td>
                                        <td>${annotation.geneName || "-"}</td>
                                        <td>
                                            <div style="display:flex;flex-direction:column;gap:8px;">
                                                ${allelesContent || "-"}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            });
                        });
                        return html`
                            <table class="table table-hover table-no-bordered">
                                <thead>
                                    <tr>
                                        <th style="padding:8px;">Drug</th>
                                        <th style="padding:8px;">Phenotype Type</th>
                                        <th style="padding:8px;">Gene</th>
                                        <th style="padding:8px;">Annotation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${drugsRows.flat()}
                                </tbody>
                            </table>
                        `;
                    },
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (variant, active) => html`
                        <json-viewer
                            .data="${variant?.annotation?.pharmacogenomics || {}}"
                            .active="${active}">
                        </json-viewer>
                    `,
                }
            ]
        };
    }

}

customElements.define("pharmacogenomics-detail", PharmacogenomicsDetail);
