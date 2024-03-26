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
        {name: "BRCA2", chromosome: "1", start: "888", end:"121212", weight: 3, soType: "splice_site"},
        {name: "TP53", chromosome: "2", start: "3121", end:"44334", weight: 0, soType: ""}
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

