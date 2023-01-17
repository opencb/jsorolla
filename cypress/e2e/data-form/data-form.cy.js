
describe("Data Form Component", () => {

    beforeEach(() => {
        // baseUrl: "http://localhost:3000/src/sites/test-app/",
        cy.visit("#data-form");
    });

    it("should has a title", () => {
        cy.get("#data-form").contains("h3", "General Information", {matchCase: false});
    });

    it("when submit is pressed, input display error for empty field", () => {
        cy.get("button[class='btn btn-primary ']").contains("OK").click();
        cy.get(".has-error").should("be.visible");
    });

    it("should type the first input field", () => {
        cy.get("input[type='text']").first().type("testing input fill");
        cy.get("button[class='btn btn-primary ']").contains("OK").click();
    });

    it("the second field should be disabled", () => {
        cy.get("textarea").first().should("be.disabled");
    });

    // it("typing field name", () => {
    // });

    // it("when submit is pressed & all required field has populated should return object", () => {
    // });


});

