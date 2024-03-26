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

export default [
    {
        name: "First group",
        category: true,
    },
    {
        name: "Primary Findings",
        features: [
            {
                id: "12:1212121:A:T",
                chromosome: "12",
                start: 1212121,
                end: 1212122,
            }
        ],
        display: {
            visible: true,
            color: "red",
        }
    },
    {
        separator: true,
    },
    {
        name: "My genes of interest",
        features: [
            {
                id: "BRCA1",
                chromosome: "17",
                start: 43044295,
                end: 43170245,
            },
            {
                id: "BRCA2",
                chromosome: "13",
                start: 32315086,
                end: 32400268,
            },
            {
                id: "TP53",
                chromosome: "17",
                start: 7661779,
                end: 7687538,
            },
        ],
        display: {
            visible: true,
            color: "blue",
        },
    },
];
