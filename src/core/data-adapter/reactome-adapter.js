/**
 * Created by pfurio on 16/11/16.
 */

class ReactomeAdapter {

    constructor(client, options = {}, handlers = {}) {
    // constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {

        this.client = client;
        this.options = options;
        this.handlers = handlers;

        Object.assign(this, Backbone.Events);
        this.on(this.handlers);
    }

    getData(args){
        // switch(this.category) {
        //     case "analysis/variant":
        //         return this._getVariant(args);
        //         break;
        //     case "analysis/alignment":
        //         return this._getAlignmentData(args);
        //         break;
        //     default:
        //         return this._getExpressionData(args);
        // }
    }

    _getNetworkCanvasForGene(gene, species) {
        this.client.contentServiceClient().mappingClient().pathways("UniProt", gene, species)
            .then(function (response) {
                let diagrammedPathways = [];
                 for (let i = 0; i < response.length; i++) {
                     let pathway = response[i];
                     if (pathway.hasDiagram) {
                         diagrammedPathways.push(pathway);
                     }
                 }
            });
    }
}
