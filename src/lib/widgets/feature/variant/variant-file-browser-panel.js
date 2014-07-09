function VariantFileBrowserPanel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantFileBrowserPanel");

    this.target;
    this.title = "File Browser";
    this.height = 800;
    this.autoRender = true;
    this.studies = [];

    _.extend(this, args);

    this.on(this.handlers);
    
    this.rendered = false;

    if (this.autoRender) {
        this.render();
    }
}

VariantFileBrowserPanel.prototype = {
    render: function () {
        var _this = this;

        //HTML skel
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.id);

        this.panel = this._createPanel();

    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }

        this.targetDiv.appendChild(this.div);
        this.panel.render(this.div);

    },
    clear: function(){
        this.panel.removeAll(true);
    },
    load: function (data) {
    },
    _createPanel: function () {
        var panel = Ext.create('Ext.panel.Panel', {
            title: this.title,
            height: this.height,
            width: this.width,
            items:[{html: this.studies}
            ]
        });

        return panel;
    },
    _createStudyPanel: function (data) {
    },
    _getGenotypeCount: function (gc) {
    }
};
