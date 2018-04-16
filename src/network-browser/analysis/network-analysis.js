/**
 * @author Josemi Juanes, Pablo Marin-Garcia
 * @date 2018-03-21
 *
 * @description Base class for the rest of specific analysis. Don't use this class directly, extend it instead.
 * see hpo-network-analysis.js for a usage example
 *
 */


class NetworkAnalysis {

    // constructor(args) {
    //
    //}

    static is() {
        return "default-analysis";
    }

    static build() {
        return new NetworkAnalysis();
    }

    transform(network) {
        return network;
    }
}