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
