// / <reference types='cypress'/>

import {typeField} from "../plugins/utils";

class DataFormPage {

    navigate() {
        cy.visit("#data-form");
    }

    enterField(name, value) {
        return typeField(name, value);
    }

    submit() {
        return cy.get("button[class='btn btn-primary ']").contains("OK").click();
    }

}

export default DataFormPage;
