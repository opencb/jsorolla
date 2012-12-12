/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
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

function EditUserWidget(args){
	var _this=this;
	this.id = "EditUserWidget_"+ Math.round(Math.random()*10000000);
	this.targetId = null;
	
	if (args != null){
		if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
    }
	
	this.adapter = new WumAdapter();
	
	this.adapter.onEditPassword.addEventListener(function (sender, data){
			_this.panel.setLoading(false);
			console.log(_this.id+' EDIT PASS RESPONSE -> '+data);
			Ext.getCmp(_this.labelPassId).setText(data, false);
//			_this.??.notify();
	});
	
	this.fldOldId = this.id+"fldOld";
	this.fldNew1Id = this.id+"fldNew1";
	this.fldNew2Id = this.id+"fldNew2";
	this.btnChangeId = this.id+"btnChange";
	
	this.labelPassId = this.id+"labelPass";
};

EditUserWidget.prototype.getOldPassword = function (){
	return $.sha1(Ext.getCmp(this.fldOldId).getValue());
};

EditUserWidget.prototype.getNewPassword = function (){
	console.log($.sha1(Ext.getCmp(this.fldNew1Id).getValue()));
	return $.sha1(Ext.getCmp(this.fldNew1Id).getValue());
};

EditUserWidget.prototype.change = function (){ 
	if(this.checkpass()){
		this.adapter.editPassword(this.getOldPassword(),this.getNewPassword(), $.cookie('bioinfo_sid'));
		this.panel.setLoading('Waiting for the server to respond...');
	}
}

EditUserWidget.prototype.draw = function (){
	this.render();
};

EditUserWidget.prototype.clean = function (){
	if (this.panel != null){
		this.panel.destroy();
		delete this.panel;
		console.log(this.id+' PANEL DELETED');
	}
};



EditUserWidget.prototype.render = function (){
	var _this=this;
	if (this.panel == null){
		console.log(this.id+' CREATING PANEL');
		
		var labelPass = Ext.create('Ext.toolbar.TextItem', {
			id : this.labelPassId,
			padding:3,
			text:'<span class="info">Type the old and the new password</span>'
		});
		
		
		
		this.pan = Ext.create('Ext.panel.Panel', {
			bodyPadding:20,
		    width: 350,
		    height:135,
		    border:false,
		    bbar:{items:[labelPass]},
		    items: [{
		    	id: this.fldOldId,
		    	xtype:'textfield',
		        fieldLabel: 'Old password',
		        inputType: 'password'
		    },{
		    	id: this.fldNew1Id,
		    	xtype:'textfield',
		        fieldLabel: 'New password',
		        inputType: 'password' ,
//		        enableKeyEvents: true,
		        listeners: {
			        scope: this,
			        change: this.checkpass
			    }
		    },{
		    	id: this.fldNew2Id,
		    	xtype:'textfield',
		        fieldLabel: 'Confirm new',
		        inputType: 'password' ,
//		        enableKeyEvents: true,
		        listeners: {
			        scope: this,
			        change: this.checkpass
			    }
		    }
		    ]
		});
		
		this.panel = Ext.create('Ext.window.Window', {
		    title: 'Change your password',
		   	resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    modal:true,
		    items:[this.pan],
		    buttonAlign:'center',
		    buttons:[{
		    	id: this.btnChangeId,
		    	text:'Change'
		    }
		    ],
		    listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	        }
		});
		Ext.getCmp(this.btnChangeId).on('click', this.change, this);
	}
		this.panel.show();
};



EditUserWidget.prototype.checkpass = function (){ 
	
	var passwd1 = Ext.getCmp(this.fldNew1Id).getValue();
	var passwd2 = Ext.getCmp(this.fldNew2Id).getValue();
	var patt = new RegExp("[ *]");
	
		if(!patt.test(passwd1) && passwd1.length > 3){
			if (passwd1 == passwd2){
//				Ext.getCmp(this.fldNew1Id).clearInvalid();
				Ext.getCmp(this.labelPassId).setText('<p class="ok">Passwords match</p>', false);
				return true;
			}else{
//				Ext.getCmp(this.fldNew1Id).markInvalid('Password does not match');
				Ext.getCmp(this.labelPassId).setText('<p class="err">Passwords does not match</p>', false);
				return false;
			}
		}else{
//			Ext.getCmp(this.fldNew1Id).markInvalid('password must be at least 4 characters');
			Ext.getCmp(this.labelPassId).setText('<p class="err">Password must be at least 4 characters</p>', false);
			return false;
		}
};
