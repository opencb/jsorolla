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

import {OpenCGAClient} from "../opencga-client.js";
import Admin from "./../api/Admin.js";

//jest.mock("../opencga-client.js");

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    //OpenCGAClient.mockClear();
});
//beforeAll( () => console.log("before each"));


describe("OpenCGAClient", () => {
    it("should create an OpenCGAClient instance", function() {
        const client = new OpenCGAClient();
        //expect(OpenCGAClient).toHaveBeenCalledTimes(1);
        expect(client).toBeInstanceOf(OpenCGAClient);
    });

    it("should create an Admin client instance", function() {
        const client = new OpenCGAClient();
        expect(client.admin()).toBeInstanceOf(Admin);
    });


});
