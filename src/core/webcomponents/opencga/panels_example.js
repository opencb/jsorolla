let diseasePanels = [{
    id: "x",
    name: "X",

    author: "florido@test.com",
    date: "1/1/1111",
    description: "asdf asdf asdf asdf asdf",

    version: 1,
    status: "UnderReview",

    phenotypes: [
        {
            id: "300301", name: "jlksaljksajlkas", source: "omim", synonym: "HED-ID; Displasia ectodérmica anhidrótica con inmunodeficiencia; EDA-ID"
        },
        {
            id: "RCV129812", name: "jlksaljksajlkas", source: "clinvar", synonim: ""
        }
    ],

    variants: ["rs123456", "RCV129812", "1:3333423:A:T"],

    genes: [
        {id: "BRCA2", weight: 3, soType: "splice_site"},
        {id: "TP53", weight: 0, soType: ""}
    ],

    regions: ["1:3333423-3333435", "1:3333423"],

    report: {
        positive: "",
            negative: "",
            logo: "",
            attributes: {
        }
    },

    attributes: {
        "category": "",
            "subcategory": "",
            "subcategory1": "",
            "reviewStatus": ""
    }
},
    {
        id: "x2",
        name: "X2",

        author: "florido@tst2.com",
        date: "1/1/1111",
        description: "asdf asdf asdf asdf asdf",

        version: 1,
        status: "UnderReview",

        phenotypes: [

            {
                id: "RCV129812", name: "Retinitis", source: "clinvar", synonim: ""
            }
        ],

        variants: ["rs123456", "1:3333423:A:T"],

        genes: [
            {id: "BRCA1", weight: 1, soType: "splice_site"},
            {id: "TP52", weight: 2, soType: ""}
        ],

        regions: ["1:3333423-3333435", "1:3333423"],

        report: {
            positive: "",
            negative: "",
            logo: "",
            attributes: {
            }
        },

        attributes: {
            "category": "",
            "subcategory": "",
            "subcategory1": "",
            "reviewStatus": ""
        }
    }];



// Summary:
// {
//     date: ""
//     panels: [
//         {
//             id: "x"
//             name: "X"
//             version: [1, 3]
//             counters: {variants: 0, genes: 3, regions: 0}
//         }
//     ]
// };

