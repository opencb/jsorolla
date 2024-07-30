
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

const CELLBASE_CONFIG = {
    host: "https://ws.zettagenomics.com/cellbase",
    version: "v5.1",
};

const hosts = [
    {
        id: "test",
        url: "https://ws.opencb.org/opencga-test"
    }
];

const opencga = {
    host: hosts[0].url,
    version: "v2",
    cookie: {
        prefix: "iva-test-" + hosts[0].id
    }
};

const SUITE = {
    id: "suite",
    name: "OpenCB Suite",
    version: "",
    logo: "img/iva-white.svg",
    companyLogo: "",
    logoAlt: "img/iva.svg",
    footerLogo: "img/opencb-logo.png",
    mode: "development",
    appConfig: "opencb",
    about: {
        dropdown: true,
        links: [
            {id: "code", name: "Source code", url: "https://github.com/opencb/iva", icon: "fa fa-code"},
            {id: "documentation", name: "Documentation", url: "http://docs.opencb.org/display/iva", icon: "fa fa-book"},
            {id: "tutorial", name: "Tutorial", url: "http://docs.opencb.org/display/iva/Tutorials", icon: "fa fa-question-circle"},
            {id: "releases", name: "Releases", url: "https://github.com/opencb/iva/releases", icon: "fa fa-archive"},
            {id: "about", name: "About", url: "#about", icon: "fa fa-info-circle"},
            {id: "terms", name: "Terms", url: "#terms", icon: "fa fa-file-alt"},
            {id: "contact", name: "Contact", url: "#contact", icon: "fa fa-envelope"},
            {id: "faq", name: "FAQ", url: "#faq", icon: "fa fa-question"},
            {id: "rest-api", name: "OpenCGA REST API", icon: "fas fa-book-open"},
            {id: "getting-started", name: "Getting Started", tab: false, url: "#getting-started", icon: "fa fa-book"}
        ]
    },
    aboutPage: {
        display: {
            showTitle: true,
            titleStyle: "",
            titleClass: "",
            tableStyle: "",
        },
        favicon: "img/zetta-favicon.png",
        linkTitle: "About link title",
        title: "Custom page title",
        content: session => `
                    Session version: ${session?.about?.Version}
                `,
    },
    userMenu: [
        {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
        // {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
        {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
        // {id: "settings", name: "Settings", url: "#settings", icon: "fas fa-cogs"}
    ],
    login: {
        visible: true
    },
    notifyEventMessage: "notifymessage",
    session: {
        checkTime: 60000, // 1 min
        minRemainingTime: 60000,
        maxRemainingTime: 600000 // 10 min
    },
    welcomePage: {
        display: {
            titleStyle: "text-align:center"
        },
        title: "OpenCGA Suite",
        logo: "",
        content: `
        <div style="margin: 20px">
            <p class="text-center">
                Welcome to the OpenCB Suite for whole genome variant analysis.<br />
                This interactive tool allows finding genes affected by deleterious variants<br />that segregate along family
                pedigrees, case-controls or sporadic samples.
            </p>
            <br>
        </div>`,
    },

    // The order, title and nested submenus are respected
    apps: [
        {
            id: "test-app",
            name: "Test App",
            // logo: "img/iva-white.svg",
            // icon: "img/tools/icons/variant_browser.svg",
            visibility: "public",
            welcomePage: {
                display: {
                    titleStyle: "text-align:center;",
                    subtitleStyle: "text-align:center;"
                },
                title: "Test App",
                subtitle: "JSorolla Test App",
                // logo: "./img/iva.svg",
                content: `
                    <p class="text-center">
                        Welcome to the Test App<br>
                        This interactive tool allows to develop and execute automatic tests.
                    </p>
                `,
                links: [
                    {title: "Documentation", url: "http://docs.opencb.org/display/iva"},
                ]
            },
            menu: [
                {
                    id: "jsorolla",
                    name: "Jsorolla Components",
                    icon: "img/tools/icons/variant_browser.svg",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore all variants identified by the current study.</p>
                        <ul>
                            <li>Rich annotation and links to leading reference databases</li>
                            <li>Filter by gene, consequence, frequency and much more</li>
                        </ul>
                    `,
                    submenu: [
                        {
                            id: "data-form",
                            name: "data-form Test",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "data-form-table",
                            name: "data-form Table Test",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "utils-new",
                            name: "utils-new Test",
                            description: "",
                            visibility: "public"
                        },
                    ]
                },
                {
                    id: "iva",
                    name: "IVA Components",
                    icon: "img/tools/icons/variant_browser.svg",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore all variants identified by the current study.</p>
                        <ul>
                            <li>Rich annotation and links to leading reference databases</li>
                            <li>Filter by gene, consequence, frequency and much more</li>
                        </ul>
                    `,
                    submenu: [
                        {
                            name: "Catalog",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "catalog-filters",
                            name: "Catalog Filters",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "sample-browser-grid",
                            name: "Sample browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "individual-browser-grid",
                            name: "Individual browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "family-browser-grid",
                            name: "Family browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "cohort-browser-grid",
                            name: "Cohort browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "file-browser-grid",
                            name: "File browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "job-browser-grid",
                            name: "Job browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "disease-panel-browser-grid",
                            name: "Disease Panel browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "opencga-update",
                            name: "opencga-update Test",
                            description: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Variant Browser",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "variant-browser-grid",
                            name: "Variant Browser Grid",
                            description: "",
                            visibility: "public"
                        },
                        // {
                        //     id: "variant-filters",
                        //     name: "Variant Filters",
                        //     description: "",
                        //     visibility: "public"
                        // },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Variant Interpreter",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "variant-interpreter-grid-germline",
                            name: "Variant Grid Germline",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "variant-interpreter-grid-cancer",
                            name: "Variant Grid Cancer",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "variant-interpreter-grid-cancer-cnv",
                            name: "Variant Grid Cancer CNV (WIP)",
                            description: "",
                            visibility: "public"
                        }
                    ]
                },
                {
                    id: "visualization",
                    name: "Visualization Apps",
                    icon: "img/tools/icons/variant_browser.svg",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore all variants identified by the current study.</p>
                        <ul>
                            <li>Rich annotation and links to leading reference databases</li>
                            <li>Filter by gene, consequence, frequency and much more</li>
                        </ul>
                    `,
                    submenu: [
                        {
                            id: "genome-browser",
                            name: "Genome Browser Test",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "protein-lollipop",
                            name: "Protein Lollipop Test",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "pedigree",
                            name: "Pedigree Test",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "mutational-signatures",
                            name: "Mutational Signatures Test",
                            description: "",
                            visibility: "public"
                        },
                    ]
                }
            ],
            fileExplorer: {
                visibility: "private"
            },
            jobMonitor: {
                visibility: "private"
            },
            // TODO This option seems to be deprecated, do we need to keep it?
            search: {
                placeholder: "Search",
                visible: false
            },
            about: {
                dropdown: true,
                links: [
                    {id: "code", name: "Source code", url: "https://github.com/opencb/iva", icon: "fa fa-code"},
                    {id: "documentation", name: "Documentation", url: "http://docs.opencb.org/display/iva", icon: "fa fa-book"},
                    {id: "tutorial", name: "Tutorial", url: "http://docs.opencb.org/display/iva/Tutorials", icon: "fa fa-question-circle"},
                    {id: "rest-api", name: "OpenCGA REST API", icon: "fas fa-book-open"},
                    {id: "faq", name: "FAQ", icon: "fa fa-question"},
                ]
            },
            userMenu: [
                {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
                // {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
                {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
                // {id: "settings", name: "Settings", url: "#settings", icon: "fas fa-cogs"}
            ]
        },
    ]
};

