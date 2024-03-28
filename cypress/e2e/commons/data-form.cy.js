
import UtilsTest from "../../support/utils-test.js";
import { SAMPLE_DATA } from "../../../src/sites/test-app/data/data-example.js";
import moment from "moment";


describe("Data Form Component", () => {

    beforeEach(() => {
        // baseUrl: "http://localhost:3000/src/sites/test-app/",
        cy.visit("#data-form");
    });

    context("Title Text Data Form", () => {
        it("should has a title", () => {
            cy.get("#data-form")
                .find("div", "General Information");
        });
    })

    context("Input Text Field",{tags: "@shortTask"}, () => {
        it("should render string field empty", () => {
            UtilsTest.getByDataTest("test1-inputTextEmpty", "input")
                .should("be.visible")
                .should("be.empty");
        });

        it("should render string field filled", () => {
            UtilsTest.getByDataTest("test1-inputTextFilled", "input")
                .should("be.visible")
                .should("have.value",SAMPLE_DATA.inputTextFilled)
        });

        it("should render string field disabled", () => {
            UtilsTest.getByDataTest("test1-inputTextDisabled", "input")
                .should("be.visible")
                .should("be.disabled");
        });


        it("should render string multiline as textarea empty", () => {
            UtilsTest.getByDataTest("test1-inputDescEmpty", "textarea")
                .should("be.visible")
                .should("have.value","")
        });

        it("should render string multiline as textarea filled", () => {
            UtilsTest.getByDataTest("test1-inputDescFilled", "textarea")
                .should("be.visible")
                .should("have.value",SAMPLE_DATA.inputDescFilled)
        });

        it("should render string multiline as textarea disabled", () => {
            UtilsTest.getByDataTest("test1-inputDescDisabled", "textarea")
                .should("be.visible")
                .should("be.disabled")
        });
    })


    context("Input Number Field",() => {
        it("should render number field empty", () => {
            UtilsTest.getByDataTest("test1-inputNumEmpty", "input")
                .should("have.attr", "type", "number")
                .should("be.visible")
                .should("be.empty")
        });

        it("should render number field filled", () => {
            UtilsTest.getByDataTest("test1-inputNumFilled", "input")
                .should("have.attr", "type", "number")
                .should("be.visible")
                .should("have.value", SAMPLE_DATA.inputNumFilled)
        });

        it("should render number field disabled", () => {
            UtilsTest.getByDataTest("test1-inputNumDisabled", "input")
                .should("have.attr", "type", "number")
                .should("be.visible")
                .should("be.disabled")
        });
    })

    context("Input Date Field",() => {
        it("should render date field empty", () => {
            UtilsTest.getByDataTest("test1-inputDateEmpty", "input")
                .should("have.attr", "type", "date")
                .should("be.visible")
        });

        it("should render date field filled", () => {
            const formatDate = moment(SAMPLE_DATA.inputDateFilled, "YYYY-MM-DD")
                .format("YYYY-MM-DD")
            UtilsTest.getByDataTest("test1-inputDateFilled", "input")
                .should("have.attr", "type", "date")
                .should("be.visible")
                .should("have.value",formatDate)
        });

        it("should render date field disabled", () => {
            UtilsTest.getByDataTest("test1-inputDateDisabled", "input")
                .should("have.attr", "type", "date")
                .should("be.visible")
                .should("be.disabled");
        });
    })

    context("Input Select Field",() => {
        it("should render select field", () => {
            // select2 is not visible because it has CSS property: opacity: 0
            cy.log("### check if select is exist ###");
            UtilsTest.getByDataTest("test1-inputSelect", "select")
                .should("exist");

            cy.log("### check if select have options ###");
            UtilsTest.getByDataTest("test1-inputSelected", "select")
                .find("option")
                .should("have.length", 3);

            cy.log("### check if select have no selected ###");
            UtilsTest.getByDataTest("test1-inputSelected", "select")
                .should("contain","");
        });

        it("should render select field selected", () => {
            // select2 is not visible because it has CSS property: opacity: 0
            cy.log("### check if select is exist ###");
            UtilsTest.getByDataTest("test1-inputSelected", "select")
                .should("exist");

            cy.log("### check if select have options ###");
            UtilsTest.getByDataTest("test1-inputSelected", "select")
                .find("option").should("have.length", 3);

            cy.log("### check if select have option selected ###");
                UtilsTest.getByDataTest("test1-inputSelected", "select")
                    .should("contain",SAMPLE_DATA.inputSelected)
        });
    })

    context("Input Checkbox & Toggle Field", () => {
        it("should render checkbox field", () => {
            UtilsTest.getByDataTest("test1-inputCheckBoxFalse", "input")
                .should("have.attr", "type", "checkbox")
                .should("be.visible")
                .should("not.be.checked")
        });

        it("should render checkbox field", () => {
            UtilsTest.getByDataTest("test1-inputCheckBoxTrue", "input")
                .should("have.attr", "type", "checkbox")
                .should("be.visible")
                .should("be.checked")
        });

        it("should render toggle switch", () => {
            UtilsTest.getByDataTest("test1-inputToggleSwitch","input")
                .should("have.length",2)
        });

        it("should render toggle buttons", () => {
            UtilsTest.getByDataTest("test1-inputToggleButtons","input")
                .should("have.length",3)
        });
    })


    context.only("Complex Field", () => {
        it("should render object list", () => {
            cy.log("Soon! render object list form");
        });

        it("should render object fields", () => {

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

        it("should render a json editor", () => {
            cy.get("json-editor").should("be.visible");
        });

        it("should download button", () => {
            cy.get("download-button").should("be.visible");
        });

        it("should render a custom element", () => {
            UtilsTest.getByDataTest("test1-inputCustom", "div")
                .should("be.visible");
        });

        it("should render object fields", () => {
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

        it("should a table", () => {
            UtilsTest.getByDataTest("test1-inputTable", "table")
                .should("be.visible");
        });

        it("should render 3 simple charts", () => {
            cy.get("simple-chart")
                .should("have.length", 3);
        });

        it("should a chart", () => {
            cy.log("Test Coming Soon");
        });

        it("should a plot from object", () => {
            cy.log("Test Coming Soon");
        });

        it("should a plot from array", () => {
            cy.log("Test Coming Soon");
        });
    });

    // Check each elements
    // Type each elements
    // Add element to the list
    // Remove element to the list
    // check require, validation, disable and others for inputc
    // test: check if generate correctly url
    // it("when submit is pressed, input display error for empty field", () => {
    // how to identify btn data-form
    // search all input with require attr and verify is it visible
    // it("should type the first input field", () => {
    // Approach #3 to access to type field (More specific field)

});

