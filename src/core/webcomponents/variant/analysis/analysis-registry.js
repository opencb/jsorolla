import OpencgaKnockoutAnalysis from "./opencga-knockout-analysis.js";
import OpencgaRecessiveGeneAnalysis from "./opencga-recessive-gene-analysis.js";

export default class AnalysisRegistry {

    static registry = {
        "knockout": {
            class: OpencgaKnockoutAnalysis,
            config: {} // default config (override the user config)
            // result: html`Custom result component` // override the render in the analysis Class
        },
        "recessive-gene": {
            class: OpencgaRecessiveGeneAnalysis,
            config: {} // default config (override the user config)
            // result: html`Custom result component` // override the render in the analysis Class
        }
    }

    static get(id) {
        const ar = this.registry[id];
        // override the class default result config
        if (ar) {
            if (ar.result) {
                ar.class.result = ar.result;
            }

            if (ar.config) {
                ar.class.config = {...ar.class.config, ...ar.config};
            }
            // return Reflect.constructor(ar.class, ar.config)
            return new ar.class(ar.config);
        } else {
            console.warn("Analysis Class not found:" + id);
        }
    }

}
