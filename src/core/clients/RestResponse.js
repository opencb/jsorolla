/**
 * Copyright 2015-2019 OpenCB
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
 * This class models the response of a RESTful call in OpenCGA.
 */
export class RestResponse {

    /**
     * @param {Object} response The response object
     * @throw {Error} in case of wrong structure
     */
    constructor(response) {
        try {
            this.apiVersion = response.apiVersion;
            this.time = response.time;
            this.events = response.events;
            this.params = response.params;
            this.responses = response.responses || response.response;

            // TODO This is a small hack that can be activated if backward compatibility is needed. This shuold be removed in next 2.1.
            this.params = this.queryOptions = response.params || response.queryOptions;
            this.response = [];
            this.responses.forEach( (response,i) => {
                this.response[i] = response;
                if(response.results) {
                    this.response[i].result = response.results;
                    if(response.time !== undefined) this.response[i].dbTime = response.time;
                    if(response.numMatches !== undefined) this.response[i].numTotalResults = response.numMatches;
                } else {
                    this.response[i].results = response.result;
                }
            });
        } catch(e) {
            console.error(e);
            throw new Error("Unexpected response format");
        }
    }

    /**
     * Return the list of results of the responsePos response.
     * @param {Number} [responsePos=0] The index of the node to get the results from
     * @return {Array} The list of results
     **/
    getResults = (responsePos = 0) => this.responses[responsePos].results;

    /**
     * Return the result object of the specified node (default = 0) and the specified index.
     * @param {Number} resultPos The index of the node to get the results from
     * @param {Number} [responsePos=0] The index of the result
     * @return {Object} The result
     **/
    getResult = (resultPos, responsePos = 0) => this.responses[responsePos].results[resultPos];

    /**
     * Return the list of responses
     * @return {Object}
     */
    getResponses = () => this.responses;

    /**
     * Return the response at the index responsePos
     * @param {Number} responsePos The index of the response
     * @return {Object} The result
     */
    getResponse = (responsePos = 0) => this.responses[responsePos];

    /**
     *  Return all results out of all responses (or a single node in case 'responsePos' is defined) in form of Iterator
     *  Consumer-side usage examples:
     *  <pre><code>
     *      for (let a of responseInstance.resultIterator()) {
     *          console.log(a)
     *      }
     * </code></pre>
     *      let a, it = responseInstance.resultIterator();
     *          while(!(a = it.next()).done) {
     *              console.log(a)
     *          }
     *
     * console.log(...responseInstance.resultIterator())
     *
     */
    *resultIterator(responsePos) {
        if (responsePos) {
            for(let result of this.responses[responsePos].results) {
                yield result;
            }
        } else {
            for(let response of this.responses) {
                for(let result of response.results) {
                    yield result;
                }
            }
        }
    }

    /**
     * Utility function. It maps a result object in the way the param 'fields' defines. Nested properties needs to be defined in dot notation.
     * Consumer-side usage:
     * 1. Accessing the fields 'id', 'name' and 'scientificName' in 'organism'
     *      responseInstance.transformResults("id,name,organism.scientificName")
     *
     * 2. Accessing the fields 'id' and the first 'id' of the array 'studies' in the second node only
     *      responseInstance.transformResults("id,studies.0.id", 1)
     *
     * @param {String} fields The properties of interest
     * @param {Number} responsePos The node index
     * @return {Array} List of mapped result objects
     */
    transformResults(fields, responsePos = 0) {
        /**
         * @param {Object} result Single result Object
         * @param {String} field Field to retrieve in dot notation
         * @return {Object}
         */
        let getField = (result, field) => field.split('.').reduce((o, i) => o ? o[i]: o, result);

        return this.responses[responsePos].result.map( result => {
            return Object.assign({}, ...fields.split(",").map( field => ({[field]: getField(result, field)})));
       })
    }

    /**
     * @param {string} [eventType] The type of the event to be retrieved
     * @return {Object | Array} The retrieved event object or the list of event in case of no eventType defined.
     */
    getEvents(eventType) {
        const eventNames = ['INFO', 'WARNING', 'ERROR'];
        if (!eventType || !this.events.length) {
            return this.events || [];
        } else if (eventNames.includes(eventType)) {
            return this.events.find( event => event.type === eventType);
        } else {
            throw new Error(`Argument "eventType" must be one of the following values: "${eventNames.join(", ")}"`)
        }
    }

    /**
     * @param {String} eventType The type of the event to retieve
     * @param {Number} [responsePos = 0] The node index
     * @return {Array} The list of the events
     * @throw {Error} in case of the param "eventType" is not a valid value
     */
    getResultEvents(eventType, responsePos = 0) {
        const eventNames = ['INFO', 'WARNING', 'ERROR'];
        if(!eventType) {
            return this.responses[responsePos].events || [];
        } else if (eventNames.includes(eventType)) {
            return this.responses[responsePos].events ? this.responses[responsePos].events.filter( event => event.type === eventType) : [];
        } else {
            throw new Error(`Argument "eventType" must be one of the following values: "${eventNames.join(", ")}"`);
        }
    }

    /**
     * Computes the sum for the given property. If 'responsePos' param is provided it counts on that node, it counts in all nodes otherwise.
     * @param {String} attribute The attribute to count
     * @param {Number} [responsePos] The node index
     * @return {Number} The total number
     */
    count(attribute, responsePos) {
        if (responsePos) {
            return this.responses[responsePos][attribute];
        } else {
            return this.responses.reduce((acc, curr) => acc + curr[attribute]);
        }
    }

    /**
     * @param {Number} [responsePos] The node index
     * @return {Number} The total number of matches
     */
    getNumMatches = (responsePos) => this.count("numMatches", responsePos);

    /**
     * @param {Number} [responsePos] The node index
     * @return {Number} The total number of results
     */
    getNumResults = (responsePos) => this.count("numResults", responsePos);

    /**
     * @param {Number} [responsePos] The node index
     * @return {Number} The total number of item inserted
     */
    getNumInserted = (responsePos) => this.count("numInserted", responsePos);

    /**
     * @param {Number} [responsePos] The node index
     * @return {Number} The total number of item updated
     */
    getNumUpdated = (responsePos) => this.count("numUpdated", responsePos);

    /**
     * @param {Number} [responsePos] The node index
     * @return {Number} The total number of item deleted
     */
    getNumDeleted = (responsePos) => this.count("numDeleted", responsePos);

}

// module.exports = exports = RestResponse;
