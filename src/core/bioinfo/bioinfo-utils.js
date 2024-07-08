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

    static sort(consequenceTypes, field) {
        consequenceTypes.sort((a, b) => {
            if (field(a) === "" && field(b) !== "") {
                return 1;
            }
            if (field(a) !== "" && field(b) === "") {
                return -1;
            }
            if (field(a) < field(b)) {
                return -1;
            }
            if (field(a) > field(b)) {
                return 1;
            }
            return 0;
        });
    }

    static getIdName(id, name) {
        let text = "";
        if (name) {
            text = name;
        }

        if (id) {
            if (name) {
                text += ` (${id})`;
            } else {
                text = id;
            }
        }

        return text;
    }

    // Generate Variant ID in Varsome format
    // https://varsome.com/how-do-i-create-link-varsome/
    static getVariantInVarsomeFormat(variantId) {
        const [chr, position, ref, alt] = variantId.split(":");
        return `chr${chr}:${position.replace("-", ":")}:${ref.replace("-", "")}:${alt.replace("-", "")}`;
    }

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

        // Check for cellbase source
        if (source.toUpperCase().startsWith("CELLBASE_V")) {
            const version = source.toUpperCase().replace("CELLBASE_", "").toLowerCase();
            return `https://ws.zettagenomics.com/cellbase/webservices/rest/${version}/hsapiens/genomic/variant/${id}/annotation`;
        }

        if (id?.startsWith("rs")) {
            if (assembly?.toUpperCase() === "GRCH38") {
                return `http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=${id}`;
            } else {
                return `http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=${id}`;
            }
        }

        if (id?.startsWith("HGNC:")) {
            return `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${id}`;
        }

        // create +/- 5,000 bp region
        const split = location.split(new RegExp("[:-]"));
        const region = split[0] + ":" + (Number(split[1]) - 5000) + "-" + (Number(split[2]) + 5000);

        switch (source.toUpperCase()) {
            case "DECIPHER":
                // To make things easier the conversion of OpenCB Variant ID to Decipher ID must happen here
                const decipherId = id.replace(/:/g, "-");
                return `https://www.deciphergenomics.org/sequence-variant/${decipherId}`;
            case "ENSEMBL_GENOME_BROWSER":
                if (assembly?.toUpperCase() === "GRCH38") {
                    return `http://ensembl.org/Homo_sapiens/Location/View?r=${region}`;
                } else {
                    return `http://grch37.ensembl.org/Homo_sapiens/Location/View?r=${region}`;
                }
            case "UCSC_GENOME_BROWSER":
                return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr${region}`;
            case "VARSOME":
                if (assembly?.toUpperCase() === "GRCH38") {
                    return `https://varsome.com/variant/hg38/${BioinfoUtils.getVariantInVarsomeFormat(id)}`;
                } else {
                    return `https://varsome.com/variant/hg19/${BioinfoUtils.getVariantInVarsomeFormat(id)}`;
                }
        }
    }

    static getGeneLink(geneId, source, assembly = "GRCh38") {
        if (!geneId) {
            return null;
        }

        let s = source;
        if (!s) {
            s = geneId.startsWith("ENSG") ? "ENSEMBL" : "REFSEQ";
        }

        switch (s.toUpperCase()) {
            case "ENSEMBL":
                if (assembly.toUpperCase() === "GRCH38") {
                    return `https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`;
                } else {
                    return `https://grch37.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`;
                }
            case "HGNC":
                return "https://www.genenames.org/tools/search/#!/all?query=" + geneId;
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
            case "VARSOME":
                if (assembly?.toUpperCase() === "GRCH38") {
                    return `https://varsome.com/gene/hg38/${geneId}`;
                } else {
                    return `https://varsome.com/gene/hg19/${geneId}`;
                }
        }
    }

    static getTranscriptLink(transcriptId, source, assembly = "GRCh38") {
        if (!transcriptId) {
            return null;
        }

        let s = source;
        if (!s) {
            s = transcriptId.startsWith("ENST") ? "ENSEMBL" : "REFSEQ";
        }

        switch (s.toUpperCase()) {
            case "ENSEMBL":
                if (assembly.toUpperCase() === "GRCH38") {
                    return `https://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${transcriptId}`;
                } else {
                    return `https://grch37.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${transcriptId}`;
                }
            case "REFSEQ":
                return `https://www.ncbi.nlm.nih.gov/gene/?term=${transcriptId}`;
        }
    }

    static getProteinLink(proteinId, source) {
        if (!proteinId) {
            return null;
        }

        let s = source;
        if (!s) {
            s = proteinId.startsWith("ENSP") ? "ENSEMBL" : "REFSEQ";
        }

        switch (s.toUpperCase()) {
            case "ENSEMBL":
                return `http://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;p=${proteinId}`;
            case "REFSEQ":
                return `https://www.ncbi.nlm.nih.gov/gene/?term=${proteinId}`;
        }
    }

    static getPubmedLink(id) {
        if (id.startsWith("PMID")) {
            return `https://pubmed.ncbi.nlm.nih.gov/${id.split(":")[1]}/`;
        } else {
            return `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
        }
    }

    static getPanelAppLink(panelAppId) {
        return `https://panelapp.genomicsengland.co.uk/panels/${panelAppId}/`;
    }

    static getOntologyLink(ontologyTermId) {
        if (ontologyTermId.includes(":")) {
            const [source, id] = ontologyTermId?.split(":");
            switch (source?.toUpperCase()) {
                case "HP":
                    return this.getHpoLink(ontologyTermId);
                case "DOID":
                    return this.getDiseaseOntologyLink(ontologyTermId);
                case "SO":
                    return this.getSequenceOntologyLink(ontologyTermId);
                case "GO":
                    return this.getGeneOntologyLink(ontologyTermId);
                case "OMIM":
                    return this.getOmimLink(id);
                case "ORPHA":
                    return this.getOrphanetLink(id);
                case "MONDO":
                    // MONDO ontology does not have a specific URL
                    return this.getOboLink(ontologyTermId);
                default:
                    return ontologyTermId;
            }
        } else {
            return ontologyTermId;
        }
    }

    static getDiseaseOntologyLink(ontologyId) {
        return `https://disease-ontology.org/term/${ontologyId}/`;
    }

    static getGeneOntologyLink(ontologyId) {
        return `https://amigo.geneontology.org/term/${ontologyId}/`;
    }

    static getOboLink(ontologyId) {
        const ontologyShort = ontologyId.replace(":", "_");
        return `https://purl.obolibrary.org/obo/${ontologyShort}`;
    }

    static getHpoLink(hpoTerm) {
        return `https://hpo.jax.org/app/browse/term/${hpoTerm}`;
    }

    static getSequenceOntologyLink(soTerm) {
        return `http://www.sequenceontology.org/browser/current_svn/term/${soTerm}`;
    }

    static getOmimLink(soTerm) {
        return `https://omim.org/entry/${soTerm}"`;
    }

    static getOrphanetLink(orphaId) {
        return `https://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert=${orphaId}`;
    }

}
