
import UtilsTest from "../../support/utils-test.js";

describe("Data Form Component", () => {

    beforeEach(() => {
        // baseUrl: "http://localhost:3000/src/sites/test-app/",
        cy.visit("#data-form");
    });

    it("should has a title", () => {
        cy.get("#data-form")
            .find("div", "General Information");
    });

    it("should be render string field", () => {
        UtilsTest.getByDataTest("test1-inputText", "input")
            .should("be.visible");
    });

    it("should be render string multiline as textarea ", () => {
        UtilsTest.getByDataTest("test1-inputDescription", "textarea")
            .should("be.visible");
    });

    it("sould be render string field as disabled", () => {
        UtilsTest.getByDataTest("test1-inputTextDisabled", "input")
            .should("be.disabled");
    });

    it("should be render number field", () => {
        UtilsTest.getByDataTest("test1-inputNum", "input")
            .should("be.visible")
            .and("have.attr", "type", "number");
    });

    it("should be render select field", () => {
        // select2 is not visible because it has CSS property: opacity: 0
        cy.log("### check if select is exist ###");
        UtilsTest.getByDataTest("test1-inputSelect", "select")
            .should("exist");

        cy.log("### check if select have options ###");
        UtilsTest.getByDataTest("test1-inputSelect", "select")
            .find("option").should("have.length", 3);
    });

    it("should be render date field", () => {
        UtilsTest.getByDataTest("test1-inputDate", "input")
            .should("be.visible")
            .and("have.attr", "type", "date");
    });

    it("should be render object list", () => {
        cy.log("Soon! render object list form");
    });

    it("should be render checkbox field", () => {
        UtilsTest.getByDataTest("test1-inputCheckBox", "input")
            .should("be.visible")
            .and("have.attr", "type", "checkbox");
    });

    it("should be render toggle switch", () => {
        cy.get("toggle-switch div[class='btn-group']")
            .find("button")
            .should("have.length", 2);
    });

    it("should be render toggle buttons", () => {
        cy.get("toggle-buttons div[class='btn-group']")
            .find("button")
            .should("have.length", 3);
    });

    it("should be render object fields", () => {

        UtilsTest.getByDataTest("test1-inputObject.text", "input")
            .should("be.visible");
        UtilsTest.getByDataTest("test1-inputObject.description", "textarea")
            .should("be.visible");
        UtilsTest.getByDataTest("test1-inputObject.textDisabled", "input")
            .should("be.disabled");
        UtilsTest.getByDataTest("test1-inputObject.num", "input")
            .should("be.visible")
            .and("have.attr", "type", "number");
        UtilsTest.getByDataTest("test1-inputObject.text", "input")
            .should("be.visible");

        cy.log("### check if select is exist ###");
        UtilsTest.getByDataTest("test1-inputObject.select", "select")
            .should("exist");

        cy.log("### check if select have options ###");
        UtilsTest.getByDataTest("test1-inputObject.select", "select")
            .find("option").should("have.length", 3);

        UtilsTest.getByDataTest("test1-inputObject.date", "input")
            .should("be.visible")
            .and("have.attr", "type", "date");
    });

    it("should be render a json editor", () => {
        cy.get("json-editor").should("be.visible");
    });

    it("should be download button", () => {
        cy.get("download-button").should("be.visible");
    });

    it("should be render a custom element", () => {
        UtilsTest.getByDataTest("test1-inputCustom", "div")
            .should("be.visible");
    });

    it("should be render object fields", () => {
        cy.log("check if object list is visible");
        UtilsTest.getByDataTest("test1-inputObject.list")
            .should("be.visible");

        cy.log("Object List should be open");
        UtilsTest.getByDataTest("test1-inputObject.list", "button")
            .contains("Add Item")
            .click();

        cy.log("Check all element inside object list");
        UtilsTest.getByDataTest("test1-inputObject.list[].0.id", "input")
            .should("be.visible");
        UtilsTest.getByDataTest("test1-inputObject.list[].0.name", "input")
            .should("be.visible");
        UtilsTest.getByDataTest("test1-inputObject.list[].0.description", "textarea")
            .should("be.visible");
        // inputObject.list_0
        UtilsTest.getByDataTest("test1-inputObject.list")
            .eq(0)
            .contains("button", "Close")
            .click();
    });

    it("should be a table", () => {
        cy.get("label").contains("Table Example")
            .parents("div[class='row form-group ']")
            .within(()=> {
                cy.get("table").should("be.visible");
            });
    });

    it("should be render 3 simple charts", () => {
        cy.get("simple-chart")
            .should("have.length", 3);
    });

    it("should be a chart", () => {
        cy.log("Test Coming Soon");
    });

    it("should be a plot from object", () => {
        cy.log("Test Coming Soon");
    });

    it("should be a plot from array", () => {
        cy.log("Test Coming Soon");
    });

        // Check each elements
    // Type each elements
    // Add element to the list
    // Remove element to the list
    // check require, validation, disable and others for inputc

    // test: check if generate correctly url
    // test: check if generate correctly url


    // it("when submit is pressed, input display error for empty field", () => {
    //     // how to identify btn data-form
    //     cy.get("button[class='btn btn-primary ']").contains("OK").click();

    //     // TODO: search all input with require attr and verify is it visible
    //     cy.get(".has-error").should("be.visible");
    // });

    // it("should type the first input field", () => {
    //     UtilsTest.getByDataTest("test1--id", "input").type("testing input fill");
    //     // cy.get("div[data-test-id='test1--status.description'] textarea").type("testing input fill");

    //     UtilsTest.getByDataTest("test1--status.description", "textarea").type("testing input fill");
    //     // cy.get("button[class='btn btn-primary ']").contains("OK").click();
    // });

    // // Approach #3 to access to type field (More specific field)
    // it.skip("should type the first input field", () => {
    //     // cy.get("label").contains("Sample ID").parents("div[class='row form-group ']").within(()=> {
    //     //     cy.get("input[type='text']").type("testing input fill");
    //     // });
    //     UtilsTest.enterField("Sample ID", "testing values");
    //     UtilsTest.submitForm();
    // });

    // it("the second field should be disabled", () => {
    //     // cy.get("textarea").first().should("be.disabled");
    //     UtilsTest.getByDataTest("test1--description", "textarea")
    //         .should("be.disabled");
    // });

});

