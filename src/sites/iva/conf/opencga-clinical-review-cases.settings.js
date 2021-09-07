const OpencgaClinicalReviewCasesSettings = {
    menu: {
        filters: [
            {
                id: "case"
            },
            {
                id: "sample"
            },
            {
                id: "proband"
            },
            {
                id: "family"
            },
            {
                id: "disorder"
            },
            {
                id: "type"
            },
            {
                id: "assignee"
            }
        ]
    },
    table: {
        /* toolbar: {
            showCreate: true
        },*/
        columns: ["caseId", "probandId", "familyId", "disorderId", "interpretation", "action"]
    }
};
