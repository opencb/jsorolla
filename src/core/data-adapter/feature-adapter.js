
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

export default class FeatureAdapter {

    constructor(options) {
        this.options = options;
        // this.handlers = handlers;

        // if (!this.options.hasOwnProperty("chunkSize")) {
        //     this.options.chunkSize = 10000;
        // }
        //
        // // Extend backbone events
        // Object.assign(this, Backbone.Events);
        // // _.extend(this, args);
        // this.on(this.handlers);
    }

    _checkRegion(region) {
        // Check region is a valid object
        if (region === undefined || region === null) {
            return undefined;
        }

        // Check start is >= 1
        region.start = Math.max(region.start, 1);

        // Check end >= start
        if (region.start > region.end) {
            console.warn("Swapping start and end positions: ", region);
            [region.start, region.end] = [region.end, region.start];
        }

        return region;
    }

    // This function must be implemented by any child
    getData() {

    }

}
