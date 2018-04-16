/**
 * @author Josemi Juanes, Pablo Marin-Garcia
 * @date 2018-03-21
 *
 * @description Specific analysis for exploring relationships between HPO, genes, variations and pathways
 *
 */


// first implementation only hpo and genes.
// <TODO> add logic for variations and pathways analysis mode

class HPONetworkAnalysis extends NetworkAnalysis {

    constructor(args) {
        this.args = Object.assign(HPONetworkAnalysis.getDefaultConfig(), args);
    }

    static is() {
        return "HPO-analysis";
    }

    static build(args) {
        return new HPONetworkAnalysis(args);
    }

    static getDefaultConfig() {
        return {};
    }

    transform(network) {
        // <TODO>
        return network;
    }
}

NetworkBrowser.registerAnalysis(HPONetworkAnalysis);