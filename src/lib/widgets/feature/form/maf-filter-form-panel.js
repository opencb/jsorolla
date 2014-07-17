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
function MafFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("MafFilterFormPanel");
    this.target;
    this.autoRender = true;
    this.title = "MAF";
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

MafFilterFormPanel.prototype = {
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


        var thousandContainer = Ext.create('Ext.form.FieldContainer', {
            margin: '10 0 0 0',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'textfield',
                    labelAlign: 'right',
                    fieldLabel: '1000G MAF < ',
                    name: 'maf_1000g_controls',
                    flex: 1,
                    labelWidth: 100
                },
                {
                    xtype: 'textfield',
                    labelAlign: 'right',
                    fieldLabel: 'EVS MAF < ',
                    labelWidth: 100,
                    flex: 1,
                    name: 'maf_evs_controls'

                }
            ]
        });

        var populationsContainer = Ext.create('Ext.form.FieldContainer', {
            fieldLabel: '<span style="color:gray">1000G Populations</span>',
            labelAlign: 'top',
            margin: '20 0 5 0',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'textfield',
                    labelAlign: 'right',
                    fieldLabel: 'African MAF < ',
                    labelWidth: 110,
                    flex: 1,
                    name: 'maf_1000g_afr_controls'
                },
                {
                    xtype: 'textfield',
                    labelAlign: 'right',
                    fieldLabel: 'American MAF < ',
                    labelWidth: 110,
                    flex: 1,
                    name: 'maf_1000g_ame_controls'
                },
                {
                    xtype: 'textfield',
                    labelAlign: 'right',
                    fieldLabel: 'Asian MAF < ',
                    labelWidth: 110,
                    flex: 1,
                    name: 'maf_1000g_asi_controls'
                },
                {
                    xtype: 'textfield',
                    labelAlign: 'right',
                    fieldLabel: 'European MAF < ',
                    labelWidth: 110,
                    flex: 1,
                    name: 'maf_1000g_eur_controls'
                }
            ]
        });

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
            items: [thousandContainer, populationsContainer]
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
