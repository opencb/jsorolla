//TEMPLATE widget
function FormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("FormPanel");
    this.target;
    this.autoRender = true;
    this.height;
    this.width;
    this.filters = [];

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
        this.panel.add(filters);

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
        var _this = this;
        var form = Ext.create('Ext.form.Panel', {
            border: 1,
            height: this.height,
            width: this.width,
            title: this.title,
            margin: '0 20 0 0',
            layout: {
                type: 'accordion',
                titleCollapse: true,
                fill: false,
                multi: true
            },
            autoScroll: true,
            tbar: {
                width: '100%',
                items: [
                    {
                        xtype: 'button',
                        width: 55,
                        text: '<span style="font-weight:bold">Reload</span>',
                        tooltip: 'Reload',
                        handler: function () {
                            Utils.msg('Reload', 'Sucessfully')
//                            _this._reloadForm();
                        }
                    } ,
                    {
                        xtype: 'button',
                        flex: 46,
                        text: '<span style="font-weight:bold">Clear</span>',
                        tooltip: 'Clear',
                        handler: function () {
                            form.getForm().reset();
                            Utils.msg('Clear', 'Sucessfully');
                        }
                    },
                    '->',
                    {
                        xtype: 'button',
                        flex: 54,
                        text: '<span style="font-weight:bold">Search</span>',
                        tooltip: 'Search',
                        formBind: true,
                        handler: function () {

                            var values = form.getForm().getValues();
                            _this.trigger('search', {filterParams: values, sender: _this});
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
                ]
            }
        });
        return form;

    }
}
