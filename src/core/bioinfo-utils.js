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

export default class BioinfoUtils {

    static getGeneNameLink(geneName) {
        return "https://www.genenames.org/tools/search/#!/all?query=" + geneName;
    }

    static getEnsemblLink(featureId, type = "gene", assembly = "GRCh38") {
        let ensemblLink;
        switch (type.toUpperCase()) {
            case "GENE":
                if (assembly.toUpperCase() === "GRCH38") {
                    ensemblLink = "http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=" + featureId;
                } else {
                    ensemblLink = "http://grch37.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=" + featureId;
                }
                break;
            case "TRANSCRIPT":
                    if (assembly.toUpperCase() === "GRCH38") {
                        ensemblLink = "https://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=" + featureId;
                    } else {
                        ensemblLink = "http://grch37.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=" + featureId;
                    }
                break;
            default:
                break;
        }
        return ensemblLink;
    }

    static getCosmicLink(featureId, assembly = "GRCh38") {
        if (assembly.toUpperCase() === "GRCH38") {
            return "https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=" + featureId;
        } else {
            return "https://cancer.sanger.ac.uk/cosmic/gene/analysis?genome=37&ln=" + featureId;
        }
    }

    static getCosmicVariantLink(variantId) {
        return "https://cancer.sanger.ac.uk/cosmic/search?q=" + variantId;
    }

    static getClinvarVariationLink(variantId) {
        return "https://www.ncbi.nlm.nih.gov/clinvar/variation/" + variantId;
    }

    static getUniprotLink(featureId, species = "Homo sapiens") {
        return "https://www.uniprot.org/uniprot/?sort=score&query=" + featureId + "+organism:" + species;
    }

}
