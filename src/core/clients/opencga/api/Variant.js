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

import OpenCGAParentClass from "./../opencga-parent-class.js";


/**
 * This class contains the methods for the "Variant" resource
 */

export default class Variant extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Calculate and fetch aggregation stats
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.savedFilter] - Use a saved filter at User level.
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.type] - List of types, accepted values are SNV, MNV, INDEL, SV, COPY_NUMBER, COPY_NUMBER_LOSS,
    *     COPY_NUMBER_GAIN, INSERTION, DELETION, DUPLICATION, TANDEM_DUPLICATION, BREAKEND, e.g. SNV,INDEL.
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.study] - Filter variants from the given studies, these can be either the numeric ID or the alias with the
    *     format organization@project:study.
    * @param {String} [params.cohort] - Select variants with calculated stats for the selected cohorts.
    * @param {String} [params.cohortStatsRef] - Reference Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsAlt] - Alternate Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsMaf] - Minor Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsMgf] - Minor Genotype Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsPass] - Filter PASS frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL>0.8.
    * @param {String} [params.missingAlleles] - Number of missing alleles: [{study:}]{cohort}[<|>|<=|>=]{number}.
    * @param {String} [params.missingGenotypes] - Number of missing genotypes: [{study:}]{cohort}[<|>|<=|>=]{number}.
    * @param {String} [params.score] - Filter by variant score: [{study:}]{score}[<|>|<=|>=]{number}.
    * @param {Boolean} [params.annotationExists] - Return only annotated variants.
    * @param {String} [params.gene] - List of genes, most gene IDs are accepted (HGNC, Ensembl gene, ...). This is an alias to 'xref'
    *     parameter.
    * @param {String} [params.ct] - List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578. Accepts aliases
    *     'loss_of_function' and 'protein_altering'.
    * @param {String} [params.xref] - List of any external reference, these can be genes, proteins or variants. Accepted IDs include HGNC,
    *     Ensembl genes, dbSNP, ClinVar, HPO, Cosmic, ...
    * @param {String} [params.biotype] - List of biotypes, e.g. protein_coding.
    * @param {String} [params.proteinSubstitution] - Protein substitution scores include SIFT and PolyPhen. You can query using the score
    *     {protein_score}[<|>|<=|>=]{number} or the description {protein_score}[~=|=]{description} e.g. polyphen>0.1,sift=tolerant.
    * @param {String} [params.conservation] - Filter by conservation score: {conservation_score}[<|>|<=|>=]{number} e.g.
    *     phastCons>0.5,phylop<0.1,gerp>0.1.
    * @param {String} [params.populationFrequencyAlt] - Alternate Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.populationFrequencyRef] - Reference Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.populationFrequencyMaf] - Population minor allele frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.transcriptFlag] - List of transcript flags. e.g. canonical, CCDS, basic, LRG, MANE Select, MANE Plus Clinical,
    *     EGLH_HaemOnc, TSO500.
    * @param {String} [params.geneTraitId] - List of gene trait association id. e.g. "umls:C0007222" , "OMIM:269600".
    * @param {String} [params.go] - List of GO (Gene Ontology) terms. e.g. "GO:0002020".
    * @param {String} [params.expression] - List of tissues of interest. e.g. "lung".
    * @param {String} [params.proteinKeyword] - List of Uniprot protein variant annotation keywords.
    * @param {String} [params.drug] - List of drug names.
    * @param {String} [params.functionalScore] - Functional score: {functional_score}[<|>|<=|>=]{number} e.g. cadd_scaled>5.2 ,
    *     cadd_raw<=0.3.
    * @param {String} [params.clinical] - Clinical source: clinvar, cosmic.
    * @param {String} [params.clinicalSignificance] - Clinical significance: benign, likely_benign, likely_pathogenic, pathogenic.
    * @param {Boolean} [params.clinicalConfirmedStatus] - Clinical confirmed status.
    * @param {String} [params.customAnnotation] - Custom annotation: {key}[<|>|<=|>=]{number} or {key}[~=|=]{text}.
    * @param {String} [params.trait] - List of traits, based on ClinVar, HPO, COSMIC, i.e.: IDs, histologies, descriptions,...
    * @param {String} [params.field] - List of facet fields separated by semicolons, e.g.: studies;type. For nested faceted fields use >>,
    *     e.g.: chromosome>>type;percentile(gerp).
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    aggregationStats(params) {
        return this._get("analysis", null, "variant", null, "aggregationStats", params);
    }

    /** Read variant annotations metadata from any saved versions
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.annotationId] - Annotation identifier.
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    metadataAnnotation(params) {
        return this._get("analysis", null, "variant/annotation", null, "metadata", params);
    }

    /** Query variant annotations from any saved versions
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.id] - List of IDs, these can be rs IDs (dbSNP) or variants in the format chrom:start:ref:alt, e.g.
    *     rs116600158,19:7177679:C:T.
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {String} [params.annotationId] - Annotation identifier.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryAnnotation(params) {
        return this._get("analysis", null, "variant/annotation", null, "query", params);
    }

    /** Generate a Circos plot for a given sample.
    * @param {Object} data - Circos analysis params to customize the plot. These parameters include the title,  the plot density (i.e., the
    *     number of points to display), the general query and the list of tracks. Currently, the supported track types are: COPY-NUMBER, INDEL,
    *     REARRANGEMENT and SNV. In addition, each track can contain a specific query.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runCircos(data, params) {
        return this._post("analysis", null, "variant/circos", null, "run", data, params);
    }

    /** Delete cohort variant stats from a cohort.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @param {String} [params.cohort] - Cohort ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    deleteCohortStats(params) {
        return this._delete("analysis", null, "variant/cohort/stats", null, "delete", params);
    }

    /** Read cohort variant stats from list of cohorts.
    * @param {String} cohort - Comma separated list of cohort IDs or UUIDs up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    infoCohortStats(cohort, params) {
        return this._get("analysis", null, "variant/cohort/stats", null, "info", {cohort, ...params});
    }

    /** Compute cohort variant stats for the selected list of samples.
    * @param {Object} data - Cohort variant stats params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runCohortStats(data, params) {
        return this._post("analysis", null, "variant/cohort/stats", null, "run", data, params);
    }

    /** The Exomiser is a Java program that finds potential disease-causing variants from whole-exome or whole-genome sequencing data.
    * @param {Object} data - Exomiser parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runExomiser(data, params) {
        return this._post("analysis", null, "variant/exomiser", null, "run", data, params);
    }

    /** Filter and export variants from the variant storage to a file
    * @param {Object} data - Variant export params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runExport(data, params) {
        return this._post("analysis", null, "variant/export", null, "run", data, params);
    }

    /** Calculate the possible genotypes for the members of a family
    * @param {"AUTOSOMAL_DOMINANT AUTOSOMAL_RECESSIVE X_LINKED_DOMINANT X_LINKED_RECESSIVE Y_LINKED MITOCHONDRIAL DE_NOVO MENDELIAN_ERROR
    *     COMPOUND_HETEROZYGOUS UNKNOWN"} modeOfInheritance = "MONOALLELIC" - Mode of inheritance. The default value is MONOALLELIC.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.family] - Family id.
    * @param {String} [params.clinicalAnalysis] - Clinical analysis id.
    * @param {"COMPLETE INCOMPLETE UNKNOWN"} [params.penetrance = "COMPLETE"] - Penetrance. The default value is COMPLETE.
    * @param {String} [params.disorder] - Disorder id.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    genotypesFamily(modeOfInheritance, params) {
        return this._get("analysis", null, "variant/family", null, "genotypes", {modeOfInheritance, ...params});
    }

    /** Run quality control (QC) for a given family. It computes the relatedness scores among the family members
    * @param {Object} data - Family QC analysis params. Family ID. Relatedness method, by default 'PLINK/IBD'. Minor  allele frequence (MAF)
    *     is used to filter variants before computing relatedness, e.g.: 1000G:CEU>0.35 or cohort:ALL>0.05.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runFamilyQc(data, params) {
        return this._post("analysis", null, "variant/family/qc", null, "run", data, params);
    }

    /**  [DEPRECATED] Use operation/variant/delete
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.file] - Files to remove.
    * @param {Boolean} [params.resume] - Resume a previously failed indexation.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    deleteFile(params) {
        return this._delete("analysis", null, "variant/file", null, "delete", params);
    }

    /** GATK is a Genome Analysis Toolkit for variant discovery in high-throughput sequencing data. Supported Gatk commands: HaplotypeCaller
    * @param {Object} data - Gatk parameters. Supported Gatk commands: HaplotypeCaller.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runGatk(data, params) {
        return this._post("analysis", null, "variant/gatk", null, "run", data, params);
    }

    /** Generate a genome plot for a given sample.
    * @param {Object} data - Genome plot analysis params to customize the plot. The configuration file includes the title,  the plot density
    *     (i.e., the number of points to display), the general query and the list of tracks. Currently, the supported track types are: COPY-
    *     NUMBER, INDEL, REARRANGEMENT and SNV. In addition, each track can contain a specific query.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runGenomePlot(data, params) {
        return this._post("analysis", null, "variant/genomePlot", null, "run", data, params);
    }

    /** Run a Genome Wide Association Study between two cohorts.
    * @param {Object} data - Gwas analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runGwas(data, params) {
        return this._post("analysis", null, "variant/gwas", null, "run", data, params);
    }

    /** Run HRDetect analysis for a given somatic sample.
    * @param {Object} data - HRDetect analysis parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runHrDetect(data, params) {
        return this._post("analysis", null, "variant/hrDetect", null, "run", data, params);
    }

    /**  [DEPRECATED] Use operation/variant/index
    * @param {Object} data - Variant index params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runIndex(data, params) {
        return this._post("analysis", null, "variant/index", null, "run", data, params);
    }

    /** Run quality control (QC) for a given individual. It includes inferred sex and  mendelian errors (UDP)
    * @param {Object} data - Individual QC analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runIndividualQc(data, params) {
        return this._post("analysis", null, "variant/individual/qc", null, "run", data, params);
    }

    /** Infer sex from chromosome mean coverages.
    * @param {Object} data - Inferred sex analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runInferredSex(data, params) {
        return this._post("analysis", null, "variant/inferredSex", null, "run", data, params);
    }

    /** Fetch values from KnockoutAnalysis result, by genes
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {String} [params.study] - study.
    * @param {String} [params.job] - Job ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryKnockoutGene(params) {
        return this._get("analysis", null, "variant/knockout/gene", null, "query", params);
    }

    /** Fetch values from KnockoutAnalysis result, by individuals
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {String} [params.study] - study.
    * @param {String} [params.job] - Job ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryKnockoutIndividual(params) {
        return this._get("analysis", null, "variant/knockout/individual", null, "query", params);
    }

    /** Obtains the list of knocked out genes for each sample.
    * @param {Object} data - Gene knockout analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runKnockout(data, params) {
        return this._post("analysis", null, "variant/knockout", null, "run", data, params);
    }

    /** Run mendelian error analysis to infer uniparental disomy regions.
    * @param {Object} data - Mendelian error analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runMendelianError(data, params) {
        return this._post("analysis", null, "variant/mendelianError", null, "run", data, params);
    }

    /**
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.study] - Filter variants from the given studies, these can be either the numeric ID or the alias with the
    *     format organization@project:study.
    * @param {String} [params.file] - Filter variants from the files specified. This will set includeFile parameter when not provided.
    * @param {String} [params.sample] - Filter variants by sample genotype. This will automatically set 'includeSample' parameter when not
    *     provided. This filter accepts multiple 3 forms: 1) List of samples: Samples that contain the main variant. Accepts AND (;) and OR (,)
    *     operators.  e.g. HG0097,HG0098 . 2) List of samples with genotypes: {sample}:{gt1},{gt2}. Accepts AND (;) and OR (,) operators.  e.g.
    *     HG0097:0/0;HG0098:0/1,1/1 . Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice
    *     versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with
    *     genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT, HET_MISS and MISS  e.g.
    *     HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3) Sample with segregation mode: {sample}:{segregation}. Only one sample accepted.Accepted
    *     segregation modes: [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo,
    *     deNovoStrict, mendelianError, compoundHeterozygous ]. Value is case insensitive. e.g. HG0097:DeNovo Sample must have parents defined
    *     and indexed. .
    * @param {String} [params.includeStudy] - List of studies to include in the result. Accepts 'all' and 'none'.
    * @param {String} [params.includeFile] - List of files to be returned. Accepts 'all' and 'none'. If undefined, automatically includes
    *     files used for filtering. If none, no file is included.
    * @param {String} [params.includeSample] - List of samples to be included in the result. Accepts 'all' and 'none'. If undefined,
    *     automatically includes samples used for filtering. If none, no sample is included.
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    metadata(params) {
        return this._get("analysis", null, "variant", null, "metadata", params);
    }

    /** Run mutational signature analysis for a given sample. Use context index.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Filter variants from the given studies, these can be either the numeric ID or the alias with the
    *     format organization@project:study.
    * @param {String} [params.sample] - Sample name.
    * @param {String} [params.type] - Variant type. Valid values: SNV, SV.
    * @param {String} [params.ct] - List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578. Accepts aliases
    *     'loss_of_function' and 'protein_altering'.
    * @param {String} [params.biotype] - List of biotypes, e.g. protein_coding.
    * @param {String} [params.fileData] - Filter by file data (i.e. FILTER, QUAL and INFO columns from VCF file).
    *     [{file}:]{key}{op}{value}[,;]* . If no file is specified, will use all files from "file" filter. e.g. AN>200 or
    *     file_1.vcf:AN>200;file_2.vcf:AN<10 . Many fields can be combined. e.g. file_1.vcf:AN>200;DB=true;file_2.vcf:AN<10,FILTER=PASS,LowDP.
    * @param {String} [params.filter] - Specify the FILTER for any of the files. If 'file' filter is provided, will match the file and the
    *     filter. e.g.: PASS,LowGQX.
    * @param {String} [params.qual] - Specify the QUAL for any of the files. If 'file' filter is provided, will match the file and the qual.
    *     e.g.: >123.4.
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.gene] - List of genes, most gene IDs are accepted (HGNC, Ensembl gene, ...). This is an alias to 'xref'
    *     parameter.
    * @param {String} [params.panel] - Filter by genes from the given disease panel.
    * @param {String} [params.panelModeOfInheritance] - Filter genes from specific panels that match certain mode of inheritance. Accepted
    *     values : [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo, mendelianError,
    *     compoundHeterozygous ].
    * @param {String} [params.panelConfidence] - Filter genes from specific panels that match certain confidence. Accepted values : [ high,
    *     medium, low, rejected ].
    * @param {String} [params.panelFeatureType] - Filter elements from specific panels by type. Accepted values : [ gene, region, str,
    *     variant ].
    * @param {String} [params.panelRoleInCancer] - Filter genes from specific panels that match certain role in cancer. Accepted values : [
    *     both, oncogene, tumorSuppressorGene, fusion ].
    * @param {Boolean} [params.panelIntersection] - Intersect panel genes and regions with given genes and regions from que input query.
    *     This will prevent returning variants from regions out of the panel.
    * @param {String} [params.msId] - Signature ID.
    * @param {String} [params.msDescription] - Signature description.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryMutationalSignature(params) {
        return this._get("analysis", null, "variant/mutationalSignature", null, "query", params);
    }

    /** Run mutational signature analysis for a given sample.
    * @param {Object} data - Mutational signature analysis parameters to index the genome context for that sample, and to compute both
    *     catalogue counts and signature fitting. In order to skip one of them, , use the following keywords: , catalogue, fitting.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runMutationalSignature(data, params) {
        return this._post("analysis", null, "variant/mutationalSignature", null, "run", data, params);
    }

    /** Plink is a whole genome association analysis toolset, designed to perform a range of basic, large-scale analyses.
    * @param {Object} data - Plink params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runPlink(data, params) {
        return this._post("analysis", null, "variant/plink", null, "run", data, params);
    }

    /** Filter and fetch variants from indexed VCF files in the variant storage
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {Boolean} [params.sort] - Sort the results.
    * @param {Boolean} [params.summary] - Fast fetch of main variant parameters.
    * @param {Boolean} [params.approximateCount] - Get an approximate count, instead of an exact total count. Reduces execution time.
    * @param {Number} [params.approximateCountSamplingSize] - Sampling size to get the approximate count. Larger values increase accuracy
    *     but also increase execution time.
    * @param {String} [params.savedFilter] - Use a saved filter at User level.
    * @param {String} [params.id] - List of IDs, these can be rs IDs (dbSNP) or variants in the format chrom:start:ref:alt, e.g.
    *     rs116600158,19:7177679:C:T.
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.type] - List of types, accepted values are SNV, MNV, INDEL, SV, COPY_NUMBER, COPY_NUMBER_LOSS,
    *     COPY_NUMBER_GAIN, INSERTION, DELETION, DUPLICATION, TANDEM_DUPLICATION, BREAKEND, e.g. SNV,INDEL.
    * @param {String} [params.reference] - Reference allele.
    * @param {String} [params.alternate] - Main alternate allele.
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.study] - Filter variants from the given studies, these can be either the numeric ID or the alias with the
    *     format organization@project:study.
    * @param {String} [params.file] - Filter variants from the files specified. This will set includeFile parameter when not provided.
    * @param {String} [params.filter] - Specify the FILTER for any of the files. If 'file' filter is provided, will match the file and the
    *     filter. e.g.: PASS,LowGQX.
    * @param {String} [params.qual] - Specify the QUAL for any of the files. If 'file' filter is provided, will match the file and the qual.
    *     e.g.: >123.4.
    * @param {String} [params.fileData] - Filter by file data (i.e. FILTER, QUAL and INFO columns from VCF file).
    *     [{file}:]{key}{op}{value}[,;]* . If no file is specified, will use all files from "file" filter. e.g. AN>200 or
    *     file_1.vcf:AN>200;file_2.vcf:AN<10 . Many fields can be combined. e.g. file_1.vcf:AN>200;DB=true;file_2.vcf:AN<10,FILTER=PASS,LowDP.
    * @param {String} [params.sample] - Filter variants by sample genotype. This will automatically set 'includeSample' parameter when not
    *     provided. This filter accepts multiple 3 forms: 1) List of samples: Samples that contain the main variant. Accepts AND (;) and OR (,)
    *     operators.  e.g. HG0097,HG0098 . 2) List of samples with genotypes: {sample}:{gt1},{gt2}. Accepts AND (;) and OR (,) operators.  e.g.
    *     HG0097:0/0;HG0098:0/1,1/1 . Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice
    *     versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with
    *     genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT, HET_MISS and MISS  e.g.
    *     HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3) Sample with segregation mode: {sample}:{segregation}. Only one sample accepted.Accepted
    *     segregation modes: [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo,
    *     deNovoStrict, mendelianError, compoundHeterozygous ]. Value is case insensitive. e.g. HG0097:DeNovo Sample must have parents defined
    *     and indexed. .
    * @param {String} [params.genotype] - Samples with a specific genotype: {samp_1}:{gt_1}(,{gt_n})*(;{samp_n}:{gt_1}(,{gt_n})*)* e.g.
    *     HG0097:0/0;HG0098:0/1,1/1. Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice
    *     versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with
    *     genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT, HET_MISS and MISS  e.g.
    *     HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT. This will automatically set 'includeSample' parameter when not provided.
    * @param {String} [params.sampleData] - Filter by any SampleData field from samples. [{sample}:]{key}{op}{value}[,;]* . If no sample is
    *     specified, will use all samples from "sample" or "genotype" filter. e.g. DP>200 or HG0097:DP>200,HG0098:DP<10 . Many FORMAT fields can
    *     be combined. e.g. HG0097:DP>200;GT=1/1,0/1,HG0098:DP<10.
    * @param {String} [params.sampleAnnotation] - Selects some samples using metadata information from Catalog. e.g.
    *     age>20;phenotype=hpo:123,hpo:456;name=smith.
    * @param {Boolean} [params.sampleMetadata] - Return the samples metadata group by study. Sample names will appear in the same order as
    *     their corresponding genotypes.
    * @param {String} [params.unknownGenotype] - Returned genotype for unknown genotypes. Common values: [0/0, 0|0, ./.].
    * @param {Number} [params.sampleLimit] - Limit the number of samples to be included in the result.
    * @param {Number} [params.sampleSkip] - Skip some samples from the result. Useful for sample pagination.
    * @param {String} [params.cohort] - Select variants with calculated stats for the selected cohorts.
    * @param {String} [params.cohortStatsRef] - Reference Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsAlt] - Alternate Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsMaf] - Minor Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsMgf] - Minor Genotype Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsPass] - Filter PASS frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL>0.8.
    * @param {String} [params.missingAlleles] - Number of missing alleles: [{study:}]{cohort}[<|>|<=|>=]{number}.
    * @param {String} [params.missingGenotypes] - Number of missing genotypes: [{study:}]{cohort}[<|>|<=|>=]{number}.
    * @param {String} [params.score] - Filter by variant score: [{study:}]{score}[<|>|<=|>=]{number}.
    * @param {String} [params.family] - Filter variants where any of the samples from the given family contains the variant (HET or
    *     HOM_ALT).
    * @param {String} [params.familyDisorder] - Specify the disorder to use for the family segregation.
    * @param {String} [params.familySegregation] - Filter by segregation mode from a given family. Accepted values: [ autosomalDominant,
    *     autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo, deNovoStrict, mendelianError,
    *     compoundHeterozygous ].
    * @param {String} [params.familyMembers] - Sub set of the members of a given family.
    * @param {String} [params.familyProband] - Specify the proband child to use for the family segregation.
    * @param {String} [params.includeStudy] - List of studies to include in the result. Accepts 'all' and 'none'.
    * @param {String} [params.includeFile] - List of files to be returned. Accepts 'all' and 'none'. If undefined, automatically includes
    *     files used for filtering. If none, no file is included.
    * @param {String} [params.includeSample] - List of samples to be included in the result. Accepts 'all' and 'none'. If undefined,
    *     automatically includes samples used for filtering. If none, no sample is included.
    * @param {String} [params.includeSampleData] - List of Sample Data keys (i.e. FORMAT column from VCF file) from Sample Data to include
    *     in the output. e.g: DP,AD. Accepts 'all' and 'none'.
    * @param {String} [params.includeGenotype] - Include genotypes, apart of other formats defined with includeFormat.
    * @param {String} [params.includeSampleId] - Include sampleId on each result.
    * @param {Boolean} [params.annotationExists] - Return only annotated variants.
    * @param {String} [params.gene] - List of genes, most gene IDs are accepted (HGNC, Ensembl gene, ...). This is an alias to 'xref'
    *     parameter.
    * @param {String} [params.ct] - List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578. Accepts aliases
    *     'loss_of_function' and 'protein_altering'.
    * @param {String} [params.xref] - List of any external reference, these can be genes, proteins or variants. Accepted IDs include HGNC,
    *     Ensembl genes, dbSNP, ClinVar, HPO, Cosmic, ...
    * @param {String} [params.biotype] - List of biotypes, e.g. protein_coding.
    * @param {String} [params.proteinSubstitution] - Protein substitution scores include SIFT and PolyPhen. You can query using the score
    *     {protein_score}[<|>|<=|>=]{number} or the description {protein_score}[~=|=]{description} e.g. polyphen>0.1,sift=tolerant.
    * @param {String} [params.conservation] - Filter by conservation score: {conservation_score}[<|>|<=|>=]{number} e.g.
    *     phastCons>0.5,phylop<0.1,gerp>0.1.
    * @param {String} [params.populationFrequencyAlt] - Alternate Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.populationFrequencyRef] - Reference Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.populationFrequencyMaf] - Population minor allele frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.transcriptFlag] - List of transcript flags. e.g. canonical, CCDS, basic, LRG, MANE Select, MANE Plus Clinical,
    *     EGLH_HaemOnc, TSO500.
    * @param {String} [params.geneTraitId] - List of gene trait association id. e.g. "umls:C0007222" , "OMIM:269600".
    * @param {String} [params.go] - List of GO (Gene Ontology) terms. e.g. "GO:0002020".
    * @param {String} [params.expression] - List of tissues of interest. e.g. "lung".
    * @param {String} [params.proteinKeyword] - List of Uniprot protein variant annotation keywords.
    * @param {String} [params.drug] - List of drug names.
    * @param {String} [params.functionalScore] - Functional score: {functional_score}[<|>|<=|>=]{number} e.g. cadd_scaled>5.2 ,
    *     cadd_raw<=0.3.
    * @param {String} [params.clinical] - Clinical source: clinvar, cosmic.
    * @param {String} [params.clinicalSignificance] - Clinical significance: benign, likely_benign, likely_pathogenic, pathogenic.
    * @param {Boolean} [params.clinicalConfirmedStatus] - Clinical confirmed status.
    * @param {String} [params.customAnnotation] - Custom annotation: {key}[<|>|<=|>=]{number} or {key}[~=|=]{text}.
    * @param {String} [params.panel] - Filter by genes from the given disease panel.
    * @param {String} [params.panelModeOfInheritance] - Filter genes from specific panels that match certain mode of inheritance. Accepted
    *     values : [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo, mendelianError,
    *     compoundHeterozygous ].
    * @param {String} [params.panelConfidence] - Filter genes from specific panels that match certain confidence. Accepted values : [ high,
    *     medium, low, rejected ].
    * @param {String} [params.panelRoleInCancer] - Filter genes from specific panels that match certain role in cancer. Accepted values : [
    *     both, oncogene, tumorSuppressorGene, fusion ].
    * @param {String} [params.panelFeatureType] - Filter elements from specific panels by type. Accepted values : [ gene, region, str,
    *     variant ].
    * @param {Boolean} [params.panelIntersection] - Intersect panel genes and regions with given genes and regions from que input query.
    *     This will prevent returning variants from regions out of the panel.
    * @param {String} [params.trait] - List of traits, based on ClinVar, HPO, COSMIC, i.e.: IDs, histologies, descriptions,...
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    query(params) {
        return this._get("analysis", null, "variant", null, "query", params);
    }

    /** Compute a score to quantify relatedness between samples.
    * @param {Object} data - Relatedness analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runRelatedness(data, params) {
        return this._post("analysis", null, "variant/relatedness", null, "run", data, params);
    }

    /** Rvtests is a flexible software package for genetic association studies. Supported RvTests commands: rvtest, vcf2kinship
    * @param {Object} data - RvTests parameters. Supported RvTests commands: rvtest, vcf2kinship.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - study.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runRvtests(data, params) {
        return this._post("analysis", null, "variant/rvtests", null, "run", data, params);
    }

    /** Calculate and fetch sample aggregation stats
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.savedFilter] - Use a saved filter at User level.
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.type] - List of types, accepted values are SNV, MNV, INDEL, SV, COPY_NUMBER, COPY_NUMBER_LOSS,
    *     COPY_NUMBER_GAIN, INSERTION, DELETION, DUPLICATION, TANDEM_DUPLICATION, BREAKEND, e.g. SNV,INDEL.
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.study] - Filter variants from the given studies, these can be either the numeric ID or the alias with the
    *     format organization@project:study.
    * @param {String} [params.file] - Filter variants from the files specified. This will set includeFile parameter when not provided.
    * @param {String} [params.filter] - Specify the FILTER for any of the files. If 'file' filter is provided, will match the file and the
    *     filter. e.g.: PASS,LowGQX.
    * @param {String} [params.sample] - Filter variants by sample genotype. This will automatically set 'includeSample' parameter when not
    *     provided. This filter accepts multiple 3 forms: 1) List of samples: Samples that contain the main variant. Accepts AND (;) and OR (,)
    *     operators.  e.g. HG0097,HG0098 . 2) List of samples with genotypes: {sample}:{gt1},{gt2}. Accepts AND (;) and OR (,) operators.  e.g.
    *     HG0097:0/0;HG0098:0/1,1/1 . Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice
    *     versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with
    *     genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT, HET_MISS and MISS  e.g.
    *     HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3) Sample with segregation mode: {sample}:{segregation}. Only one sample accepted.Accepted
    *     segregation modes: [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo,
    *     deNovoStrict, mendelianError, compoundHeterozygous ]. Value is case insensitive. e.g. HG0097:DeNovo Sample must have parents defined
    *     and indexed. .
    * @param {String} [params.genotype] - Samples with a specific genotype: {samp_1}:{gt_1}(,{gt_n})*(;{samp_n}:{gt_1}(,{gt_n})*)* e.g.
    *     HG0097:0/0;HG0098:0/1,1/1. Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice
    *     versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with
    *     genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT, HET_MISS and MISS  e.g.
    *     HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT. This will automatically set 'includeSample' parameter when not provided.
    * @param {String} [params.sampleAnnotation] - Selects some samples using metadata information from Catalog. e.g.
    *     age>20;phenotype=hpo:123,hpo:456;name=smith.
    * @param {String} [params.family] - Filter variants where any of the samples from the given family contains the variant (HET or
    *     HOM_ALT).
    * @param {String} [params.familyDisorder] - Specify the disorder to use for the family segregation.
    * @param {String} [params.familySegregation] - Filter by segregation mode from a given family. Accepted values: [ autosomalDominant,
    *     autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo, deNovoStrict, mendelianError,
    *     compoundHeterozygous ].
    * @param {String} [params.familyMembers] - Sub set of the members of a given family.
    * @param {String} [params.familyProband] - Specify the proband child to use for the family segregation.
    * @param {String} [params.ct] - List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578. Accepts aliases
    *     'loss_of_function' and 'protein_altering'.
    * @param {String} [params.biotype] - List of biotypes, e.g. protein_coding.
    * @param {String} [params.populationFrequencyAlt] - Alternate Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.clinical] - Clinical source: clinvar, cosmic.
    * @param {String} [params.clinicalSignificance] - Clinical significance: benign, likely_benign, likely_pathogenic, pathogenic.
    * @param {Boolean} [params.clinicalConfirmedStatus] - Clinical confirmed status.
    * @param {String} [params.field] - List of facet fields separated by semicolons, e.g.: studies;type. For nested faceted fields use >>,
    *     e.g.: chromosome>>type . Accepted values: chromosome, type, genotype, consequenceType, biotype, clinicalSignificance, dp, qual,
    *     filter.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    aggregationStatsSample(params) {
        return this._get("analysis", null, "variant/sample", null, "aggregationStats", params);
    }

    /** Filter samples by a complex query involving metadata and variants data
    * @param {Object} data - .
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runSampleEligibility(data, params) {
        return this._post("analysis", null, "variant/sample/eligibility", null, "run", data, params);
    }

    /** Run quality control (QC) for a given sample. It includes variant stats, and if the sample is somatic, mutational signature and genome
    * plot are calculated.
    * @param {Object} data - Sample QC analysis params. Mutational signature and genome plot are calculated for somatic samples only. In
    *     order to skip some metrics, use the following keywords (separated by commas): variant-stats, signature, signature-catalogue,
    *     signature-fitting, genome-plot.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runSampleQc(data, params) {
        return this._post("analysis", null, "variant/sample/qc", null, "run", data, params);
    }

    /** Get sample data of a given variant
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {String} [params.variant] - Variant.
    * @param {String} [params.study] - Study where all the samples belong to.
    * @param {String} [params.genotype] - Genotypes that the sample must have to be selected.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    querySample(params) {
        return this._get("analysis", null, "variant/sample", null, "query", params);
    }

    /** Get samples given a set of variants
    * @param {Object} data - Sample variant filter params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runSample(data, params) {
        return this._post("analysis", null, "variant/sample", null, "run", data, params);
    }

    /** Obtain sample variant stats from a sample.
    * @param {String} sample - Sample ID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.type] - List of types, accepted values are SNV, MNV, INDEL, SV, COPY_NUMBER, COPY_NUMBER_LOSS,
    *     COPY_NUMBER_GAIN, INSERTION, DELETION, DUPLICATION, TANDEM_DUPLICATION, BREAKEND, e.g. SNV,INDEL.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.file] - Filter variants from the files specified. This will set includeFile parameter when not provided.
    * @param {String} [params.filter] - Specify the FILTER for any of the files. If 'file' filter is provided, will match the file and the
    *     filter. e.g.: PASS,LowGQX.
    * @param {String} [params.sampleData] - Filter by any SampleData field from samples. [{sample}:]{key}{op}{value}[,;]* . If no sample is
    *     specified, will use all samples from "sample" or "genotype" filter. e.g. DP>200 or HG0097:DP>200,HG0098:DP<10 . Many FORMAT fields can
    *     be combined. e.g. HG0097:DP>200;GT=1/1,0/1,HG0098:DP<10.
    * @param {String} [params.ct] - List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578. Accepts aliases
    *     'loss_of_function' and 'protein_altering'.
    * @param {String} [params.biotype] - List of biotypes, e.g. protein_coding.
    * @param {String} [params.transcriptFlag] - List of transcript flags. e.g. canonical, CCDS, basic, LRG, MANE Select, MANE Plus Clinical,
    *     EGLH_HaemOnc, TSO500.
    * @param {String} [params.populationFrequencyAlt] - Alternate Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.clinical] - Clinical source: clinvar, cosmic.
    * @param {String} [params.clinicalSignificance] - Clinical significance: benign, likely_benign, likely_pathogenic, pathogenic.
    * @param {Boolean} [params.clinicalConfirmedStatus] - Clinical confirmed status.
    * @param {Boolean} [params.filterTranscript] - Do filter transcripts when obtaining transcript counts.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    querySampleStats(sample, params) {
        return this._get("analysis", null, "variant/sample/stats", null, "query", {sample, ...params});
    }

    /** Compute sample variant stats for the selected list of samples.
    * @param {Object} data - Sample variant stats params. Use index=true and indexId='' to store the result in catalog sample QC.
    *     indexId=ALL requires an empty query. Use sample=all to compute sample stats of all samples in the variant storage.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runSampleStats(data, params) {
        return this._post("analysis", null, "variant/sample/stats", null, "run", data, params);
    }

    /** Export calculated variant stats and frequencies
    * @param {Object} data - Variant stats export params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runStatsExport(data, params) {
        return this._post("analysis", null, "variant/stats/export", null, "run", data, params);
    }

    /** Compute variant stats for any cohort and any set of variants.
    * @param {Object} data - Variant stats params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runStats(data, params) {
        return this._post("analysis", null, "variant/stats", null, "run", data, params);
    }

}
