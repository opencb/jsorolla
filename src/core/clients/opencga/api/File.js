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
 * Autogenerated on: 2020-07-15 08:52:59
 * 
 * Manual changes to this file may cause unexpected behavior in your application.
 * Manual changes to this file will be overwritten if the code is regenerated. 
 *
**/

import OpenCGAParentClass from "./../opencga-parent-class.js";


/**
 * This class contains the methods for the "File" resource
 */

export default class File extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Update the set of permissions granted for the member
    * @param {String} members - Comma separated list of user or group ids.
    * @param {Object} data - JSON containing the parameters to add ACLs.
    * @param {String} action - Action to be performed [ADD, SET, REMOVE or RESET].
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateAcl(members, action, data, params) {
        return this._post("files", null, "acl", members, "update", data, {action, ...params});
    }

    /** Fetch catalog file stats
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.name] - Name.
    * @param {String} [params.type] - Type.
    * @param {String} [params.format] - Format.
    * @param {String} [params.bioformat] - Bioformat.
    * @param {String} [params.creationYear] - Creation year.
    * @param {String} [params.creationMonth] - Creation month (JANUARY, FEBRUARY...).
    * @param {String} [params.creationDay] - Creation day.
    * @param {String} [params.creationDayOfWeek] - Creation day of week (MONDAY, TUESDAY...).
    * @param {String} [params.status] - Status.
    * @param {String} [params.release] - Release.
    * @param {Boolean} [params.external] - External.
    * @param {String} [params.size] - Size.
    * @param {String} [params.software] - Software.
    * @param {String} [params.experiment] - Experiment.
    * @param {String} [params.numSamples] - Number of samples.
    * @param {String} [params.numRelatedFiles] - Number of related files.
    * @param {String} [params.annotation] - Annotation filters. Example: age>30;gender=FEMALE. For more information, please visit
    *     http://docs.opencb.org/display/opencga/AnnotationSets+1.4.0.
    * @param {Boolean} [params.default = "false"] - Calculate default stats. The default value is false.
    * @param {String} [params.field] - List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.:
    *     studies>>biotype;type;numSamples[0..10]:1.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    aggregationStats(params) {
        return this._get("files", null, null, null, "aggregationStats", params);
    }

    /** Load annotation sets from a TSV file
    * @param {Object} [data] - JSON containing the 'content' of the TSV file if this has not yet been registered into OpenCGA.
    * @param {String} variableSetId - Variable set ID or name.
    * @param {String} path - Path where the TSV file is located in OpenCGA or where it should be located.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.parents] - Flag indicating whether to create parent directories if they don't exist (only when TSV file was
    *     not previously associated).
    * @param {String} [params.annotationSetId] - Annotation set id. If not provided, variableSetId will be used.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("files", null, "annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    /** List of accepted file bioformats
    * 
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    bioformats() {
        return this._get("files", null, null, null, "bioformats");
    }

    /** Create file or folder
    * @param {Object} data - File parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    create(data, params) {
        return this._post("files", null, null, null, "create", data, params);
    }

    /** Download an external file to catalog and register it
    * @param {Object} data - Fetch parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    fetch(data, params) {
        return this._post("files", null, null, null, "fetch", data, params);
    }

    /** List of accepted file formats
    * 
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    formats() {
        return this._get("files", null, null, null, "formats");
    }

    /** Link an external file into catalog.
    * @param {Object} data - File parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.parents] - Create the parent directories if they do not exist.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    link(data, params) {
        return this._post("files", null, null, null, "link", data, params);
    }

    /** File search method.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count = "false"] - Get the total number of results matching the query. Deactivated by default. The default
    *     value is false.
    * @param {Boolean} [params.flattenAnnotations = "false"] - Boolean indicating to flatten the annotations. The default value is false.
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.name] - Comma separated list of file names.
    * @param {String} [params.path] - Comma separated list of paths.
    * @param {String} [params.type] - File type, either FILE or DIRECTORY.
    * @param {String} [params.bioformat] - Comma separated Bioformat values. For existing Bioformats see files/bioformats.
    * @param {String} [params.format] - Comma separated Format values. For existing Formats see files/formats.
    * @param {String} [params.status] - File status.
    * @param {String} [params.directory] - Directory under which we want to look for files or folders.
    * @param {String} [params.creationDate] - Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.description] - Description.
    * @param {String} [params.tags] - Tags.
    * @param {String} [params.size] - File size.
    * @param {String} [params.samples] - Comma separated list sample IDs or UUIDs up to a maximum of 100.
    * @param {String} [params.jobId] - Job ID that created the file(s) or folder(s).
    * @param {String} [params.annotation] - Annotation filters. Example: age>30;gender=FEMALE. For more information, please visit
    *     http://docs.opencb.org/display/opencga/AnnotationSets+1.4.0.
    * @param {String} [params.acl] - Filter entries for which a user has the provided permissions. Format: acl={user}:{permissions}.
    *     Example: acl=john:WRITE,WRITE_ANNOTATIONS will return all entries for which user john has both WRITE and WRITE_ANNOTATIONS
    *     permissions. Only study owners or administrators can query by this field. .
    * @param {Boolean} [params.deleted = "false"] - Boolean to retrieve deleted entries. The default value is false.
    * @param {String} [params.attributes] - Text attributes (Format: sex=male,age>20 ...).
    * @param {String} [params.release] - Release when it was created.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    search(params) {
        return this._get("files", null, null, null, "search", params);
    }

    /** Resource to upload a file by chunks
    * 
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    upload() {
        return this._post("files", null, null, null, "upload");
    }

    /** Return the acl defined for the file or folder. If member is provided, it will only return the acl for the member.
    * @param {String} files - Comma separated list of file IDs or names up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Comma separated list of Studies [[user@]project:]study where study and project can be either the ID
    *     or UUID up to a maximum of 100.
    * @param {String} [params.member] - User or group id.
    * @param {Boolean} [params.silent = "false"] - Boolean to retrieve all possible entries that are queried for, false to raise an
    *     exception whenever one of the entries looked for cannot be shown for whichever reason. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    acl(files, params) {
        return this._get("files", files, null, null, "acl", params);
    }

    /** Delete existing files and folders
    * @param {String} [files] - Comma separated list of file ids, names or paths.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.skipTrash = "false"] - Skip trash and delete the files/folders from disk directly (CANNOT BE RECOVERED). The
    *     default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    delete(files, params) {
        return this._delete("files", files, null, null, "delete", params);
    }

    /** File info
    * @param {String} [files] - Comma separated list of file IDs or names up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.flattenAnnotations = "false"] - Flatten the annotations?. The default value is false.
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.deleted = "false"] - Boolean to retrieve deleted files. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    info(files, params) {
        return this._get("files", files, null, null, "info", params);
    }

    /** Unlink linked files and folders
    * @param {String} [files] - Comma separated list of file ids, names or paths.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    unlink(files, params) {
        return this._delete("files", files, null, null, "unlink", params);
    }

    /** Update some file attributes
    * @param {String} [files] - Comma separated list of file ids, names or paths. Paths must be separated by : instead of /.
    * @param {Object} data - Parameters to modify.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {"ADD"|"SET"|"REMOVE"} [params.samplesAction = "ADD"] - Action to be performed if the array of samples is being updated. The
    *     default value is ADD.
    * @param {"ADD"|"SET"|"REMOVE"} [params.annotationSetsAction = "ADD"] - Action to be performed if the array of annotationSets is being
    *     updated. The default value is ADD.
    * @param {"ADD"|"SET"|"REMOVE"} [params.relatedFilesAction = "ADD"] - Action to be performed if the array of relatedFiles is being
    *     updated. The default value is ADD.
    * @param {"ADD"|"SET"|"REMOVE"} [params.tagsAction = "ADD"] - Action to be performed if the array of tags is being updated. The default
    *     value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    update(files, data, params) {
        return this._post("files", files, null, null, "update", data, params);
    }

    /** Update annotations from an annotationSet
    * @param {String} file - File id, name or path. Paths must be separated by : instead of /.
    * @param {String} [annotationSet] - AnnotationSet ID to be updated.
    * @param {Object} [data] - Json containing the map of annotations when the action is ADD, SET or REPLACE, a json with only the key
    *     'remove' containing the comma separated variables to be removed as a value when the action is REMOVE or a json with only the key
    *     'reset' containing the comma separated variables that will be set to the default value when the action is RESET.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {"ADD"|"SET"|"REMOVE"} [params.action = "ADD"] - Action to be performed: ADD to add new annotations; REPLACE to replace the
    *     value of an already existing annotation; SET to set the new list of annotations removing any possible old annotations; REMOVE to
    *     remove some annotations; RESET to set some annotations to the default value configured in the corresponding variables of the
    *     VariableSet if any. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateAnnotations(file, annotationSet, data, params) {
        return this._post("files", file, "annotationSets", annotationSet, "annotations/update", data, params);
    }

    /** Download file
    * @param {String} [file] - File id, name or path. Paths must be separated by : instead of /.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    download(file, params) {
        return this._get("files", file, null, null, "download", params);
    }

    /** Filter lines of the file containing the pattern
    * @param {String} [file] - File uuid, id, or name.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.pattern] - String pattern.
    * @param {Boolean} [params.ignoreCase] - Flag to perform a case insensitive search.
    * @param {Number} [params.maxCount] - Stop reading a file after 'n' matching lines. 0 means no limit.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    grep(file, params) {
        return this._get("files", file, null, null, "grep", params);
    }

    /** Show the first lines of a file (up to a limit)
    * @param {String} [file] - File uuid, id, or name.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Number} [params.offset] - Starting byte from which the file will be read.
    * @param {Number} [params.lines = "20"] - Maximum number of lines to be returned. The default value is 20.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    head(file, params) {
        return this._get("files", file, null, null, "head", params);
    }

    /** Obtain the base64 content of an image
    * @param {String} [file] - File ID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    image(file, params) {
        return this._get("files", file, null, null, "image", params);
    }

    /** Refresh metadata from the selected file or folder. Return updated files.
    * @param {String} [file] - File id, name or path. Paths must be separated by : instead of /.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    refresh(file, params) {
        return this._get("files", file, null, null, "refresh", params);
    }

    /** Show the last lines of a file (up to a limit)
    * @param {String} [file] - File uuid, id, or name.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Number} [params.lines = "20"] - Maximum number of lines to be returned. The default value is 20.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    tail(file, params) {
        return this._get("files", file, null, null, "tail", params);
    }

    /** List all the files inside the folder
    * @param {String} [folder] - Folder ID, name or path.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count = "false"] - Get the total number of results matching the query. Deactivated by default. The default
    *     value is false.
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    list(folder, params) {
        return this._get("files", folder, null, null, "list", params);
    }

    /** Obtain a tree view of the files and folders within a folder
    * @param {String} [folder] - Folder id or name. Paths must be separated by : instead of /.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - Study [[user@]project:]study where study and project can be either the ID or UUID.
    * @param {Number} [params.maxDepth] - Maximum depth to get files from.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    tree(folder, params) {
        return this._get("files", folder, null, null, "tree", params);
    }

}