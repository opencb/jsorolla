describe("Data Form Component", () => {

    beforeEach(() => {
        cy.visit("#data-form");
    });
    it("Get text element, type text", () => {
        cy.get("[data-testid='test-fieldTextText']");
    });
    it("Get text element, type title", () => {
        cy.get("[data-testid='test-fieldTextTitle']");
    });
    it("Get text element, type notification", () => {
        cy.get("[data-testid='test-fieldTextNotification']");
    });
    it("Get input element, type text", () => {
        cy.get("[data-testid='test-fieldInputText']");
    });
    it("Get input element, type num", () => {
        cy.get("[data-testid='test-fieldInputNum']");
    });
    it("Get input element, type password", () => {
        cy.get("[data-testid='test-fieldInputPassword']");
    });
    it("Get input element, type input number", () => {
        cy.get("[data-testid='test-fieldInputNumber']");
    });
    it("Get input element, type date", () => {
        cy.get("[data-testid='test-fieldInputDate']");
    });
    it("Get input element, type checkbox", () => {
        cy.get("[data-testid='test-fieldCheckbox']");
    });
    it("Get toggle switch element", () => {
        cy.get("[data-testid='test-fieldToggleSwitch']");
    });
    it("Get toggle buttons element", () => {
        cy.get("[data-testid='test-fieldToggleButtons']");
    });
    it("Get select element", () => {
        cy.get("[data-testid='test-fieldSelect']");
    });
    it("Get complex element", () => {
        cy.get("[data-testid='test-fieldComplex']");
    });
    it("Get list element", () => {
        cy.get("[data-testid='test-fieldList']");
    });
    it("Get table element", () => {
        cy.get("[data-testid='test-fieldTable']");
    });
    it("Get chart element", () => {
        cy.get("[data-testid='test-fieldChart']");
    });
    it("Get plot element", () => {
        cy.get("[data-testid='test-fieldPlot']");
    });
    // Caution: possibly deprecated
    // it("Get json element", () => {
    //     cy.get("[data-testid='test-fieldJson']");
    // });
    // Fixme 20230124: not working for me
    // it("Get json editor element", () => {
    //     cy.get("[data-testid='test-fieldJsonEditor']");
    // });
    // Caution: not in use
    // it("Get tree element", () => {
    //     cy.get("[data-testid='test-fieldTree']");
    // });
    it("Get custom element", () => {
        cy.get("[data-testid='test-fieldCustom']");
    });
    // it("Get download element", () => {
    //     cy.get("[data-testid='test-fieldDownload']");
    // });
    it("Get Object element", () => {
        cy.get("[data-testid='test-fieldObject']");
    });
    it("Get Object List element", () => {
        cy.get("[data-testid='test-fieldObjectList']");
    });

});
