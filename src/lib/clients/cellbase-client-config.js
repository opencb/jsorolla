/*
 * Copyright 2015 OpenCB
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

/**
 * Created by imedina on 18/03/16.
 */

class CellBaseClientConfig {

    constructor(hosts = ["bioinfo.hpc.cam.ac.uk/cellbase", "www.ebi.ac.uk/cellbase"], version = "v3", species = "hsapiens") {
        this.setHosts(hosts);
        this.version = version;
        this.species = species;

        // default values
        this.rpc = "rest";

        this.cache = {
            active: true,
            database: this.species + "_" + this.version + "_cellbase_cache",
            subcategories: ["genomic_chromosome", "genomic_region", "genomic_variant", "feature_gene", "feature_variation",
                "feature_clinical", "feature_id", "feature_protein", "feature_transcript"]
        }
    }

    setHosts(hosts) {
        if (typeof hosts == "string") {
            this.hosts = hosts.split(",");
        } else {
            this.hosts = hosts;
        }
    }

}