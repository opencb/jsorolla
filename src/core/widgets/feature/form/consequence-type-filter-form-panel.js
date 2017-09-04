/*
 * Copyright (c) 2014 Francisco Salavert (SGL-CIPF)
 * Copyright (c) 2014 Alejandro Alemán (SGL-CIPF)
 * Copyright (c) 2014 Ignacio Medina (EBI-EMBL)
 *
 * This file is part of JSorolla.
 *
 * JSorolla is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JSorolla is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JSorolla. If not, see <http://www.gnu.org/licenses/>.
 */
function ConsequenceTypeFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("ConsequenceTypeFilterFormPanel");
    this.target;
    this.height = 400;
    this.title = "Consequence Type";
    this.border = false;
    this.autoRender = true;
    this.collapsible = true;
    this.titleCollapse = false;
    this.collapsed = false;
    this.headerConfig;
    this.consequenceTypes = [];
    this.fields = [
        {name: 'name', type: 'string'},
        {name: 'acc', type: 'string'}
    ];
    this.columns = [
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
    ];

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
            return {conseq_type: consequence_types};
        } else {
            return {};
        }
    },
    _createPanel: function () {

        Ext.define('Tree Model', {
            extend: 'Ext.data.Model',
            fields: this.fields
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'Tree Model',
            proxy: {
                type: 'memory',
                data: this.consequenceTypes,
                reader: {
                    type: 'json'
                }
            }
        });

        var treePanel = Ext.create('Ext.tree.Panel', {
            title: this.title,
            border: this.border,
            useArrows: true,
            rootVisible: false,
            store: store,
            multiSelect: true,
            singleExpand: true,
            hideHeaders: true,
            height: this.height,
            collapsible: this.collapsible,
            titleCollapse: this.titleCollapse,
            collapsed: this.collapsed,
            header: this.headerConfig,
            columns: this.columns,
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
