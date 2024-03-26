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

const OPENCGA_GENE_VIEW_SETTINGS = {
    icon: "img/tools/icons/gene-view.svg",
    // set to true if the server on which IVA is running is exposed to Internet (for genomemaps.org, ensembl.org).
    externalLinks: true,
    // from conf/tools.js
    protein: {
        color: {
            synonymous_variant: "blue",
            coding_sequence_variant: "blue",
            missense_variant: "orange",
            protein_altering_variant: "orange",
            start_lost: "red",
            stop_gained: "red",
            stop_lost: "red",
            stop_retained_variant: "red"
        }
    }
};
