function ConsequenceTypeFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("ConsequenceTypeFilterFormPanel");
    this.target;
    this.height = 400;
    this.title = "Consequence Type";
    this.autoRender = true;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }

}

ConsequenceTypeFilterFormPanel.prototype = {
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
    clear: function () {
        var node = this.panel.getRootNode();
        node.cascadeBy(function (n) {
            n.set('checked', false);
        });
    },
    getValues: function () {
        var node = this.panel.getRootNode();
        var consequence_types = [];
        node.cascadeBy(function (n) {
            if (n.get('checked') && n.isLeaf()) {
                consequence_types.push(n.get('name'));
            }
        });
        if (consequence_types.length > 0) {
            return {ct: consequence_types};
        } else {
            return {};
        }
    },
    _createPanel: function () {

        Ext.define('Tree Model', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'name', type: 'string'},
                {name: 'acc', type: 'string'}
            ]
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'Tree Model',
            proxy: {
                type: 'memory',
                data: consequenceTypes,
                reader: {
                    type: 'json'
                }
            }
        });

        var treePanel = Ext.create('Ext.tree.Panel', {
            title: this.title,
            useArrows: true,
            rootVisible: false,
            store: store,
            multiSelect: true,
            singleExpand: true,
            hideHeaders: true,
            height: this.height,
            columns: [
                {
                    xtype: 'treecolumn',
                    flex: 2,
                    sortable: false,
                    dataIndex: 'name',
                    tooltipType: 'qtip'
                },
                {
                    text: '',
                    flex: 1,
                    dataIndex: 'acc',
                    renderer: function (value, meta, record) {
                        var link = "http://www.sequenceontology.org/miso/current_release/term/" + value;
                        return ' <a href=' + link + ' target="_blank">' + value + '</a>';
                    }

                }
            ],
            listeners: {
                'checkchange': function (node, checked) {
                    node.cascadeBy(function (n) {
                        n.set('checked', checked);
                    });
                }
            }
        });

        return treePanel;
    },
    getPanel: function () {
        return this.panel;
    }
}
