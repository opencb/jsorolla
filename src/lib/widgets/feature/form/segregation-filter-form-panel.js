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
function SegregationFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("SegregationFilterFormPanel");
    this.target;
    this.autoRender = true;
    this.title = "Segregation";
    this.border = false;
    this.collapsible = true;
    this.titleCollapse = false;
    this.headerConfig;
    this.testRegion = "";

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

SegregationFilterFormPanel.prototype = {
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


        var header = Ext.create('Ext.form.FieldContainer', {
            margin: '0 0 0 100',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                { xtype: 'label', text: '0/0', flex: 1},
                { xtype: 'label', text: '0/1', flex: 1},
                { xtype: 'label', text: '1/1', flex: 1}
            ]
        });

        var items = [header];

        for (var i = 0; i < this.samples.length; i++) {
            var name = this.samples[i];

            items.push(
                Ext.create('Ext.form.FieldContainer', {
                    fieldLabel: name,
                    labelWidth: 100,
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {xtype: 'checkbox', name: "sampleGT_" + name, inputValue: '0/0,0|0', flex: 1},
                        {xtype: 'checkbox', name: "sampleGT_" + name, inputValue: '0/1,1/0, 0|1,1|0', flex: 1},
                        {xtype: 'checkbox', name: "sampleGT_" + name, inputValue: '1/1,1|1', flex: 1}
                    ]
                })
            );
        }


        return Ext.create('Ext.form.Panel', {
            title: this.title,
            border: this.border,
            collapsible: this.collapsible,
            titleCollapse: this.titleCollapse,
            header: this.headerConfig,
            bodyPadding: "5",
            margin: "0 0 5 0",
            buttonAlign: 'center',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            allowBlank: false,
            items: items
        });

    },
    getPanel: function () {
        return this.panel;
    },
    getValues: function () {
        var values = this.panel.getValues();
        for (key in values) {
            if (values[key] == '') {
                delete values[key]
            }
        }
        return values;
    },
    clear: function () {
        this.panel.reset();
    }
}
