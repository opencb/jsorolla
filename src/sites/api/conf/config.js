
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


const cellbase = {
    host: "https://ws.opencb.org/cellbase-4.8.2",
    version: "v4"
};

const hosts = [
    {
        id: "prod",
        url: "https://ws.opencb.org/opencga-prod"
    },
    {
        id: "test",
        url: "https://ws.opencb.org/opencga-test"
    },
    {
        id: "eglh",
        url: "https://eglh.app.zettagenomics.com/opencga"
    },
    {
        id: "eglh-uat",
        url: "https://uat.eglh.app.zettagenomics.com/opencga"
    },
];

const opencga = {
    host: hosts[1].url,
    version: "v2",
    cookie: {
        prefix: "iva-" + hosts[1].id
    }
};

const CATALOG_NAVBAR_MENU = {
    id: "catalog",
    name: "Catalog",
    visibility: "public",
    icon: "img/tools/icons/aggregation2.svg",
    submenu: [
        {
            id: "projects",
            name: "Projects",
            visibility: "public"
        },
        {
            separator: true
        },
        {
            name: "Browsers",
            category: true,
            id: "cat-catalog",
            visibility: "public"
        },
        {
            id: "file",
            name: "File Browser",
            visibility: "public"
        },
        {
            id: "sample",
            name: "Sample Browser",
            visibility: "public",
            icon: "img/tools/icons/interpretation_portal.svg",
            description: "Explore all samples in Catalog",
            featured: true,
        },
        {
            id: "individual",
            name: "Individual Browser",
            visibility: "public"
        },
        {
            id: "family",
            name: "Family Browser",
            visibility: "public"
        },
        {
            id: "cohort",
            name: "Cohort Browser",
            visibility: "public"
        },
        {
            id: "clinicalAnalysis",
            name: "Clinical Analysis Browser",
            visibility: "public"
        },
    ]
};

const SUITE = {
    id: "suite",
    name: "OpenCB Suite",
    version: "v2.2.0-dev",
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
        ]
    },
    userMenu: [
        {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
        {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
        {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
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
            id: "Api",
            name: "API",
            // logo: "img/iva-white.svg",
            icon: "fas fa-cog",
            visibility: "public",
            welcomePage: {
                display: {
                    titleStyle: "text-align:center;",
                    subtitleStyle: "text-align:center;"
                },
                title: "Documentation APIs",
                subtitle: "Interative documentation api",
                // logo: "./img/iva.svg",
                content: `
                    <p class="text-center">
                        Welcome to the interative documentation api.<br>
                    </p>
                `,
                // links: [
                //     {title: "Enter", url: "http://docs.opencb.org/display/iva"},
                // ]
            },
            menu: [{
                id: "rest-api",
                name: "Opencga Api",
                // fa_icon: "fa fa-list",
                icon: "fas fa-book-open",
                // icon: "img/tools/icons/variant_browser.svg",
                visibility: "public",
                featured: true,
                description: `
                            <p> This interactive tool allows explore all services from opencga.</p>
                            `,
            }],
            about: {
                dropdown: true,
                links: [
                    {id: "code", name: "Source code", url: "https://github.com/opencb/iva", icon: "fa fa-code"},
                    {id: "documentation", name: "Documentation", url: "http://docs.opencb.org/display/iva", icon: "fa fa-book"},
                    {id: "tutorial", name: "Tutorial", url: "http://docs.opencb.org/display/iva/Tutorials", icon: "fa fa-question-circle"},
                    {id: "faq", name: "FAQ", icon: "fa fa-question"}
                ]
            },
            userMenu: [
                {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
                {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
                {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
            ]
        }
    ]
};

