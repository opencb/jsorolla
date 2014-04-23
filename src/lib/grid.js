function Grid(args) {
    _.extend(this, Backbone.Events);

    // Default values
    this.id = Utils.genId("Grid");
    this.grid = null;
    this.store = null;
    this.model = null;

    _.extend(this, args);

}

Grid.prototype = {

    getPanel: function () {
        return this.grid;
    },
    getStore: function () {
        return this.store;
    },
    loadData: function (data) {
        this.store.loadData(data);
    },
    remove: function (record) {
        this.store.remove(record);
    },
    removeAll: function () {
        this.store.removeAll();
    },
    clear: function () {
        this.store.removeAll();
    },
    add: function (value) {
        this.store.add(value);
    },
    count: function () {
        return this.store.count();
    },
    getAt: function (pos) {
        if (pos >= 0) {
            return this.store.getAt(pos);
        }
    },
    refresh: function () {
        this.grid.getView().refresh();
    },
    getData: function () {
        var res = [];

        for (var i = 0; i < this.count(); i++) {
            res.push(this.getAt(i));
        }

        return res;
    },
    addAll: function (value) {
        for (var i = 0; i < value.length; i++) {
            this.add(value[i]);
        }
    },
    insert: function (pos, value) {
        this.store.insert(pos, value);
    },
    addColumn: function (attrName, attrType, columnName) {
        //debugger
        var fields = this.model.getFields();

        for (var i = 0; i < fields.length; i++) {
            if (fields.name == attrName && fields[i].type.type == attrType) {
                return false;
            }
        }

        var attr = new Ext.create('Ext.data.Field', {
            name: "prueba",
            type: "auto"
        });

        var col = new Ext.create('Ext.grid.column.Column', {
            text: "Prueba",
            dataIndex: "prueba",
            //flex:1,
            //sortable:true
        });

        fields.push(attr);
        this.model.setFields(fields);
        console.log(this.model.getFields());
        this.grid.columns.push(col);

    },
    createModel: function (name, attributes) {
        this.model = Ext.define(name, {
            extend: 'Ext.data.Model',
            fields: attributes
        });
    },
    createStore: function () {
        this.store = Ext.create('Ext.data.Store', {
            model: this.model,
            data: [],
            autoLoad: false
        });
    },
    setLoading: function (loading) {
        this.grid.setLoading(loading);
    }


};
