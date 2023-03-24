
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


// Josemi 20220216 NOTE: The cellbase configuration is extracted from project config (see issue #173)
// We keep this global configuration to be backward compatible with OpenCGA 2.1, but will be removed in future releases
// const cellbase = {
//     host: "https://ws.zettagenomics.com/cellbase",
//     version: "v5.1"
// };

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
        id: "test-reference",
        url: "https://test.app.zettagenomics.com/reference/opencga"
    }
];

const opencga = {
    host: hosts[3].url,
    version: "v2",
    cookie: {
        prefix: "iva-" + hosts[3].id
    },
    sso: true,

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
    visibility: "public",
    icon: "img/tools/icons/aggregation2.svg",
    submenu: [
        // {
        //     id: "projects",
        //     name: "Projects",
        //     visibility: "public"
        // },

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
            separator: true,
            visibility: "public"
        },
        {
            id: "clinicalAnalysis",
            name: "Clinical Analysis Browser",
            visibility: "public"
        },
        {
            id: "disease-panel",
            name: "Disease Panel Browser",
            visibility: "public"
        },
        {
            separator: true,
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
    landingPage: {
        display: {
            logoStyle: "margin-bottom:48px;",
        },
        logo: "./img/iva.svg",
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
            id: "iva",
            name: "Variant Analysis",
            // logo: "img/iva-black.svg",
            logo: "img/iva-white.svg",
            icon: "img/tools/icons/variant_browser.svg",
            visibility: "public",
            welcomePage: {
                display: {
                    titleStyle: "text-align:center;",
                    subtitleStyle: "text-align:center;"
                },
                title: "Variant Analysis",
                subtitle: "Explore variants in real-time and execute analysis",
                logo: "./img/iva.svg",
                content: `
                    <p class="text-center">
                        Welcome to the Variant Analysis application.<br>
                        This interactive tool allows browse and run variant analysis.
                    </p>
                `,
                links: [
                    {title: "Documentation", url: "http://docs.opencb.org/display/iva"},
                ]
            },
            menu: [
                {
                    id: "browser",
                    name: "Variant Browser",
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
                },
                {
                    id: "analysis",
                    name: "Analysis",
                    description: "",
                    icon: "img/tools/icons/aggregation.svg",
                    visibility: "public",
                    submenu: [
                        {
                            name: "Summary Stats",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "sample-variant-stats",
                            name: "Sample Variant Stats",
                            acronym: "SVS",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "cohort-variant-stats",
                            name: "Cohort Variant Stats",
                            acronym: "CS",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Association Analysis",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "gwas",
                            name: "Genome-Wide Association Study (GWAS)",
                            acronym: "GWAS",
                            description: "Study of a genome-wide set of genetic variants in different individuals to see if any variant is associated with a trait",
                            icon: "img/tools/icons/aggregation.svg",
                            visibility: "public",
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Sample Analysis",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "knockout",
                            name: "Knockout Analysis",
                            acronym: "KO",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "sample-eligibility",
                            name: "Eligibility Analysis",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Individual Analysis",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "inferred-sex",
                            name: "Sex Inference",
                            acronym: "SI",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "individual-relatedness",
                            name: "Relatedness",
                            acronym: "RL",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "mendelian-error",
                            name: "Mendelian Errors",
                            acronym: "ME",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Cancer Analysis",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "mutational-signature",
                            name: "Mutational Signature",
                            acronym: "SG",
                            description: "",
                            icon: "img/tools/icons/aggregation.svg",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Quality Control",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "sample-qc",
                            name: "Sample Quality Control",
                            description: "Calculate different genetic checks and metrics and store data in Sample Catalog",
                            icon: "img/tools/icons/aggregation.svg",
                            visibility: "public"
                        },
                        {
                            id: "individual-qc",
                            name: "Individual Quality Control",
                            description: "Calculate different genetic checks and metrics and store data in Individual Catalog",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "family-qc",
                            name: "Family Quality Control",
                            description: "Calculate different genetic checks and metrics and store data in Family Catalog",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Export",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "variant-export",
                            name: "Variant Export",
                            acronym: "EX",
                            description: `
                                Filter and export variants, with their annotation and sample genotypes,
                                from the Variant Storage to a file in multiple supported formats (vcf, json, tped, ensembl vep tab...)
                                for being shared or processed by an external tool.
                            `,
                            icon: "img/tools/icons/aggregation.svg",
                            visibility: "public"
                        },
                        {
                            id: "variant-stats-exporter",
                            name: "Variant Stats Export",
                            acronym: "VSE",
                            description: "Export variant stats for different cohorts",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "External Tools",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "beacon",
                            name: "GA4GH Beacon",
                            description: `
                                <ul>
                                    <li>Federated search from the Global Alliance for Genomics and Health</li>
                                    <li>Find databases that have information about specific variants</li>
                                </ul>`,
                            thumbnail: "beacon.png",
                            fa_icon: "fa fa-globe-europe",
                            icon: "beacon.svg",
                            visibility: "public"
                        },
                        {
                            id: "plink",
                            name: "Plink",
                            acronym: "Pl",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "gatk",
                            name: "GATK",
                            acronym: "GT",
                            description: "",
                            icon: "",
                            visibility: "public"
                        },
                    ]
                },
                {
                    id: "alignment",
                    name: "Alignment",
                    description: "",
                    icon: "img/tools/icons/alignment.svg",
                    visibility: "none",
                    submenu: [
                        {
                            name: "Data Management",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "alignment-index",
                            name: "Alignment Index",
                            description: "Create a .bai index file.",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            id: "coverage-index",
                            name: "Coverage Index",
                            description: "Precompute coverage in a BigWig file",
                            icon: "",
                            visibility: "public"
                        },
                        {
                            separator: true,
                            visibility: "public"
                        },
                        {
                            name: "Summary Stats",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "alignment-stats",
                            name: "Alignment Stats",
                            description: "Compute BAM stats using samtools",
                            icon: "",
                            visibility: "public"
                        }
                    ]
                },
                {
                    id: "tools",
                    name: "Other Tools",
                    icon: "img/tools/icons/variant_browser.svg",
                    visibility: "none",
                    submenu: [
                        {
                            id: "rga",
                            name: "Recessive Variant Analysis",
                            acronym: "",
                            icon: "",
                            description: "",
                            visibility: "public"
                        },
                        {
                            id: "beacon",
                            name: "GA4GH Beacon",
                            description: `
                                <ul>
                                    <li>Federated search from the Global Alliance for Genomics and Health</li>
                                    <li>Find databases that have information about specific variants</li>
                                </ul>`,
                            thumbnail: "beacon.png",
                            fa_icon: "fa fa-globe-europe",
                            icon: "beacon.svg",
                            visibility: "public"
                        }
                        // {
                        //     id: "genomeBrowser",
                        //     title: "Genome Browser",
                        //     acronym: "GB",
                        //     description: `<ul>
                        //                     <li>Based on Genome Maps (http://genomemaps.org)</li>
                        //                     <li>Smooth, interactive variant visualisation</li>
                        //                     </ul>`,
                        //     visibility: "private",
                        //     thumbnail: "screenshot3.png",
                        //     fa_icon: "fa fa-globe-europe",
                        //     icon: "genome_browser.svg"
                        //
                        // },
                    ]
                },
                CATALOG_NAVBAR_MENU,
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
        {
            id: "clinical",
            name: "Clinical Analysis",
            logo: "img/iva-white.svg",
            // logoAlt: "img/tools/icons/interpretation_portal.svg",
            icon: "img/tools/icons/interpretation_portal.svg",
            visibility: "public",
            welcomePage: {
                title: "Clinical Analysis",
                display: {
                    titleStyle: "text-align:center;",
                    subtitleStyle: "text-align:center;"
                },
                subtitle: "Interactive Case Interpreter",
                logo: "./img/iva.svg",
                content: `
                    <p class="text-center">
                        Welcome to the Clinical Analysis Application
                        <br>
                        This app allows clinicians to create cases, execute clinical interpretations and create clinical reports.
                    </p>`
            },
            menu: [
                {
                    id: "clinicalAnalysisPortal",
                    name: "Case Interpreter Portal",
                    icon: "img/tools/icons/interpretation_portal.svg",
                    description: `
                        <p>Explore and review Clinical Interpretations analysis</p>
                        <ul>
                            <li>Filter by gene, consequence, frequency and much more.</li>
                            <li>Create clinical interpretations and reports.</li>
                        </ul>
                    `,
                    visibility: "public",
                    thumbnail: "interpretation_portal.png",
                    featured: true,
                },
                {
                    id: "clinical",
                    name: "Management",
                    icon: "img/tools/icons/interpretation_portal.svg",
                    visibility: "public",
                    submenu: [
                        {
                            name: "Case Management",
                            category: true,
                            visibility: "public"
                        },
                        {
                            id: "clinical-analysis-create",
                            name: "Create Case",
                            icon: "img/tools/icons/genome_browser.svg",
                            description: `
                                <p>Create a clinical Case</p>
                                <ul>
                                    <li>Execute clinical interpretations analysis.</li>
                                    <li>Create clinical reports.</li>
                                </ul>
                            `,
                            visibility: "public",
                            featured: true,
                        }
                    ]
                },
                CATALOG_NAVBAR_MENU
                // {
                //     separator: true,
                //     visibility: "public"
                // },
                // {
                //     title: "Clinical Analysis",
                //     category: true,
                //     id: "cat-analysis",
                //     visibility: "public"
                // },
                // {
                //     separator: true,
                //     visibility: "public"
                // },
                // {
                //     title: "Case Interpretation",
                //     category: true,
                //     id: "cat-clinical",
                //     visibility: "public"
                // },
                // {
                //     id: "rd-tiering",
                //     title: "RD Tiering",
                //     acronym: "RDT",
                //     description: "",
                //     icon: "",
                //     visibility: "public"
                // },
                // {
                //     id: "team",
                //     title: "TEAM",
                //     description: "",
                //     icon: "",
                //     visibility: "public"
                // },
                // {
                //     id: "zetta",
                //     title: "Zetta",
                //     description: "",
                //     icon: "",
                //     visibility: "public"
                // },
                // {
                //     id: "cancer-tiering",
                //     title: "OpenCGA Cancer Tiering (Based on GEL algorithm)",
                //     description: "",
                //     icon: "",
                //     visibility: "public"
                // },
                // {
                //     id: "interpreter",
                //     title: "Case Interpreter",
                //     acronym: "",
                //     icon: "",
                //     description: "",
                //     visibility: "public"
                // }
                // {
                //     separator: true,
                //     visibility: "public"
                // },
                // {
                //     title: "Reported Variants",
                //     category: true,
                //     id: "cat-clinical",
                //     visibility: "public"
                // },
                // {
                //     id: "cva",
                //     title: "Clinical Variant Browser",
                //     acronym: "CVB",
                //     description: "",
                //     icon: "",
                //     visibility: "public"
                // }
            ],
            fileExplorer: {
                visibility: "private"
            },
            jobMonitor: {
                visibility: "private"
            },
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
                    {id: "releases", name: "Releases", url: "https://github.com/opencb/iva/releases", icon: "fa fa-archive"},
                    {id: "rest-api", name: "OpenCGA REST API", icon: "fas fa-book-open"},
                    {id: "about", name: "About", url: "#about", icon: "fa fa-info-circle"}
                ]
            },
            userMenu: [
                {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
                // {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
                {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
                // {id: "settings", name: "Settings", url: "#settings", icon: "fas fa-cogs"}
            ]
        },
        {
            id: "admin",
            name: "OpenCGA Admin",
            logo: "img/tools/icons/file_explorer.svg",
            icon: "img/tools/icons/file_explorer.svg",
            visibility: "public",
            welcomePage: {
                display: {
                    titleStyle: "text-align:center;",
                    subtitleStyle: "text-align:center;"
                },
                title: " OpenCGA Admin",
                // subtitle: "Clinical Analysis",
                logo: "./img/iva.svg",
                content: `
                    <p class="text-center">
                        Welcome to the OpenCB Suite for whole genome variant analysis.<br />
                        This interactive tool allows finding genes affected by deleterious variants<br />that segregate along family
                        pedigrees, case-controls or sporadic samples.
                    </p>
                    <br>`
            },
            menu: [
                {
                    id: "study-admin",
                    name: "Study admin",
                    fa_icon: "fas fa-file-invoice",
                    icon: "img/tools/icons/variant_browser.svg",
                    description: "",
                    visibility: "public",
                    featured: true,
                },
                // {
                //     id: "variant-admin",
                //     name: "Variant database",
                //     fa_icon: "fas fa-file-invoice",
                //     icon: "img/tools/icons/variant_browser.svg",
                //     description: "",
                //     visibility: "public",
                //     featured: false,
                // },
                {
                    id: "catalog-admin",
                    name: "Catalog Management",
                    fa_icon: "fas fa-file-invoice",
                    icon: "img/tools/icons/variant_browser.svg",
                    description: "",
                    visibility: "public",
                    featured: false,
                },
                {
                    id: "study-variant-admin",
                    name: "Study Variant Admin",
                    fa_icon: "fas fa-file-invoice",
                    icon: "img/tools/icons/variant_browser.svg",
                    description: "",
                    visibility: "public",
                    featured: true,
                },
                {
                    id: "projects-admin",
                    name: "Project Manager",
                    fa_icon: "fas fa-file-invoice",
                    icon: "img/tools/icons/variant_browser.svg",
                    description: "",
                    visibility: "public",
                    featured: true,
                },
            ],
            fileExplorer: {
                visibility: "private"
            },
            jobMonitor: {
                visibility: "none"
            },
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
                    {id: "releases", name: "Releases", url: "https://github.com/opencb/iva/releases", icon: "fa fa-archive"},
                    {id: "rest-api", name: "OpenCGA REST API", icon: "fas fa-book-open"},
                    {id: "about", name: "About", url: "#about", icon: "fa fa-info-circle"}
                ]
            },
            userMenu: [
                {id: "account", name: "Your Profile", url: "#account", icon: "fa fa-user", visibility: "private"},
                // {id: "projects", name: "Projects", url: "#projects", icon: "fa fa-database", visibility: "private"},
                {id: "file-manager", name: "File Manager", url: "#file-manager", icon: "fas fa-folder-open", visibility: "private"}
                // {id: "settings", name: "Settings", url: "#settings", icon: "fas fa-cogs"}
            ]
        }
    ]
};

