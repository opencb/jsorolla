
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

const hosts = [
    {
        id: "prod",
        url: "https://ws.opencb.org/opencga-prod"
    },
    {
        id: "demo",
        url: "https://demo.app.zettagenomics.com/opencga"
    },
    {
        id: "reference",
        url: "https://test.app.zettagenomics.com/TASK-6445/opencga"
    },
];

const opencga = {
    host: hosts[2].url,
    version: "v2",
    // organizations: ["test", "test2"],
    cookie: {
        prefix: "iva-" + hosts[2].id,
        secure: true,
    },
    sso: {
        active: false,
        cookie: "JSESSIONID"
    },

    // This forces the following projects to be used instead of the user's project
    // projects: [
    //     {
    //         id: "platinum",
    //         name: "Platinum",
    //         alias: "platinum",
    //         organism: {
    //             scientificName: "Homo sapiens",
    //             assembly: "GRCh37"
    //         },
    //         studies : [
    //             {
    //                 id: "illumina_platinum",
    //                 name: "Illumina Platinum",
    //                 alias: "illumina_platinum"
    //             }
    //         ]
    //     }
    // ],

    // This allows IVA to query a OpenCGA instance being an 'anonymous' user, this means that no login is required.
    // If 'projects' is empty then all public projects and studies of 'user' will be used.
    // anonymous: {
    //     // user: "hgvauser",
    //     projects: [
    //         {
    //             id: "platinum",
    //             name: "Platinum",
    //             alias: "platinum",
    //             organism: {
    //                 scientificName: "Homo sapiens",
    //                 assembly: "GRCh37"
    //             },
    //             studies : [
    //                 {
    //                     id: "illumina_platinum",
    //                     name: "Illumina Platinum",
    //                     alias: "illumina_platinum"
    //                 }
    //             ]
    //         }
    //     ]
    // },
    // summary: true,
};

const SUITE = {
    id: "suite",
    name: "OpenCB Suite",
    version: "",
    logo: "img/iva-white.svg",
    companyLogo: "",
    logoAlt: "img/iva.svg",
    favicon: "img/zetta-favicon.png",
    // logoAltHeight: "",
    // footerLogo: "img/opencb-logo.png",
    mode: "development",
    appConfig: "opencb",
    about: {
        dropdown: true,
        links: [
            // {id: "code", name: "Source code", url: "https://github.com/opencb/iva", icon: "fa fa-code"},
            // {id: "documentation", name: "Documentation", url: "http://docs.opencb.org/display/iva", icon: "fa fa-book"},
            // {id: "tutorial", name: "Tutorial", url: "http://docs.opencb.org/display/iva/Tutorials", icon: "fa fa-question-circle"},
            // {id: "releases", name: "Releases", url: "https://github.com/opencb/iva/releases", icon: "fa fa-archive"},
            {id: "about", name: "About", url: "#about", icon: "fa fa-info-circle"},
            {id: "terms", name: "Terms", url: "#terms", icon: "fa fa-file-alt"},
            {id: "contact", name: "Contact", url: "#contact", icon: "fa fa-envelope"},
            {id: "faq", name: "FAQ", url: "#faq", icon: "fa fa-question"},
            // {id: "rest-api", name: "OpenCGA REST API", icon: "fas fa-book-open"},
            // {id: "getting-started", name: "Getting Started", tab: false, url: "#getting-started", icon: "fa fa-book"}
        ]
    },
    fileExplorer: {
        visibility: "private"
    },
    workflowManager: {
        visibility: "private"
    },
    customToolAnalysisExecutor: {
        visibility: "private"
    },
    jobMonitor: {
        visibility: "private"
    },
    restApi: {
        visibility: "private"
    },
    login: {
        visible: true
    },
    notifyEventMessage: "notifymessage",
    session: {
        checkTime: 60000, // 1 min
        minRemainingTime: 60000,
        maxRemainingTime: 600000 // 10 min
    },
    loginPage: {
        organisation: {
            logo: "img/opencb-logo.png",
            link: "https://github.com/opencb",
            title: "Unleash the power of genomic data",
            display: {
                logoHeight: "100px",
                logoClass: "mb-2",
                titleClass: "fs-3 opacity-25",
            }
        },
        login: {
            logo: "img/iva.svg",
            title: "Sign in",
            subtitle: "Welcome back!",
            display: {
                logoClass: "mb-4",
                logoHeight: "50px",
                titleClass: "fs-1 fw-medium mb-0",
                subtitleClass: "fs-5 fw-normal text-gray-800 mb-4",
            },
        }
    },
    welcomePage: {
        display: {
            logoClass: "mb-4",
            contentClass: "fs-3",
        },
        logo: "img/iva.svg",
        content: `
            Welcome to the OpenCB Suite for whole genome variant analysis.
            This interactive tool allows finding genes affected by deleterious variants that segregate along family pedigrees, case-controls or sporadic samples.
        `,
    },
    aboutPage: {
        display: {
            showTitle: true,
            titleStyle: "",
            titleClass: "",
        },
        favicon: "img/opencb-icon.png",
        linkTitle: "About OpenCB",
        title: "About OpenCB",
        content: "WIP",
    },
    userMenu: [
        {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
        // {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
        // {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
    ],
    footer: {
        // display: {
        //     contentClass: "",
        // },
        // content: "",
    },
    sidebar: {
        organisation: {
            logo: {
                img: "img/opencb-icon.png",
            },
            menu: [
                {id: "code", name: "Source code", icon: "fa-code", url: "https://github.com/opencb/jsorolla", tab: true},
                {id: "documentation", name: "Documentation", icon: "fa-book", url: "http://docs.opencb.org/display/iva", tab: true},
                {id: "tutorial", name: "Tutorial", icon: "fa-user-graduate", url: "http://docs.opencb.org/display/iva/Tutorials", tab: true},
                {id: "releases", name: "Releases", icon: "fa-rocket", url: "https://github.com/opencb/jsorolla/releases", tab: true},
                {id: "about", name: "About", icon: "fa-info-circle", url: "#about", tab: true},
            ],
        },
    },
    apps: [
        {
            id: "research",
            name: "Research", // Short name of the app. This is the name that will be displayed in the sidebar
            title: "Research Environment",
            description: "Explore variants in real-time and execute analysis and tools.",
            icon: "fa-flask",
            color: "#3789FB",
            logo: "img/tools/icons/variant_browser_white.svg",
            logoAlt: "img/tools/icons/variant_browser.svg",
            visibility: "public",
            welcomePage: {
                title: "Research Environment",
                subtitle: "Explore and understand the genetic diversity of a population.",
                // content: `
                //     Variant Research Environment App implements different tools to focus on the analysis and interpretation of genomic variants
                //     to understand their role in diseases, traits, and biological processes. It involves the use of our aggregated variant database,
                //     bioinformatics tools, workflows, notebooks, and computational methods to identify, classify, and study variants for personalized medicine and genetic research.
                // `,
            },
            menu: [
                {
                    id: "variant-browser",
                    name: "Variant Browser",
                    icon: "fa-dna",
                    visibility: "public",
                    description: "Explore our high-performance and scalable aggregated variant database in real-time.",
                },
                {
                    id: "analysis-tools",
                    name: "Analysis Tools",
                    icon: "fa-tools",
                    visibility: "public",
                    description: "Execute analysis tools using data of the current study.",
                },
                {
                    id: "workflow-manager",
                    name: "Workflow Manager",
                    icon: "fa-stream",
                    visibility: "public",
                    description: "Build, import and execute NextFlow workflows.",
                },
                {
                    id: "tool-analysis",
                    name: "Custom Tool",
                    icon: "fa-rocket",
                    visibility: "public",
                    description: "Execute your own custom tools easily in the cloud.",
                },
                {
                    id: "jupyter-lab",
                    name: "Jupyter Lab Notebooks",
                    icon: "fa-book",
                    visibility: "public",
                    description: "Create, share, and execute Jupyter Notebooks with Python.",
                },
                // {
                //     id: "my-analysis",
                //     name: "My Analysis",
                //     icon: "fa-cog",
                //     visibility: "public",
                //     description: "Explore and manage all your exceuted analysis.",
                // },
                {
                    id: "cohort-browser",
                    name: "Cohort Manager",
                    icon: "fa-search",
                    visibility: "public",
                    description: "Explore and manage all cohorts in the current study.",
                },
                {
                    id: "file-manager",
                    name: "File Manager",
                    icon: "fa-folder",
                    visibility: "public",
                    description: "Manage your data in the cloud.",
                },
            ],
        },
        {
            id: "clinical",
            name: "Clinical",
            title: "Clinical Analysis",
            description: "Create cases, execute clinical interpretations, and create clinical reports.",
            icon: "fa-stethoscope",
            color: "#FA8938",
            logo: "img/tools/icons/interpretation_portal_white.svg",
            logoAlt: "img/tools/icons/interpretation_portal.svg",
            visibility: "public",
            welcomePage: {
                title: "Clinical Analysis",
                subtitle: "Combine genetic and clinical data to interpret a case and gain insights for a diagnosis.",
                // content: `
                //     Welcome to the OpenCB Clinical Analysis Application.
                //     This app allows clinicians to create cases, execute clinical interpretations and create clinical reports.
                // `,
            },
            menu: [
                {
                    id: "clinical-analysis-portal",
                    name: "Case Interpreter Portal",
                    icon: "fa-file-medical",
                    visibility: "public",
                    description: "Explore and review Clinical Interpretations: Filter by gene, consequence, frequency, and create clinical interpretations and reports.",
                },
                {
                    id: "disease-panel-browser",
                    name: "Disease Panel Browser",
                    icon: "fa-th-list",
                    visibility: "public",
                    description: "Explore, manage, and create any Disease Panel associated with the active Study.",
                },
                {
                    id: "cvdb-browser",
                    name: "Clinical Variant DB",
                    icon: "fa-database",
                    visibility: "none",
                    description: "Explore and review relevant information from your clinical analysis: interpretations, variants, and variant evidence.",
                },
            ],
        },
        {
            id: "catalog",
            name: "Catalog",
            title: "Data Catalog",
            description: "Manage and explore your data, files, samples, individuals, and families.",
            icon: "fa-archive",
            color: "#15D0C1",
            logo: "img/tools/icons/interpretation_portal_white.svg",
            logoAlt: "img/tools/icons/interpretation_portal.svg",
            visibility: "public",
            welcomePage: {
                title: "Data Catalog",
                subtitle: "Explore and manage all relevant metadata and clinical information.",
                // content: `
                //     Welcome to the Data Catalog Application.
                //     This app allows clinicians to create cases, execute clinical interpretations and create clinical reports.
                // `,
            },
            menu: [
                {
                    id: "sample-browser",
                    name: "Sample Browser",
                    icon: "fa-vial",
                    visibility: "public",
                    description: "Explore and manage all samples in the current study.",
                },
                {
                    id: "individual-browser",
                    name: "Individual Browser",
                    icon: "fa-user",
                    visibility: "public",
                    description: "Explore and manage all individuals in the current study.",
                },
                {
                    id: "family-browser",
                    name: "Family Browser",
                    icon: "fa-users",
                    visibility: "public",
                    description: "Explore and manage all families in the current study.",
                },
                {
                    id: "note-browser",
                    name: "Note Browser",
                    icon: "fa-sticky-note",
                    visibility: "public",
                    description: "Explore and manage all notes in the current study.",
                },
                {
                    id: "job-browser",
                    name: "Job Browser",
                    icon: "fa-rocket",
                    visibility: "public",
                    description: "Explore and manage all jobs in the current study.",
                },
            ],
        },
        {
            id: "admin",
            name: "Admin",
            icon: "fa-user-cog",
            color: "#9C64F7",
            description: "Administration tools for managing users, projects, and studies.",
            logo: "img/tools/icons/file_explorer_white.svg",
            logoAlt: "img/tools/icons/file_explorer.svg",
            visibility: "public",
            welcomePage: {
                title: "Admin",
                subtitle: "Perform all the administrative tasks for your Organization or Study.",
                // content: "Administration tools for managing users, projects, and studies.",
            },
            menu: [
                {
                    id: "organization-admin",
                    name: "Organizations Admin",
                    icon: "fa-building",
                    description: "Manage the configuration of the current organization.",
                    visibility: "public",
                },
                {
                    id: "study-admin",
                    name: "Study Admin",
                    icon: "fa-file-invoice",
                    description: "Manage the configuration of the current study.",
                    visibility: "public",
                },
                {
                    id: "study-admin-iva",
                    name: "IVA Configuration",
                    icon: "fa-cogs",
                    description: "Manage the configuration of the current IVA instance.",
                    visibility: "public",
                },
                {
                    id: "operations-admin",
                    name: "Operations Admin",
                    icon: "fa-server",
                    description: "Execute variant operations in the current study.",
                    visibility: "public",
                },
            ],
        }
    ]
};

