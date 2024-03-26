/*
 * Copyright 2015-2024 OpenCB
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

window.IVA_EXTENSIONS.push({
    id: "opencb",
    name: "OpenCB",
    description: "",
    commercial: false,
    license: "",
    extensions: [
        {
            id: "custom-tool",
            name: "Custom Tool",
            description: "Example Tool extension",
            type: "tool",
            components: [],
            maintainer: "",
            version: "",
            compatibleWith: "",
            render: params => params.html`
                <div>
                    <h1>Hello ${params.opencgaSession.user.name}</h1>
                </div>
            `,
        },
        {
            id: "variant-columns",
            name: "Variant Columns",
            description: "Example columns for Variant Browser",
            type: "column",
            components: [
                "variant-browser-grid",
                "variant-interpreter-rd-grid",
                "variant-interpreter-cancer-snv-grid",
                "variant-interpreter-cancer-cnv-grid",
                "variant-interpreter-rearrangement-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                [
                    {
                        position: -2,
                        config: {
                            id: "new-column-1",
                            title: "Extra column",
                            field: "",
                            rowspan: 2,
                            colspan: 1,
                            align: "center",
                            formatter: (value, row, index) => `Row ${index}`,
                        },
                    },
                ],
            ],
        },
        {
            id: "variant-detail",
            name: "New Variant Tab",
            description: "Example detail_tab extension for Variant Browser",
            type: "detail_tab",
            components: [
                "variant-browser-detail",
                "variant-interpreter-rd-detail",
                "variant-interpreter-cancer-snv-detail",
                "variant-interpreter-cancer-cnv-detail",
                "variant-interpreter-rearrangement-detail",
            ],
            compatibleWith: "",
            render: params => params.html`
                <div>Content of the new detail tab for <b>Variant Browser</b></div>
            `,
        },
        {
            id: "catalog-columns",
            name: "Catalog Columns",
            description: "Example columns for Catalog Grids",
            type: "column",
            components: [
                "clinical-analysis-grid",
                "cohort-grid",
                "family-grid",
                "file-grid",
                "individual-grid",
                "job-grid",
                "sample-grid",
                "disease-panel-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                {
                    // position: 0,
                    config: {
                        id: "new-column-1",
                        title: "Extra column",
                        field: "",
                        align: "center",
                        formatter: (value, row, index) => `Row ${index}`,
                    },
                },
            ],
        },
        {
            id: "catalog-detail",
            name: "New Catalog Tab",
            description: "Example detail tab for Catalog Details",
            type: "detail_tab",
            components: [
                "clinical-analysis-detail",
                "cohort-detail",
                "disease-panel-detail",
                "family-detail",
                "file-detail",
                "individual-detail",
                "job-detail",
                "sample-detail",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            render: params => {
                return params.html`
                    <div>Hello world</div>
                `;
            },
        },
    ],
});
