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
        const AR = this.registry[id];
        // override the class default result config
        if (AR) {
            if (AR.result) {
                AR.class.result = AR.result;
            }

            if (AR.config) {
                AR.class.config = {...AR.class.config, ...AR.config};
            }
            // return Reflect.constructor(ar.class, ar.config)
            return new AR.class(AR.config);
        } else {
            console.warn("Analysis Class not found:" + id);
        }
    }

}
