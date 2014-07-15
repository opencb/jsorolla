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
function FormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("FormPanel");
    this.target;
    this.autoRender = true;
    this.height;
    this.width;
    this.title;
    this.collapsible = false;
    this.titleCollapse = false;
    this.submitButtonText = 'Search';
    this.clearButtonText = 'Clear';
    this.barItems = [];
    this.border = true;
    this.filters = [];
    this.mode = 'accordion';
    this.toolbarPosition = 'top';

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

FormPanel.prototype = {
    render: function () {
        var _this = this;
        console.log("Initializing " + this.id);

        //HTML skel
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.id);

        var filters = [];

        for (var i = 0; i < this.filters.length; i++) {
            var filter = this.filters[i];
            filters.push(filter.getPanel());
        }

        this.panel = this._createPanel();
        this.filtersPanel.add(filters);
        if (this.mode == 'tabs') {
            this.filtersPanel.setActiveTab(0);
        }

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
        for (var i = 0; i < this.filters.length; i++) {
            var filter = this.filters[i];
            filter.clear();
        }
    },
    getValues: function () {
        var values = {};
        for (var i = 0; i < this.filters.length; i++) {
            var filter = this.filters[i];
            _.extend(values, filter.getValues());
        }
        return values;
    },
    _createPanel: function () {
        var _this = this;

        var barItems = [
            {
                xtype: 'button',
                text: this.clearButtonText,
                tooltip: this.clearButtonText,
                handler: function () {
                    _this.clear();
                    Utils.msg('Clear', 'Sucessfully');
                }
            },
            {
                xtype: 'button',
                text: this.submitButtonText,
                tooltip: this.submitButtonText,
                formBind: true,
                handler: function () {
                    _this.trigger('submit', {values: _this.getValues(), sender: _this});
//                            console.log(values);
//
//                            for (var i = 0; i < _this.filters.length; i++) {
//                                var filter = _this.filters[i];
//                                var form = filter.filter.getForm();
//                                _.extend(values, form);
//
//                            }

                }
            }
        ];
        barItems = barItems.concat(this.barItems);


        var pan;
        if (this.mode == 'tabs') {
            this.filtersPanel = Ext.create('Ext.tab.Panel', {
                border: false,
                plain: false
            });
        } else {
            this.filtersPanel = Ext.create('Ext.container.Container', {
                layout: {
                    type: 'accordion',
                    titleCollapse: true,
                    multi: true
                }
            });
        }

        var form = Ext.create('Ext.form.Panel', {
            border: this.border,
            height: this.height,
            width: this.width,
            title: this.title,
            collapsible: this.collapsible,
            titleCollapse: this.titleCollapse,
            margin: '0 20 0 0',
            autoScroll: true,
            items: [
                this.filtersPanel
            ],
            dockedItems: [
                {
                    xtype:'toolbar',
                    dock: this.toolbarPosition,
                    width: '100%',
                    height: 45,
//                border:false,
                    items: barItems
                }
            ]
        });
        return form;

    }
}
