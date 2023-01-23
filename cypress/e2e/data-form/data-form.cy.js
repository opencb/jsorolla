
import UtilsTest from "../../support/utils-test.js";

describe("Data Form Component", () => {

    beforeEach(() => {
        // baseUrl: "http://localhost:3000/src/sites/test-app/",
        cy.visit("#data-form");
    });

    it("should has a title", () => {
        cy.get("#data-form").contains("h3", "General Information", {matchCase: false});
    });

    it("when submit is pressed, input display error for empty field", () => {
        // how to identify btn data-form
        cy.get("button[class='btn btn-primary ']").contains("OK").click();

        // TODO: search all input with require attr and verify is it visible
        cy.get(".has-error").should("be.visible");
    });

    it("should type the first input field", () => {
        UtilsTest.getByDataTest("test1--id", "input").type("testing input fill");
        // cy.get("div[data-test-id='test1--status.description'] textarea").type("testing input fill");

        UtilsTest.getByDataTest("test1--status.description", "textarea").type("testing input fill");
        // cy.get("button[class='btn btn-primary ']").contains("OK").click();
    });

    // Approach #3 to access to type field (More specific field)
    it.skip("should type the first input field", () => {
        // cy.get("label").contains("Sample ID").parents("div[class='row form-group ']").within(()=> {
        //     cy.get("input[type='text']").type("testing input fill");
        // });
        UtilsTest.enterField("Sample ID", "testing values");
        UtilsTest.submitForm();
    });

    it("the second field should be disabled", () => {
        // cy.get("textarea").first().should("be.disabled");
        UtilsTest.getByDataTest("test1--description", "textarea")
            .should("be.disabled");
    });

    // Check each elements
    // Type each elements
    // Add element to the list
    // Remove element to the list
    // check require, validation, disable and others for input

    it("should be fill all fields", () => {
        // cy.get("textarea").first().should("be.disabled");¡
    });

    it("should add item to the object-list", () => {
        // cy.get("textarea").first().should("be.disabled");
    });

    it("should remove item to the object-list", () => {
        // cy.get("textarea").first().should("be.disabled");
    });

});

