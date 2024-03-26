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
        "id": "1",
        "father": {},
        "mother": {},
        "sex": "MALE",
        "age": "61",
        "carrier": true
    },
    {
        "id": "2",
        "father": {},
        "mother": {},
        "sex": "FEMALE",
        "age": "61"
    },
    {
        "id": "3",
        "father": {},
        "mother": {},
        "sex": "MALE",
        "age": "60",
        "lifeStatus": "DEAD"
    },
    {
        "id": "4",
        "father": {},
        "mother": {},
        "sex": "FEMALE",
        "age": "50"
    },
    {
        "id": "5",
        "father": {id: "1"},
        "mother": {id: "2"},
        "sex": "UNKNOWN",
        "age": "50"
    },

    {
        "id": "6",
        "father": {id: "1"},
        "mother": {id: "2"},
        "sex": "FEMALE",
        "age": "50"
    },
    {
        "id": "7",
        "father": {id: "1"},
        "mother": {id: "2"},
        "sex": "FEMALE",
        "age": "50",
        "affected": true
    },
    {
        "id": "8",
        "father": {id: "3"},
        "mother": {id: "4"},
        "sex": "MALE",
        "age": "50",
        "carrier": true
    },
    {
        "id": "9",
        "father": {id: "3"},
        "mother": {id: "4"},
        "sex": "MALE",
        "age": "50",
        "lifeStatus": "DEAD"
    },
    {
        "id": "10",
        "father": {id: "3"},
        "mother": {id: "4"},
        "sex": "MALE",
        "age": "50"
    },
    {
        "id": "11",
        "father": {id: ""},
        "mother": {id: ""},
        "sex": "FEMALE",
        "age": "50"
    },
    {
        "id": "12",
        "father": {id: "6"},
        "mother": {id: "-1"},
        "sex": "MALE",
        "age": "50"
    },
    {
        "id": "13",
        "father": {id: "7"},
        "mother": {id: "8"},
        "sex": "FEMALE",
        "age": "50",
        "affected": true
    },
    {
        "id": "14",
        "father": {id: "7"},
        "mother": {id: "8"},
        "sex": "FEMALE",
        "age": "50"
    },
    {
        "id": "15",
        "father": {id: "7"},
        "mother": {id: "8"},
        "sex": "MALE",
        "age": "50",
        "affected": true
    },
    {
        "id": "16",
        "father": {id: "7"},
        "mother": {id: "8"},
        "sex": "MALE",
        "age": "50"
    },
    {
        "id": "17",
        "father": {id: "9"},
        "mother": {id: "-2"},
        "sex": "MALE",
        "age": "50"
    },
    {
        "id": "18",
        "father": {id: "10"},
        "mother": {id: "-3"},
        "sex": "MALE",
        "age": "50"
    },
    {
        "id": "19",
        "father": {id: "10"},
        "mother": {id: "-3"},
        "sex": "FEMALE",
        "age": "50",
        "affected": true
    },
    {
        "id": "20",
        "father": {id: "10"},
        "mother": {id: "11"},
        "sex": "FEMALE",
        "age": "50"
    },

    {
        "id": "-1",
        "father": {},
        "mother": {},
        "sex": "MALE",
        "age": "50"
    },
    {
        "id": "-2",
        "father": {},
        "mother": {},
        "sex": "FEMALE",
        "age": "50",
        "affected": true
    },
    {
        "id": "-3",
        "father": {},
        "mother": {},
        "sex": "FEMALE",
        "age": "50"
    },
    {
        "id": "21",
        "father": {id: "7"},
        "mother": {id: "-1"},
        "sex": "FEMALE",
        "age": "50"
    },
    {
        "id": "22",
        "father": {id: "7"},
        "mother": {id: "-1"},
        "sex": "FEMALE",
        "age": "50"
    }
];
