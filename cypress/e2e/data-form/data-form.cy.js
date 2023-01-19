
import UtilsTest from "../../support/UtilsTest.js";

describe("Data Form Component", () => {

    beforeEach(() => {
        // baseUrl: "http://localhost:3000/src/sites/test-app/",
        cy.visit("#data-form");
    });

    it.only("should has a title", () => {
        cy.get("#data-form").contains("h3", "General Information", {matchCase: false});
    });

    it("when submit is pressed, input display error for empty field", () => {
        cy.get("button[class='btn btn-primary ']").contains("OK").click();
        // utils.submit();
        cy.get(".has-error").should("be.visible");
    });

    // Approach #1 to access to type field
    it("should type the first input field", () => {
        // cy.get("input[type='text']").first().type("testing input fill");
        UtilsTest.enterField("Sample ID", "testing values");
        // cy.get("button[class='btn btn-primary ']").contains("OK").click();
        // utils.submitForm();
    });

    // Approach #2 to access to type field (More specific field)
    it("should type the first input field", () => {
        cy.get("label").contains("Sample ID").parent().parent().within(()=> {
            cy.get("input[type='text']").type("testing input fill");
        });
    });

    // Approach #2 to access to type field (More specific field)
    it("should type the first input field", () => {
        cy.get("label").contains("Sample ID").parent().parent().within(()=> {
            cy.get("input[type='text']").type("testing input fill");
        });
    });

    // Approach #3 to access to type field (More specific field)
    it("should type the first input field", () => {
        // cy.get("label").contains("Sample ID").parents("div[class='row form-group ']").within(()=> {
        //     cy.get("input[type='text']").type("testing input fill");
        // });
        UtilsTest.enterField("Sample ID", "testing values");
        UtilsTest.submitForm();

    });

    it("the second field should be disabled", () => {
        cy.get("textarea").first().should("be.disabled");
    });

    // it("typing field name", () => {
    // });

    // it("when submit is pressed & all required field has populated should return object", () => {
    // });


});

