import {LitElement, html} from "/web_modules/lit-element.js";

const registry = {
    "knockout": {
        id: "knockout",
        result: html`Result component`
    }
}


export default class AnalysisRegistry {

    static get(id) {
        return registry[id];
    }
};
