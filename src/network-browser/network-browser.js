class NetworkBrowser {
    constructor(parent, data, config) {
        //Object.assign(this, Backbone.Events);

        if (typeof config !== "object" || config === null) {
            config = NetworkBrowser.getDefaultConfig();
        }

        //Initialize the network renderer
        this.renderer = config.renderer;
        this.renderer.init(parent, config);
        let center = this.renderer.getCenter();

        //Initialize the network manager
        this.manager = new NetworkManager(data);
        this.manager.init(center);
    }

    init() {
        //TO_DO
    }

    draw() {
        let self = this;
        this.manager.getNodes().forEach(function (node) {
            self.renderer.drawNode(node);
        });
        this.manager.getRelations().forEach(function(relation){
            self.renderer.drawRelation(relation);
        });
    }

    static getDefaultConfig() {
        return {
            width: 800,
            height: 600,
            renderer: new SvgNetworkRenderer(),
            shapes: BasicNetworkSvgShapes
        };
    }
}
