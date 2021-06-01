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
        // return "https://www.uniprot.org/uniprot/?sort=score&query=" + featureId + "+organism:" + species;
        return "https://www.uniprot.org/uniprot/" + featureId;
    }

    static getVariantLink(id, location, source, assembly) {
        if (!source) {
            return null;
        }

        // create +/- 5,000 bp region
        const split = location.split(new RegExp("[:-]"));
        const region = split[0] + ":" + Number(split[1]) - 5000 + "-" + Number(split[2]) + 5000;

        switch (source.toUpperCase()) {
            case "ENSEMBL_GENOME_BROWSER":
                return `http://www.ensembl.org/Homo_sapiens/Location/View?r=${region}`;
            case "UCSC_GENOME_BROWSER":
                return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr${region}`;

        }
    }

    static getGeneLink(geneId, source, assembly) {
        if (!geneId || !source) {
            return null;
        }

        switch (source.toUpperCase()) {
            case "ENSEMBL":
                if (assembly.toUpperCase() === "GRCH38") {
                    return `https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`;
                } else {
                    return `https://grch37.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`;
                }
            case "LRG":
                return `https://www.lrg-sequence.org/search/?query=${geneId}`;
            case "DECIPHER":
                return `https://www.deciphergenomics.org/gene/${geneId}`;
            case "COSMIC":
                if (assembly.toUpperCase() === "GRCH38") {
                    return "https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=" + geneId;
                } else {
                    return "https://cancer.sanger.ac.uk/cosmic/gene/analysis?genome=37&ln=" + geneId;
                }
            case "OMIM":
                return `https://omim.org/search?index=entry&sort=score+desc%2C+prefix_sort+desc&start=1&limit=10&search=${geneId}`;
            case "REFSEQ":
                return `https://www.ncbi.nlm.nih.gov/gene/${geneId}`;
        }
    }

    static getTranscriptLink(geneId, source, assembly) {
        if (!geneId || !source) {
            return null;
        }

        switch (source.toUpperCase()) {
            case "ENSEMBL":
                if (assembly.toUpperCase() === "GRCH38") {
                    return `https://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${geneId}`;
                } else {
                    return `https://grch37.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${geneId}`;
                }
            case "REFSEQ":
                return `https://www.ncbi.nlm.nih.gov/gene/?term=${geneId}`;
        }
    }

}
