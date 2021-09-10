const VariantInterpreterConfig = {
    title: "Case Interpreter",
    icon: "fas fa-user-md",
    clinicalAnalysisSelector: true,
    tools: [
        {
            id: "select",
            title: "Case Info",
            acronym: "VB",
            description: "",
            icon: "fa fa-folder-open"
        },
        {
            id: "qc",
            title: "Quality Control",
            acronym: "VB",
            description: "",
            icon: "fa fa-chart-bar"
        },
        {
            id: "interpretation",
            title: "Interpretation Methods",
            acronym: "VB",
            description: "",
            icon: "fa fa-sync",
            hidden: true
        },
        {
            id: "variant-browser",
            title: "Sample Variant Browser",
            acronym: "VB",
            description: "",
            icon: "fa fa-search"
        },
        {
            id: "review",
            title: "Interpretation Review",
            acronym: "VB",
            description: "",
            icon: "fa fa-edit"
        },
        {
            id: "report",
            title: "Report",
            acronym: "VB",
            description: "",
            disabled: true,
            icon: "fa fa-file-alt"
        }
    ]
};
