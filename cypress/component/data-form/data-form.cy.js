import {html} from "lit";
import "../../../src/webcomponents/commons/forms/data-form.js";

describe("Lit mount dataForm", () => {
    // each test have acces to this variable here
    const data = {};
    const configDataForm = {
        type: "form",
        sections: [
            {
                title: "General Information",
                elements: [
                    {
                        id: "cohortIdInput",
                        title: "Cohort ID",
                        field: "id",
                        type: "input-text",
                        required: true,
                        display: {
                            placeholder: "Add a short ID...",
                            helpMessage: "short Sample id",
                        },
                    },
                    {
                        title: "Description",
                        field: "description",
                        type: "input-text",
                        display: {
                            rows: 3,
                            placeholder: "Add a cohort description...",
                        },
                    },
                    {
                        title: "Status",
                        field: "status",
                        type: "object",
                        elements: [
                            {
                                title: "ID",
                                field: "status.id",
                                type: "input-text",
                                display: {
                                    placeholder: "Add an ID",
                                }
                            },
                            {
                                title: "Name",
                                field: "status.name",
                                type: "input-text",
                                display: {
                                    placeholder: "Add source name"
                                }
                            },
                            {
                                title: "Description",
                                field: "status.description",
                                type: "input-text",
                                display: {
                                    rows: 2,
                                    placeholder: "Add a description..."
                                }
                            },
                        ]
                    },
                ],
            },
        ],
    };

    // aproach data #2
    // cy.fixture('json file').as("")

    // before run once but it'll be dissapear for others test.
    // before (() =>{
    // });

    beforeEach(()=> {
        // It will be run for each test.
        cy.mount(html`
            <data-form
                .data=${data}
                .config=${configDataForm}
                fieldChange=${cy.spy().as("onFieldChange")}
                submit=${cy.spy().as("onSubmitSpy")}>
            </data-form>
        `);
    });

    it("should be display a form", () => {
        cy.get("data-form").contains("form");
    });

    it("should has a title", () => {
        cy.get("data-form").contains("h3", configDataForm.sections[0].title);
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

