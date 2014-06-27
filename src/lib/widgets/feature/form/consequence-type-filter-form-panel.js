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
    _createPanel: function () {


        var model = Ext.define('ConsequenceTypeSelectorModel', {
            extend: 'Ext.data.Model',

            fields: [
                {name: 'so', type:'string'},
                {name: 'name', type:'string'},
            ]
        });

        var store = Ext.create('Ext.data.Store', {
            model: model,
            storeId: 'ConsequenceTypeSelectorStore',
            data: [
                {so: 'SO:0001587', name: 'stop_gained'},
                {so: 'SO:0001578', name: 'stop_lost'},
                {so: 'SO:0001821', name: 'inframe_insertion'},
                {so: 'SO:0001822', name: 'inframe_deletion'},
                {so: 'SO:0001589', name: 'frameshift_variant'},
                {so: 'SO:0001621', name: 'NMD_transcript_variant'},
                {so: 'SO:0001582', name: 'initiator_codon_variant'},
                {so: 'SO:0001626', name: 'incomplete_terminal_codon_variant'},
                {so: 'SO:0001583', name: 'missense_variant'},
                {so: 'SO:0001819', name: 'synonymous_variant'},
                {so: 'SO:0001567', name: 'stop_retained_variant'},
                {so: 'SO:0001580', name: 'coding_sequence_variant'},
                {so: 'SO:0001907', name: 'feature_elongation'},
                {so: 'SO:0001906', name: 'feature_truncation'}
            ]
        });

        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            buttonAlign: 'center',
            layout: 'vbox',
            title: this.title,
            border: false,
            viewModel: {},

            items: [{
                xtype: 'displayfield',
                fieldLabel: 'Selected CT',
                bind: '{ConsequenceTypeSelectorStore.value}',
                height: 100,
            }, {
                xtype: 'tagfield',
                fieldLabel: 'Select a CT',
                store: store,
                reference: 'ConsequenceTypeSelectorStore',
                displayField: 'name',
                valueField: 'name',
                filterPickList: true,
                queryMode: 'local',
                publishes: 'value',
                height: 100,
                width: '100%',
                autoScroll:true,
                name:'consequenceTypes'
            }]
        });

    },
    getPanel: function () {
        return this.panel;
    }
}
