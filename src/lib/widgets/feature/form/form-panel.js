//TEMPLATE widget
function FormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("FormPanel");
    this.target;
    this.autoRender = true;
    this.height;
    this.width;
    this.submitButtonText = 'Search';
    this.clearButtonText = 'Clear';
    this.border = true;
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
    clear: function () {
        for (var i = 0; i < this.filters.length; i++) {
            var filter = this.filters[i];
            filter.clear();
        }
        return values;
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
        var form = Ext.create('Ext.form.Panel', {
            border: this.border,
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
                        text: this.clearButtonText,
                        tooltip: this.clearButtonText,
                        handler: function () {
                            form.getForm().reset();
                            Utils.msg('Clear', 'Sucessfully');
                        }
                    },
                    '->',
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
                ]
            }
        });
        return form;

    }
}
