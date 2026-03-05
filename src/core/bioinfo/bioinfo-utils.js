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

    static isHuman(species) {
        return ["hsapiens", "homo_sapiens", "homo sapiens", "homosapiens", "human"].includes(species.toLowerCase());
    }

    static getEnsemblHost(assembly = "GRCh38") {
        return (assembly.toLowerCase() === "grch37") ? "https://grch37.ensembl.org" : "https://www.ensembl.org";
    }

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

    static getShortVariantId(variantId, limit = 20, offset = 5) {
        let [chr, position, ref, alt] = variantId.split(":");
        if (ref.length > limit) {
            ref = ref.substring(0, offset) + "..." + ref.substring(ref.length - offset);
        }
        if (alt.length > limit) {
            alt = alt.substring(0, offset) + "..." + alt.substring(alt.length - offset);
        }
        return `${chr}:${position}:${ref}:${alt}`;
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

    // Note: currently only human and mouse are supported
    static getEnsemblLink(featureId, type = "gene", species = "hsapiens", assembly = "GRCh38") {
        const ensemblHost = BioinfoUtils.getEnsemblHost(assembly);
        const ensemblSpecies = BioinfoUtils.isHuman(species) ? "Homo_sapiens" : "Mus_musculus";
        switch (type.toUpperCase()) {
            case "GENE":
                return `${ensemblHost}/${ensemblSpecies}/Gene/Summary?db=core;g=${featureId}`;
            case "TRANSCRIPT":
                return `${ensemblHost}/${ensemblSpecies}/Transcript/Summary?db=core;t=${featureId}`;
            case "PROTEIN":
                return `${ensemblHost}/${ensemblSpecies}/Transcript/Summary?db=core;p=${featureId}`;
            case "VARIANT":
            case "VARIATION":
                return `${ensemblHost}/${ensemblSpecies}/Variation/Explore?vdb=variation;v=${featureId}`;
            case "LOCATION":
            case "BROWSER":
                return `${ensemblHost}/${ensemblSpecies}/Location/View?r=${featureId}`;
        }
        return "";
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

    static getUniprotLink(featureId) {
        return `https://www.uniprot.org/uniprotkb?query=${featureId}`;
    }

    static getVariantLink(id, location, source, species = "hsapiens", assembly = "grch38") {
        if (!source) {
            return null;
        }

        // Check for CellBase source
        if (source.toUpperCase().startsWith("CELLBASE_V")) {
            const version = source.toUpperCase().replace("CELLBASE_", "").toLowerCase();
            return BioinfoUtils.getCellbaseVariantLink(id, "https://ws.zettagenomics.com/cellbase", version, "", "", species, assembly);
        }

        if (id?.startsWith("rs")) {
            return BioinfoUtils.getEnsemblLink(id, "VARIATION", species, assembly);
        }

        if (id?.startsWith("HGNC:")) {
            return `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${id}`;
        }

        // create +/- 5,000 bp region
        const split = location.split(new RegExp("[:-]"));
        const region = split[0] + ":" + (Number(split[1]) - 5000) + "-" + (Number(split[2]) + 5000);

        switch (source.toUpperCase()) {
            case "DECIPHER":
                // To make things easier, the conversion of OpenCB Variant ID to Decipher ID must happen here
                const decipherId = id.replace(/:/g, "-");
                return `https://www.deciphergenomics.org/sequence-variant/${decipherId}`;
            case "ENSEMBL_GENOME_BROWSER":
                return BioinfoUtils.getEnsemblLink(region, "BROWSER", species, assembly);
            case "UCSC_GENOME_BROWSER":
                const hg = assembly?.toUpperCase() === "GRCH38" ? "hg38" : "hg19";
                return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${hg}&position=chr${region}`;
            case "VARSOME":
                return `https://varsome.com/variant/${assembly?.toUpperCase() === "GRCH38" ? "hg38" : "hg19"}/${BioinfoUtils.getVariantInVarsomeFormat(id)}`;
            case "FRANKLIN": {
                // Franklin format: chr{chr}-{pos}-{ref}-{alt}
                const [chr, pos, ref, alt] = id.split(":");
                return `https://franklin.genoox.com/clinical-db/variant/snp/chr${chr}-${pos}-${ref}-${alt}`;
            }
            case "MOBIDETAILS": {
                // MobiDetails VCF format: {chr}-{pos}-{ref}-{alt}
                const [chr, pos, ref, alt] = id.split(":");
                let url = `https://mobidetails.chu-montpellier.fr/api/variant/create_vcf_str?vcf_str=${chr}-${pos}-${ref}-${alt}&caller=browser`;
                try {
                    const keys = JSON.parse(localStorage.getItem("iva.externalApiKeys") || "{}");
                    if (keys.mobidetails) {
                        url += `&api_key=${keys.mobidetails}`;
                    }
                } catch (e) {
                    // ignore localStorage errors
                }
                return url;
            }
        }
    }

    static getGeneLink(geneId, source, species = "hsapiens", assembly = "GRCh38") {
        if (!geneId) {
            return null;
        }

        let s = source;
        if (!s) {
            s = geneId.startsWith("ENSG") ? "ENSEMBL" : "REFSEQ";
        }

        switch (s.toUpperCase()) {
            case "ENSEMBL":
                return BioinfoUtils.getEnsemblLink(geneId, "GENE", species, assembly);
            case "HGNC":
                return "https://www.genenames.org/tools/search/#!/all?query=" + geneId;
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

    static getTranscriptLink(transcriptId, source, species = "hsapiens", assembly = "GRCh38") {
        if (!transcriptId) {
            return null;
        }

        let s = source;
        if (!s) {
            s = transcriptId.startsWith("ENST") ? "ENSEMBL" : "REFSEQ";
        }

        switch (s.toUpperCase()) {
            case "ENSEMBL":
                return BioinfoUtils.getEnsemblLink(transcriptId, "TRANSCRIPT", species, assembly);
            case "REFSEQ":
                return `https://www.ncbi.nlm.nih.gov/gene/?term=${transcriptId}`;
        }
    }

    static getProteinLink(proteinId, source, species = "hsapiens", assembly = "GRCh38") {
        if (!proteinId) {
            return null;
        }

        let s = source;
        if (!s) {
            s = proteinId.startsWith("ENSP") ? "ENSEMBL" : "REFSEQ";
        }

        switch (s.toUpperCase()) {
            case "ENSEMBL":
                return BioinfoUtils.getEnsemblLink(proteinId, "PROTEIN", species, assembly);
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
                    return this.getOmimOntologyLink(id);
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

    // static getOmimLink(omimEntry) {
    //     return `https://www.omim.org/entry/${omimEntry}`;
    // }

    static getSequenceOntologyLink(soTerm) {
        return `http://www.sequenceontology.org/browser/current_svn/term/${soTerm}`;
    }

    static getOmimOntologyLink(soTerm) {
        return `https://www.omim.org/entry/${soTerm}"`;
    }

    /**
     * Fetch phenotype and inheritance information from an OMIM entry page.
     * Note: this may be blocked by CORS when called from a browser without a proxy.
     * @param {string} id - OMIM entry ID (e.g. "618415")
     * @returns {Promise<Object>} JSON with phenotype and inheritance data
     */
    static async getOmimInformation(id) {
        const url = `https://www.omim.org/entry/${id}`;
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        // 1. Extract entry title
        const title = doc.querySelector("h1, h2, h3")?.textContent?.trim() || "";

        // 2. Extract phenotype-gene relationships from the table
        const phenotypes = [];
        const tables = doc.querySelectorAll("table");
        for (const table of tables) {
            const headers = [...table.querySelectorAll("thead th")].map(th => th.textContent.trim());
            if (headers.includes("Phenotype") && headers.includes("Inheritance")) {
                const rows = table.querySelectorAll("tbody tr");
                for (const row of rows) {
                    const cells = [...row.querySelectorAll("td")].map(td => td.textContent.trim());
                    if (cells.length >= 7) {
                        phenotypes.push({
                            location: cells[0],
                            phenotype: cells[1],
                            phenotypeMimNumber: cells[2],
                            inheritance: cells[3],
                            phenotypeMappingKey: cells[4],
                            geneLocus: cells[5],
                            geneLocusMimNumber: cells[6],
                        });
                    }
                }
                break;
            }
        }

        return {
            id,
            title,
            url,
            phenotypes,
        };
    }

    static getOrphanetLink(orphaId) {
        return `https://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert=${orphaId}`;
    }

    static getPharmGKBLink(pharmGKBId) {
        return `https://www.pharmgkb.org/chemical/${pharmGKBId}`;
    }

    static getCellbaseLink(id, type = "VARIANT", host = "https://ws.zettagenomics.com/cellbase", version = "v5", dataRelease = "", apiKey = "", species = "hsapiens", assembly) {
        let url = `${host.replace(/\/$/, "")}/webservices/rest/${version}/${species}`;
        const searchParams = new URLSearchParams();

        // 1. check the resource to generate the correct URL
        switch (type?.toUpperCase()) {
            case "VARIANT":
                url = `${url}/genomic/variant/${id}/annotation`;
                break;
        }

        // 2. check if dataRelease is provided
        if (dataRelease) {
            searchParams.append("dataRelease", dataRelease);
        }

        // 3. check if apiKey is provided
        if (apiKey) {
            searchParams.append("apiKey", apiKey);
        }

        // 4. add assembly if provided
        if (assembly) {
            searchParams.append("assembly", assembly);
        }

        return searchParams.size > 0 ? `${url}?${searchParams.toString()}` : url;
    }

    // alias to getCellbaseLink with type VARIANT
    static getCellbaseVariantLink(id, host, version, dataRelease, apiKey, species, assembly) {
        return BioinfoUtils.getCellbaseLink(id, "VARIANT", host, version, dataRelease, apiKey, species, assembly);
    }

}
