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


const test1 = {
    id: "test1",
    title: "Test 1",
    icon: "",
    requires: "2.0.0",
    description: "Test1 description",
    links: [
        {
            title: "Wikipedia",
            url: "",
            icon: ""
        }
    ],
    form: {
        sections: [
            {
                title: "Input Parameters",
                collapsed: false,
                parameters: [
                    {
                        id: "sample",
                        type: "SAMPLE_FILTER",
                    },
                    {
                        id: "cohort",
                        type: "COHORT_FILTER",
                    }
                ]
            },
            {
                title: "Configuration Parameters",
                collapsed: false,
                parameters: [
                    {
                        id: "assoc",
                        type: "categorical",
                        defaultValue: "Fisher",
                        allowedValues: ["Fisher", "Chi", "LR"],
                        multiple: false,
                        maxOptions: 1
                    },
                    {
                        id: "fisher-test",
                        type: "categorical",
                        defaultValue: "GT",
                        allowedValues: ["GT", "LT"],
                        dependsOn: "assoc == Fisher"
                    },
                    {
                        id: "freq",
                        type: "numeric",
                        defaultValue: "0.01",
                        allowedValues: [0, 1],
                        required: true
                    },
                    {
                        id: "genes",
                        type: "text",
                        rows: 3,
                        required: false
                    }
                ]
            }
        ],
        run: {
            title: "Job Info",
            job: {
                id: "$ID-$DATE-$RANDOM",
                tags: "",
                description: ""
            },
            execute: {
                validation: function(params) {
                    alert("test:" + params);
                },
                button: "Run",
            }
        }
    },
    result: {

    }
};