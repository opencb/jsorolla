import {html} from "lit";
import "../../../src/webcomponents/commons/forms/data-form.js";

describe("Data Form Component", () => {

    beforeEach(() => {
        cy.visit("http://localhost:3000/src/sites/test-app/index.html#data-form");
    });

    // it("should be display a form", () => {
    //     cy.get("#data-form").contains("form");
    // });

    it("should has a title", () => {
        cy.get("#data-form").contains("h3", "GENERAL INFORMATION");
    });

    it("when submit is pressed, input display error for empty field", () => {
        cy.get(".btn-primary").click();
        cy.get(".has-error").should("be.visible");
    });

    it("should type the first input field", () => {
        cy.get("input[type='text']").first().type("testing input fill");
        // cy.get(".btn-primary").click();
        // cy.get("@onSubmitSpy").should("have.been.calledWith", 1);
    });

    // it("typing field name", () => {
    //     //
    // });

    // it("when submit is pressed & all required field has populated should return object", () => {
    //     //
    // });


});

