function PositionFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("PositionFilterFormPanel");
    this.target;
    this.autoRender = true;
    this.title = "Position";

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

PositionFilterFormPanel.prototype = {
    render: function () {
        var _this = this;
        console.log("Initializing " + this.id);

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
    _createPanel: function () {
        var snp = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "snp",
            name: "snp",
            margin: '0 0 0 5',
            allowBlank: true,
            width: '100%',
            fieldLabel: 'SNP id',
            labelAlign: 'top',
            regex: /^rs\d+$/
        });

        var regionList = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "region",
            name: "region",
            emptyText: '1:1-1000000,2:1-1000000',
            margin: '0 0 0 5',
            allowBlank: true,
            width: '100%',
            fieldLabel: 'Chromosomal Location',
            labelAlign: 'top'
        });

        var gene = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "gene",
            name: "gene",
            margin: '0 0 0 5',
            allowBlank: true,
            width: '100%',
            fieldLabel: 'Gene / Transcript',
            labelAlign: 'top'
        });

        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            buttonAlign: 'center',
            layout: 'vbox',
            title: this.title,
            border: false,
            items: [snp, regionList, gene]
        });

    },
    getPanel: function () {
        return this.panel;
    }
}
