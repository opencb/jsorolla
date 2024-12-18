
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
        url: "https://test.app.zettagenomics.com/TASK-6757a/opencga"
    },
];

const opencga = {
    host: hosts[2].url,
    version: "v2",
    organizations: [],
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

const CATALOG_NAVBAR_MENU = {
    id: "catalog",
    name: "Catalog",
    icon: "img/tools/icons/aggregation2.svg",
    visibility: "public",
    submenu: [
        // {
        //     id: "projects",
        //     name: "Projects",
        //     visibility: "public"
        // },
        {
            name: "Metadata",
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
            icon: "img/tools/icons/file_explorer.svg",
            description: `
                <p>Explore samples in Catalog</p>
                <ul>
                    <li>Search samples by different filters.</li>
                    <li>Execute aggregations stats.</li>
                </ul>
            `,
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
            id: "note-browser",
            name: "Note Browser",
            visibility: "public",
        },
        {
            separator: true,
            visibility: "public"
        },
        {
            name: "Clinical",
            category: true,
            id: "cat-clinical",
            visibility: "public"
        },
        {
            id: "disease-panel",
            name: "Disease Panel Browser",
            visibility: "public"
        },
        {
            id: "clinicalAnalysis",
            name: "Clinical Analysis Browser",
            visibility: "public"
        },
        {
            separator: true,
            visibility: "public"
        },
        {
            name: "Analysis",
            category: true,
            id: "cat-analysis",
            visibility: "public"
        },
        {
            id: "workflow",
            name: "Workflow Browser",
            visibility: "public"
        },
        {
            id: "job",
            name: "Job Browser",
            visibility: "public"
        },
    ]
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
    landingPage: {
        organisation: {
            logo: {img: "img/opencb-logo.png", height: "60px", link: "https://github.com/opencb"},
            title: "Unleash the power of genomic data",
            display: {
                logoStyle: "",
                logoClass: "",
                titleStyle: "",
                titleClass: "",
            }
        },
        login: {
            logo: {img: "img/iva.svg", height: "80px", link: ""},
            title: "Welcome back!",
            display: {
                logoStyle: "margin-bottom: 32px;",
                logoClass: "",
                titleStyle: "",
                titleClass: "",
                contentStyle: "",
                contentClass: "",
            },
        }
    },
    welcomePage: {
        title: "OpenCB Suite",
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
        display: {
            backgroundColor: "",
        },
        organisation: {
            logo: {img: "img/opencb-logo.png", height: "20px", link: "https://github.com/opencb/"},
            text: "",
            textStyle: "",
        },
        project: {
            logo: {img: "", height: "3rem", link: ""},
        },
        opencb: {
            display: {
                textColor: "",
            },
            logo: {img: "", height: "", link: ""},
            text: "Powered by OpenCB",
            link: "https://github.com/opencb/",
        },
        custom: "", // Optionally, a custom footer can be added.
    },
    sidebar: {
        organisation: {
            logo: {
                img: "img/opencb-icon.png",
            },
            menu: [
                {id: "code", name: "Source code", icon: "fa-code", url: "https://github.com/opencb/jsorolla"},
                {id: "documentation", name: "Documentation", icon: "fa-book", url: "http://docs.opencb.org/display/iva"},
                {id: "tutorial", name: "Tutorial", icon: "fa-user-graduate", url: "http://docs.opencb.org/display/iva/Tutorials"},
                {id: "releases", name: "Releases", icon: "fa-rocket", url: "https://github.com/opencb/jsorolla/releases"},
                {id: "about", name: "About", icon: "fa-info-circle", url: "#about"},
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
                display: {
                    logoWidth: "100px",
                },
                title: "Research Environment",
                // subtitle: "Explore variants in real-time and execute analysis.",
                content: `
                    Variant Research Environment App implements different tools to focus on the analysis and interpretation of genomic variants
                    to understand their role in diseases, traits, and biological processes. It involves the use of our aggregated variant database,
                    bioinformatics tools, workflows, notebooks, and computational methods to identify, classify, and study variants for personalized medicine and genetic research.
                `,
            },
            menu: [
                {
                    id: "variant-browser",
                    name: "Variant Browser",
                    icon: "fa-dna",
                    visibility: "public",
                    featured: true,
                    description: "Explore our high-performance and scalable aggregated variant database in real-time.",
                },
                {
                    id: "analysis-tools",
                    name: "Analysis Tools",
                    icon: "fa-tools",
                    visibility: "public",
                    featured: true,
                    description: "Execute analysis tools using data of the current study.",
                },
                {
                    id: "workflow-manager",
                    name: "Workflow Manager",
                    icon: "fa-stream",
                    visibility: "public",
                    featured: true,
                    description: "Build, import and execute NextFlow workflows.",
                },
                {
                    id: "tool-analysis",
                    name: "Custom Tool",
                    icon: "fa-rocket",
                    visibility: "public",
                    featured: true,
                    description: "Execute your own custom tools easily in the cloud.",
                },
                {
                    id: "jupyter-notebook",
                    name: "Jupyter Notebooks",
                    icon: "fa-book",
                    visibility: "public",
                    featured: true,
                    description: "Create, share and execute Jupyter Notebooks with Python.",
                },
                {
                    id: "my-analysis",
                    name: "My Analysis",
                    icon: "fa-cog",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all your exceuted analysis.",
                },
                {
                    id: "cohort-browser",
                    name: "Cohort Manager",
                    icon: "fa-search",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all cohorts in the current study.",
                },
                {
                    id: "file-data-manager",
                    name: "Data Manager",
                    icon: "fa-folder",
                    visibility: "public",
                    featured: true,
                    description: "Manage your data in the cloud",
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
                // subtitle: "Interactive Case Interpreter",
                content: `
                    Welcome to the OpenCB Clinical Analysis Application.
                    This app allows clinicians to create cases, execute clinical interpretations and create clinical reports.
                `,
            },
            menu: [
                {
                    id: "clinical-analysis-portal",
                    name: "Case Interpreter Portal",
                    // icon: "img/tools/icons/interpretation_portal.svg",
                    icon: "fa-file-medical",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore and review Clinical Interpretations analysis</p>
                        <ul>
                            <li>Filter by gene, consequence, frequency and much more.</li>
                            <li>Create clinical interpretations and reports.</li>
                        </ul>
                    `,
                    thumbnail: "interpretation_portal.png",
                },
                {
                    id: "disease-panel-browser",
                    name: "Disease Panels",
                    // icon: "img/tools/icons/interpretation_portal.svg",
                    icon: "fa-th-list",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore and review Clinical Interpretations analysis</p>
                        <ul>
                            <li>Filter by gene, consequence, frequency and much more.</li>
                            <li>Create clinical interpretations and reports.</li>
                        </ul>
                    `,
                    thumbnail: "interpretation_portal.png",
                },
                {
                    id: "cvdb-browser",
                    name: "Clinical Variant DB",
                    // icon: "img/tools/icons/interpretation_portal.svg",
                    icon: "fa-database",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore and review Clinical Interpretations analysis</p>
                        <ul>
                            <li>Filter by gene, consequence, frequency and much more.</li>
                            <li>Create clinical interpretations and reports.</li>
                        </ul>
                    `,
                    thumbnail: "interpretation_portal.png",
                },
                {
                    id: "clinical-configuration",
                    name: "Configuration",
                    // icon: "img/tools/icons/interpretation_portal.svg",
                    icon: "fa-cog",
                    visibility: "public",
                    featured: true,
                    description: `
                        <p>Explore and review Clinical Interpretations analysis</p>
                        <ul>
                            <li>Filter by gene, consequence, frequency and much more.</li>
                            <li>Create clinical interpretations and reports.</li>
                        </ul>
                    `,
                    thumbnail: "interpretation_portal.png",
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
                // subtitle: "",
                content: `
                    Welcome to the Data Catalog Application.
                    This app allows clinicians to create cases, execute clinical interpretations and create clinical reports.
                `,
            },
            menu: [
                {
                    id: "sample-browser",
                    name: "Sample Browser",
                    icon: "fa-vial",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all samples in the current study.",
                },
                {
                    id: "individual-browser",
                    name: "Individual Browser",
                    icon: "fa-user",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all individuals in the current study.",
                },
                {
                    id: "family-browser",
                    name: "Family Browser",
                    icon: "fa-users",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all families in the current study.",
                },
                {
                    id: "file-browser",
                    name: "File Browser",
                    icon: "fa-file",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all files in the current study.",
                },
                {
                    id: "note-browser",
                    name: "Note Browser",
                    icon: "fa-sticky-note",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all notes in the current study.",
                },
                {
                    id: "job-browser",
                    name: "Job Browser",
                    icon: "fa-rocket",
                    visibility: "public",
                    featured: true,
                    description: "Explore and manage all jobs in the current study.",
                },
                // {
                //     id: "workflow-manager",
                //     name: "Workflow Manager",
                //     icon: "img/tools/icons/variant_browser.svg",
                //     visibility: "public",
                //     featured: true,
                //     description: `
                //         <p>Explore all variants identified by the current study.</p>
                //         <ul>
                //             <li>Rich annotation and links to leading reference databases</li>
                //             <li>Filter by gene, consequence, frequency and much more</li>
                //         </ul>
                //     `,
                // },
                // {
                //     id: "cohort-browser",
                //     name: "Cohort Builder",
                //     icon: "img/tools/icons/variant_browser.svg",
                //     visibility: "public",
                //     featured: true,
                //     description: `
                //         <p>Explore all variants identified by the current study.</p>
                //         <ul>
                //             <li>Rich annotation and links to leading reference databases</li>
                //             <li>Filter by gene, consequence, frequency and much more</li>
                //         </ul>
                //     `,
                // },
                // {
                //     id: "variable-set-browser",
                //     name: "Custom Annotations",
                //     icon: "img/tools/icons/variant_browser.svg",
                //     visibility: "public",
                //     featured: true,
                //     description: `
                //         <p>Explore all variants identified by the current study.</p>
                //         <ul>
                //             <li>Rich annotation and links to leading reference databases</li>
                //             <li>Filter by gene, consequence, frequency and much more</li>
                //         </ul>
                //     `,
                // },
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
                // subtitle: "",
                content: "Administration tools for managing users, projects, and studies.",
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

