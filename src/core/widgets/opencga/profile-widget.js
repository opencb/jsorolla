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

function ProfileWidget(args) {

    _.extend(this, Backbone.Events);
    this.id = Utils.genId("ProfileWidget");

    this.suiteId;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

ProfileWidget.prototype = {
    show: function () {
        this.panel.show();
    },
    hide: function () {
        this.panel.hide();
    },
    render: function () {
        var _this = this;

        /**************/
        this.changePasswordSuccess = function (response) {
            _this.panel.setLoading(false);
            if (response.response[0].errorMsg === '' || response.response[0].errorMsg == null) {
                Ext.getCmp(_this.id + 'fldOld').setValue(null);
                Ext.getCmp(_this.id + 'fldNew1').setValue(null);
                Ext.getCmp(_this.id + 'fldNew2').setValue(null);
                Ext.getCmp(_this.id + 'labelPass').update('<span class="info">' + 'OK' + '</span>', false);
            } else {
                Ext.getCmp(_this.id + 'labelPass').update('<span class="err">' + response.response[0].errorMsg + '</span>', false);
            }
        };
        this.changeEmailSuccess = function (response) {
            _this.panel.setLoading(false);
            if (response.response[0].errorMsg === '' || response.response[0].errorMsg == null) {
                Ext.getCmp(_this.id + 'fldEmail').setValue(null);
                Ext.getCmp(_this.id + 'fldEmail').setFieldLabel('e-mail', false);
                Ext.getCmp(_this.id + 'labelPass').update('<span class="info">' + 'OK' + '</span>', false);
            } else {
                Ext.getCmp(_this.id + 'labelPass').update('<span class="err">' + response.response[0].errorMsg + '</span>', false);
            }
        };
        /**************/

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
//        console.log(this.id + ' CREATING PANEL');

        var labelPass = Ext.create('Ext.Component', {
            width: 200,
            id: this.id + 'labelPass',
            html: 'Modify your password or email.'
        });
        var changePasswordForm = Ext.create('Ext.form.Panel', {
            title: 'Change password',
            bodyPadding: 15,
            width: 350,
            border: false,
            items: [
                {
                    id: this.id + "fldOld",
                    name: 'password',
                    xtype: 'textfield',
                    fieldLabel: 'Old password',
                    inputType: 'password'
                },
                {
                    id: this.id + "fldNew1",
                    name: 'new_password1',
                    xtype: 'textfield',
                    fieldLabel: 'New password',
                    inputType: 'password',
//		        enableKeyEvents: true,
                    listeners: {
                        scope: this,
                        change: this.checkpass
                    }
                },
                {
                    id: this.id + "fldNew2",
                    name: 'new_password2',
                    xtype: 'textfield',
                    fieldLabel: 'Confirm new',
                    inputType: 'password',
//		        enableKeyEvents: true,
                    listeners: {
                        scope: this,
                        change: this.checkpass
                    }
                },
                {
                    xtype: 'button',
                    text: 'Change', margin: '0 0 0 105',
                    handler: function () {
                        _this.changePassword();
                    }
                }
            ]
        });
        var changeEmailForm = Ext.create('Ext.form.Panel', {
            title: 'Change email',
            bodyPadding: 15,
            width: 350,
            border: false,
            items: [
                {
                    id: this.id + "fldEmail",
                    name: 'new_email',
                    xtype: 'textfield',
                    fieldLabel: 'e-mail',
//		        enableKeyEvents: true,
//		        emptyText:'please enter your email',
                    listeners: {
                        change: function () {
                            _this.checkemail();
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'Change', margin: '0 0 0 105',
                    handler: function () {
                        _this.changeEmail();
                    }
                }
            ]
        });
        var profilePanel = Ext.create('Ext.panel.Panel', {
            width: 350,
            border: false,
            layout: 'accordion',
            items: [changePasswordForm, changeEmailForm],
            listeners: {
                tabchange: function () {
                    _this.clearAllFields();
                }
            }
        });
        var panel = Ext.create('Ext.window.Window', {
            title: 'Profile',
            resizable: false,
            minimizable: true,
            constrain: true,
            height: 350,
            layout: 'fit',
            closable: false,
            modal: true,
            items: {
                border: 0,
                layout: 'fit',
                items: [profilePanel],
                bbar: {
                    layout: {
                        pack: 'start'
                    },
                    items: [
                        labelPass,
                        '->',
                        {
                            text: 'Close',
                            handler: function () {
                                _this.panel.hide();
                            }
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
        return panel;
    },

    getOldPassword: function () {
        return CryptoJS.SHA1(Ext.getCmp(this.id + 'fldOld').getValue()).toString();
    },
    getNewPassword: function () {
        return CryptoJS.SHA1(Ext.getCmp(this.id + 'fldNew1').getValue()).toString();
    },
    getEmail: function () {
        return Ext.getCmp(this.id + 'fldEmail').getValue();
    },
    clearAllFields: function () {
        Ext.getCmp(this.id + 'fldOld').setValue(null);
        Ext.getCmp(this.id + 'fldNew1').setValue(null);
        Ext.getCmp(this.id + 'fldNew2').setValue(null);
        Ext.getCmp(this.id + 'fldEmail').setValue(null);
        Ext.getCmp(this.id + 'labelPass').update('&nbsp', false);
    },
    changeEmail: function () {
        if (this.checkemail()) {
            OpencgaManager.users.req({
                path: {
                    id: Cookies('bioinfo_user'),
                    action: 'change-email'
                },
                query: {
                    nemail: this.getEmail(),
                    sid: Cookies('bioinfo_sid')
                },
                request: {
                    success: this.changeEmailSuccess
                }
            });
            this.panel.setLoading('Waiting for the server to respond...');
        }
    },
    changePassword: function () {
        if (this.checkpass()) {
            OpencgaManager.users.req({
                path: {
                    id: Cookies('bioinfo_user'),
                    action: 'change-password'
                },
                query: {
                    password: this.getOldPassword(),
                    npassword: this.getNewPassword(),
                    sid: Cookies('bioinfo_sid')
                },
                request: {
                    success: this.changePasswordSuccess
                }
            });
            this.panel.setLoading('Waiting for the server to respond...');
        }
    },
    checkpass: function () {
        var passwd1 = Ext.getCmp(this.id + 'fldNew1').getValue();
        var passwd2 = Ext.getCmp(this.id + 'fldNew2').getValue();
        var oldPass = Ext.getCmp(this.id + 'fldOld').getValue();
        var patt = new RegExp("[ *]");

        if (oldPass != '') {
            if (!patt.test(passwd1) && passwd1.length > 3) {
                if (passwd1 == passwd2) {
                    Ext.getCmp(this.id + 'labelPass').update('<span class="ok">Passwords match</span>', false);
                    return true;
                } else {
                    Ext.getCmp(this.id + 'labelPass').update('<span class="err">Passwords does not match</span>', false);
                    return false;
                }
            } else {
                Ext.getCmp(this.id + 'labelPass').update('<span class="err">Password must be at least 4 characters</span>', false);
                return false;
            }
        } else {
            Ext.getCmp(this.id + 'labelPass').update('<span class="err">Old password is empty</span>', false);
            return false;
        }

    },
    checkemail: function () {
        var email = Ext.getCmp(this.id + 'fldEmail').getValue();
        var patt = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if (patt.test(email)) {
            Ext.getCmp(this.id + 'fldEmail').setFieldLabel('<span class="ok">e-mail</span>', false);
            return true;
        } else {
            Ext.getCmp(this.id + 'fldEmail').setFieldLabel('<span class="err">e-mail</span>', false);
            if (email == '') {
                Ext.getCmp(this.id + 'fldEmail').setFieldLabel('e-mail', false);
            }
            return false;
        }
    }
};

