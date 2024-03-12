/**
 * Copyright 2015-2020 OpenCB
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * WARNING: AUTOGENERATED CODE
 * 
 * This code was generated by a tool.
 * Autogenerated on: 2024-03-06
 * 
 * Manual changes to this file may cause unexpected behavior in your application.
 * Manual changes to this file will be overwritten if the code is regenerated. 
 *
**/

import OpenCGAParentClass from "./../opencga-parent-class.js";


/**
 * This class contains the methods for the "GA4GH" resource
 */

export default class GA4GH extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Description
    * 
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    searchReads() {
        return this._post("ga4gh", null, "reads", null, "search");
    }

    /** Fetch alignment files using HTSget protocol
    * @param {String} file - File id, name or path.
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.referenceName] - Reference sequence name (Example: 'chr1', '1' or 'chrX'.
    * @param {Number} [params.start] - The start position of the range on the reference, 0-based, inclusive.
    * @param {Number} [params.end] - The end position of the range on the reference, 0-based, exclusive.
    * @param {String} [params.referenceGenome] - Reference genome.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    fetchReads(study, file, params) {
        return this._get("ga4gh/reads", study, null, file, null, params);
    }

    /** Beacon webservice
    * @param {String} chrom - Chromosome ID. Accepted values: 1-22, X, Y, MT. Note: For compatibility with conventions set by some of the
    *     existing beacons, an arbitrary prefix is accepted as well (e.g. chr1 is equivalent to chrom1 and 1).
    * @param {Number} pos - Coordinate within a chromosome. Position is a number and is 0-based.
    * @param {String} allele - Any string of nucleotides A,C,T,G or D, I for deletion and insertion, respectively. Note: For compatibility
    *     with conventions set by some of the existing beacons, DEL and INS identifiers are also accepted.
    * @param {String} beacon - Beacon IDs. If specified, only beacons with the given IDs are queried. Responses from all the supported
    *     beacons are obtained otherwise. Format: [id1,id2].
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.ref] - Genome ID. If not specified, all the genomes supported by the given beacons are queried. Note: For
    *     compatibility with conventions set by some of the existing beacons, both GRC or HG notation are accepted, case insensitive.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    responses(chrom, pos, allele, beacon, params) {
        return this._get("ga4gh", null, null, null, "responses", {chrom, pos, allele, beacon, ...params});
    }

    /** Description
    * 
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    searchVariants() {
        return this._post("ga4gh", null, "variants", null, "search");
    }

}