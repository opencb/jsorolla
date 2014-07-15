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
            //allowBlank: true,
            width: '100%',
            fieldLabel: 'SNP id',
            labelAlign: 'top',
            regex: /^[rs]s\d+$/
        });

        var regionList = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "region",
            name: "region",
            emptyText: '1:1-1000000,2:1-1000000',
            margin: '0 0 0 5',
            //allowBlank: true,
            width: '100%',
            fieldLabel: 'Chromosomal Location',
            labelAlign: 'top',
            value:'1:879341-879365'
        });

        var gene = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "gene",
            name: "gene",
            margin: '0 0 0 5',
            //allowBlank: true,
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
            allowBlank:false,
            items: [snp, regionList, gene]
        });

    },
    getPanel: function () {
        return this.panel;
    },
    getValues: function(){
        return this.panel.getValues();
    },
    clear: function(){
        this.panel.reset();
    }
}
