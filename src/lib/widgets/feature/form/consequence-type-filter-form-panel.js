function ConsequenceTypeFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("ConsequenceTypeFilterFormPanel");
    this.target;
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
            if (n.get('checked')) {
                consequence_types.push(n.get('name'));
            }
        });
        return {ct: consequence_types};
    },
    _createPanel: function () {


//        var model = Ext.define('ConsequenceTypeSelectorModel', {
//            extend: 'Ext.data.Model',
//            fields: [
//                {name: 'so', type: 'string'},
//                {name: 'name', type: 'string'},
//            ]
//        });
//
//        var store = Ext.create('Ext.data.Store', {
//            model: model,
//            storeId: 'ConsequenceTypeSelectorStore',
//            data: [
//                {so: 'SO:0001587', name: 'stop_gained'},
//                {so: 'SO:0001578', name: 'stop_lost'},
//                {so: 'SO:0001821', name: 'inframe_insertion'},
//                {so: 'SO:0001822', name: 'inframe_deletion'},
//                {so: 'SO:0001589', name: 'frameshift_variant'},
//                {so: 'SO:0001621', name: 'NMD_transcript_variant'},
//                {so: 'SO:0001582', name: 'initiator_codon_variant'},
//                {so: 'SO:0001626', name: 'incomplete_terminal_codon_variant'},
//                {so: 'SO:0001583', name: 'missense_variant'},
//                {so: 'SO:0001819', name: 'synonymous_variant'},
//                {so: 'SO:0001567', name: 'stop_retained_variant'},
//                {so: 'SO:0001580', name: 'coding_sequence_variant'},
//                {so: 'SO:0001907', name: 'feature_elongation'},
//                {so: 'SO:0001906', name: 'feature_truncation'}
//            ]
//        });


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
            columns: [
                {
                    xtype: 'treecolumn',
                    flex: 2,
                    sortable: false,
                    dataIndex: 'name',
                    tooltipType: 'qtip'
//                    renderer:function (value, meta, record) {
//                        var link = "http://www.sequenceontology.org/miso/current_release/term/"+record.data.acc;
//                        return value+' <a href='+link+' target="_blank">'+record.data.acc+'</a>';
//                    }
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

//        return Ext.create('Ext.form.Panel', {
//            bodyPadding: "5",
//            margin: "0 0 5 0",
//            buttonAlign: 'center',
//            layout: {
//                type: 'vbox',
//                align: 'stretch'
//            },
//            title: this.title,
//            border: false,
//            viewModel: {},
//
//            items: [
//                treePanel
//                {
//                    xtype: 'tagfield',
//                    fieldLabel: 'Select a CT',
//                    labelAlign: 'top',
//                    store: store,
//                    reference: 'ConsequenceTypeSelectorStore',
//                    displayField: 'name',
//                    valueField: 'name',
//                    filterPickList: true,
//                    queryMode: 'local',
//                    publishes: 'value',
////                height: 100,
//                    autoScroll: true,
//                    name: 'consequenceTypes'
//                },
//                {
//                    xtype: 'displayfield',
//                    fieldLabel: 'Selected CT',
//                    labelAlign: 'top',
//                    bind: '{ConsequenceTypeSelectorStore.value}',
////                    flex: 1,
//                    height: 200,
//                    width: '100%'
//                }
//            ]
//        });

        return treePanel;
    },
    getPanel: function () {
        return this.panel;
    }
}
