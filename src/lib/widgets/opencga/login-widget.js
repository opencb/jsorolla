/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function LoginWidget(args) {

    _.extend(this, Backbone.Events);
    this.id = Utils.genId("LoginWidget");

    this.suiteId;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

LoginWidget.prototype = {
    show: function () {
        this.panel.show();
    },
    hide: function () {
        this.panel.hide();
        this.ShowBack();
    },
    render: function () {
        var _this = this;

        /***************************/
        this.loginSuccess = function (response) {
            if (_this.panel != null) {
                _this.panel.setLoading(false);
            }
            console.log(response);
            if (response.response[0].errorMsg === '' || response.response[0].errorMsg == null) {
                Cookies.set('bioinfo_sid', response.response[0].result[0].sessionId);
                Cookies.set('bioinfo_user', response.response[0].result[0].userId);
                _this.trigger('session:initiated', {sender: _this});
            } else {
                Ext.getCmp(_this.labelEmailId).setText('<span class="err">' + response.response[0].errorMsg + '</span>', false);
                //Delete all cookies
                Cookies.expire('bioinfo_sid');
                Cookies.expire('bioinfo_user');
            }
        };

        this.createUserSuccess = function (response) {
            _this.panel.setLoading(false);

            if (response.response[0].errorMsg === '') {
                var userId = response.response[0].result[0].id;
                Ext.getCmp(_this.labelEmailId).setText('<span class="ok">' + userId + ' created</span>', false);
            } else {
                Ext.getCmp(_this.labelEmailId).setText('<span class="err">' + response.response[0].errorMsg + '</span>', false);
                //Delete all cookies
                Cookies.expire('bioinfo_sid');
                Cookies.expire('bioinfo_user');
            }
        };

        this.resetPasswordSuccess = function (response) {
            _this.panel.setLoading(false);
            if (response.response[0].errorMsg === '' || response.response[0].errorMsg == null) {
                Ext.getCmp(_this.labelEmailId).setText('<span class="emph">' + 'OK' + '</span>', false);
            } else {
                Ext.getCmp(_this.labelEmailId).setText('<span class="err">' + response.response[0].errorMsg + '</span>', false);
            }
        };

        /***************************/


        /**ID**/
        this.labelEmailId = this.id + "labelEmail";
        this.labelPassId = this.id + "labelPass";

        this.fldEmailId = this.id + "fldEmail";
        this.fldPasswordId = this.id + "fldPassword";
        this.fldNpass1Id = this.id + "fldNpass1";
        this.fldNpass2Id = this.id + "fldNpass2";

        this.btnSignId = this.id + "fldSign";
        this.btnAnonymousId = this.id + "btnAnonymous";
        this.btnForgotId = this.id + "btnForgot";
        this.btnNewaccId = this.id + "btnNewacc";

        this.btnSendId = this.id + "btnSend";
        this.btnBackId = this.id + "btnBack";

        this.btnRegisterId = this.id + "btnRegister";

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Login Widget is not rendered yet');
            return;
        }

        /* Panel */
        this.panel = this._createPanel(this.targetId);
//        this.panel.show();
    },
    _createPanel: function (targetId) {
        var _this = this;

        var labelEmail = Ext.create('Ext.toolbar.TextItem', {
            id: this.labelEmailId,
            padding: 3,
            text: '<span class="info">Type your user ID and password</span>'
        });
        var pan = Ext.create('Ext.form.Panel', {
            id: this.id + "formPanel",
            bodyPadding: 20,
            height: 225,
            width: 350,
            border: 0,
            bbar: {items: [labelEmail]},
            items: [
                {
                    id: this.id + "userId",
                    xtype: 'textfield',
                    value: Cookies('bioinfo_user'),
                    fieldLabel: 'user ID',
                    hidden: false,
//		        enableKeyEvents: true,
                    listeners: {
                        scope: this,
                        change: this.checkUserId
                    }
                },
                {
                    id: this.fldPasswordId,
                    xtype: 'textfield',
                    fieldLabel: 'password',
                    inputType: 'password',
//		        emptyText:'please enter your password',
                    listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                _this.sign();
                            }
                        }
                    }
                },
                {
                    id: this.fldEmailId,
                    xtype: 'textfield',
                    fieldLabel: 'e-mail',
                    hidden: true,
//		        enableKeyEvents: true,
//		        emptyText:'please enter your email',
                    listeners: {
                        change: function () {
                            _this.checkemail();
                        },
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                _this.sign();
                            }
                        }
                    }
                },
                {
                    id: this.id + "userName",
                    xtype: 'textfield',
                    fieldLabel: 'name',
                    hidden: true,
//		        enableKeyEvents: true,
                    listeners: {
                        scope: this,
                        change: this.checkName
                    }
                },
                {
                    id: this.fldNpass1Id,
                    xtype: 'textfield',
                    fieldLabel: 'password',
                    inputType: 'password',
                    hidden: true,
//		        enableKeyEvents: true,
                    listeners: {
                        scope: this,
                        change: this.checkpass
                    }
                },
                {
                    id: this.fldNpass2Id,
                    xtype: 'textfield',
                    fieldLabel: 're-password',
                    inputType: 'password',
                    hidden: true,
//		        enableKeyEvents: true,
                    listeners: {
                        scope: this,
                        change: this.checkpass
                    }
                },
                {
                    id: this.btnAnonymousId,
                    xtype: 'checkboxfield',
                    padding: "10 0 0 0",
                    boxLabel: 'Anonymous login <p class="tip s90">Your work will be lost after logout</p>',
                    margin: "0 0 0 50",
                    listeners: {
                        change: function (me, newValue, oldValue, eOpts) {
                            if (newValue) {
                                Ext.getCmp(_this.id + "userId").disable();
                                Ext.getCmp(_this.fldPasswordId).disable();
                            } else {
                                Ext.getCmp(_this.id + "userId").enable();
                                Ext.getCmp(_this.fldPasswordId).enable();
                            }
                        }
                    }
                }
            ]
        });

        var panel = Ext.create('Ext.window.Window', {
            id: this.id + "windowPanel",
            title: 'Sign in',
            resizable: false,
            minimizable: true,
            constrain: true,
            closable: false,
            modal: true,
            items: {
                border: 0,
                layout: { type: 'vbox', align: 'stretch'},
                items: [pan],
                bbar: {
                    layout: {
                        pack: 'center'
                    },
                    items: [
                        {
                            id: this.btnSignId,
                            text: 'Sign in'
                        },
                        {
                            id: this.btnForgotId,
                            text: 'Forgot yout password?'
                        },
                        {
                            id: this.btnNewaccId,
                            text: 'New user'
                        },
                        {
                            id: this.btnSendId,
                            text: 'Send',
                            hidden: true
                        },
                        {
                            id: this.btnRegisterId,
                            text: 'Register',
                            hidden: true
                        },
                        {
                            id: this.btnBackId,
                            text: 'Back',
                            hidden: true
                        }
                    ]
                }
            },
            listeners: {
                minimize: function () {
                    _this.panel.hide();
                }
            }
        });

        Ext.getCmp(this.btnForgotId).on('click', this.ShowForgot, this);
        Ext.getCmp(this.btnBackId).on('click', this.ShowBack, this);
        Ext.getCmp(this.btnNewaccId).on('click', this.ShowNewacc, this);

        Ext.getCmp(this.btnSignId).on('click', this.sign, this);
        Ext.getCmp(this.btnSendId).on('click', this.sendRecover, this);
        Ext.getCmp(this.btnRegisterId).on('click', this.register, this);
        Ext.getCmp(this.btnAnonymousId).on('change', this.anonymousSelected, this);

        return panel;
    }
};

LoginWidget.prototype.sign = function () {
    var _this = this;
    if (Ext.getCmp(this.btnAnonymousId).getValue()) {
        this.anonymousSign();
        this.panel.setLoading('Waiting server...');
    } else {
        if (this.checkUserId()) {
            OpencgaManager.users.login({
                id: this.getLogin(),
                query: {
                    password: this.getPassword()
                },
                request: {
                    success: this.loginSuccess
                }
            });
            this.panel.setLoading('Waiting server...');

            Cookies.set('bioinfo_user', this.getLogin());
        }
    }
};

LoginWidget.prototype.anonymousSign = function () {
    //TODO new opencga
    //OpencgaManager.login({
    //    userId: "anonymous",
    //    password: "",
    //    suiteId: this.suiteId,
    //    success: this.loginSuccess
    //});
};

LoginWidget.prototype.register = function () {
    if (this.checkUserId() && this.checkemail() && this.checkName() && this.checkpass()) {
        OpencgaManager.users.create({
            query: {
                userId: this.getLogin(),
                name: this.getUserName(),
                email: this.getEmail(),
                password: this.getPasswordReg()
            },
            request: {
                success: this.createUserSuccess
            }
        });
    } else {
        Ext.getCmp(this.labelEmailId).setText('<span class="info">Fill all fields</span>', false);
    }
};

LoginWidget.prototype.sendRecover = function () {
    if (this.checkUserId() && this.checkemail()) {
        OpencgaManager.users.resetPassword({
            id: this.getLogin(),
            query: {
                email: this.getEmail()
            },
            request: {
                success: this.resetPasswordSuccess
            }
        });
        this.panel.setLoading('Waiting server...');
    }
};

LoginWidget.prototype.getLogin = function () {
    return Ext.getCmp(this.id + "userId").getValue();
};
LoginWidget.prototype.getUserName = function () {
    return Ext.getCmp(this.id + "userName").getValue();
};
LoginWidget.prototype.getEmail = function () {
    return Ext.getCmp(this.fldEmailId).getValue();
};

LoginWidget.prototype.getPassword = function () {
    return CryptoJS.SHA1(Ext.getCmp(this.fldPasswordId).getValue()).toString();
};

LoginWidget.prototype.getPasswordReg = function () {
    return CryptoJS.SHA1(Ext.getCmp(this.fldNpass1Id).getValue()).toString();
};

//LoginWidget.prototype.draw = function () {
//    this.render();
//};

LoginWidget.prototype.ShowForgot = function () {
    Ext.getCmp(this.fldEmailId).reset();
    Ext.getCmp(this.fldEmailId).show();
    Ext.getCmp(this.fldPasswordId).reset();
    Ext.getCmp(this.btnAnonymousId).reset();
    Ext.getCmp(this.fldNpass1Id).reset();
    Ext.getCmp(this.fldNpass2Id).reset();

    Ext.getCmp(this.fldPasswordId).hide();
    Ext.getCmp(this.btnAnonymousId).hide();
    Ext.getCmp(this.fldNpass1Id).hide();
    Ext.getCmp(this.fldNpass2Id).hide();

    Ext.getCmp(this.btnSignId).hide();
    Ext.getCmp(this.btnForgotId).hide();
    Ext.getCmp(this.btnNewaccId).hide();

    Ext.getCmp(this.btnSendId).show();
    Ext.getCmp(this.btnBackId).show();
    Ext.getCmp(this.btnRegisterId).hide();

    Ext.getCmp(this.id + "userId").reset();
    Ext.getCmp(this.id + "userName").hide();

    Ext.getCmp(this.labelEmailId).setText('<span class="info">Type your user ID and email to send a new password</span>', false);

    Ext.getCmp(this.id + "userId").setFieldLabel('user ID', false);
    Ext.getCmp(this.fldEmailId).setFieldLabel('e-mail', false);
};
LoginWidget.prototype.ShowBack = function () {
    Ext.getCmp(this.fldEmailId).hide();
    Ext.getCmp(this.fldPasswordId).reset();
    Ext.getCmp(this.btnAnonymousId).reset();
    Ext.getCmp(this.fldNpass1Id).reset();
    Ext.getCmp(this.fldNpass2Id).reset();

    Ext.getCmp(this.fldPasswordId).show();
    Ext.getCmp(this.btnAnonymousId).show();
    Ext.getCmp(this.fldNpass1Id).hide();
    Ext.getCmp(this.fldNpass2Id).hide();

    Ext.getCmp(this.btnSignId).show();
    Ext.getCmp(this.btnForgotId).show();
    Ext.getCmp(this.btnNewaccId).show();

    Ext.getCmp(this.btnSendId).hide();
    Ext.getCmp(this.btnBackId).hide();
    Ext.getCmp(this.btnRegisterId).hide();

    Ext.getCmp(this.id + "userId").reset();
    Ext.getCmp(this.id + "userName").hide();

    Ext.getCmp(this.labelEmailId).setText('<span class="info">Type your user ID and password</span>', false);

    Ext.getCmp(this.id + "userId").setFieldLabel('user ID', false);
};
LoginWidget.prototype.ShowNewacc = function () {

    Ext.getCmp(this.fldEmailId).reset();
    Ext.getCmp(this.fldEmailId).show();
    Ext.getCmp(this.fldPasswordId).reset();
    Ext.getCmp(this.btnAnonymousId).reset();
    Ext.getCmp(this.fldNpass1Id).reset();
    Ext.getCmp(this.fldNpass2Id).reset();

    Ext.getCmp(this.fldPasswordId).hide();
    Ext.getCmp(this.btnAnonymousId).hide();
    Ext.getCmp(this.fldNpass1Id).show();
    Ext.getCmp(this.fldNpass2Id).show();

    Ext.getCmp(this.btnSignId).hide();
    Ext.getCmp(this.btnForgotId).hide();
    Ext.getCmp(this.btnNewaccId).hide();

    Ext.getCmp(this.btnSendId).hide();
    Ext.getCmp(this.btnBackId).show();
    Ext.getCmp(this.btnRegisterId).show();

    Ext.getCmp(this.id + "userId").reset();
    Ext.getCmp(this.id + "userName").reset();
    Ext.getCmp(this.id + "userName").show();

    Ext.getCmp(this.labelEmailId).setText('&nbsp;', false);

    Ext.getCmp(this.id + "userName").setFieldLabel('name', false);
    Ext.getCmp(this.id + "userId").setFieldLabel('user ID', false);
    Ext.getCmp(this.fldEmailId).setFieldLabel('e-mail', false);
    Ext.getCmp(this.fldNpass1Id).setFieldLabel('password', false);
    Ext.getCmp(this.fldNpass2Id).setFieldLabel('re-password', false);
    Ext.getCmp(this.id + "userId").setValue("");
};

LoginWidget.prototype.checkpass = function () {
    var passwd1 = Ext.getCmp(this.fldNpass1Id).getValue();
    var passwd2 = Ext.getCmp(this.fldNpass2Id).getValue();
    var patt = new RegExp("[ *]");

    if (!patt.test(passwd1) && passwd1.length > 3) {
        if (passwd1 == passwd2) {
            Ext.getCmp(this.fldNpass1Id).setFieldLabel('<span class="ok">password</span>', false);
            Ext.getCmp(this.fldNpass2Id).setFieldLabel('<span class="ok">re-password</span>', false);
            Ext.getCmp(this.labelEmailId).setText('&nbsp;', false);
            return true;
        } else {
            Ext.getCmp(this.fldNpass1Id).setFieldLabel('<span class="err">password</span>', false);
            Ext.getCmp(this.fldNpass2Id).setFieldLabel('<span class="err">re-password</span>', false);
            Ext.getCmp(this.labelEmailId).setText('<span class="err">Password does not match</span>', false);
            return false;
        }
    } else {
        Ext.getCmp(this.fldNpass1Id).setFieldLabel('<span class="err">password</span>', false);
        Ext.getCmp(this.fldNpass2Id).setFieldLabel('<span class="err">re-password</span>', false);
        Ext.getCmp(this.labelEmailId).setText('<span class="err">Password minimum length is 4</span>', false);
        return false;
    }
};

LoginWidget.prototype.anonymousSelected = function (este, value) {
    if (value) {
        Ext.getCmp(this.labelEmailId).setText('<span class="ok">Anonymous selected</span>', false);
    } else {
        Ext.getCmp(this.labelEmailId).setText('<span class="info">Type your user ID and password</span>', false);
    }

};

LoginWidget.prototype.checkemail = function (a, b, c) {
    Ext.getCmp(this.btnAnonymousId).reset();
    var email = Ext.getCmp(this.fldEmailId).getValue();
    var patt = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (patt.test(email)) {
        Ext.getCmp(this.fldEmailId).setFieldLabel('<span class="ok">e-mail</span>', false);
        return true;
    } else {
        Ext.getCmp(this.fldEmailId).setFieldLabel('<span class="err">e-mail</span>', false);
        return false;
    }
};
LoginWidget.prototype.checkName = function (a, b, c) {
    var name = Ext.getCmp(this.id + "userName").getValue();
    if (name != "" && name != null) {
        Ext.getCmp(this.id + "userName").setFieldLabel('<span class="ok">name</span>', false);
        return true;
    } else {
        Ext.getCmp(this.id + "userName").setFieldLabel('<span class="err">name</span>', false);
        return false;
    }
};
LoginWidget.prototype.checkUserId = function (a, b, c) {
    var userId = Ext.getCmp(this.id + "userId").getValue();
    if (userId != "" && userId != null) {
        Ext.getCmp(this.id + "userId").setFieldLabel('<span class="ok">user ID</span>', false);
        return true;
    } else {
        Ext.getCmp(this.id + "userId").setFieldLabel('<span class="err">user ID</span>', false);
        return false;
    }
};
