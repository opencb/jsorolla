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

function GcsaRestManager (){

	//deprecated
	//this.host = "http://bioinfo.cipf.es/dqs-naranjoma-ws/rest";
	//if(window.location.host.indexOf("ralonso")!=-1){
		//this.host = "http://ralonso:8080/dqs-naranjoma-ws/rest";
	//}
	
	/** Events **/
	/*ACCOUNT*/
	this.onGetAccountInfo = new Event(this);
	this.onLogin = new Event(this);
	this.onCreateAccount = new Event(this);
	this.onResetPassword = new Event(this);
	this.onChangePassword = new Event(this);
	this.onChangeEmail = new Event(this);
	this.onLogout = new Event(this);

	/*Bucket*/
	this.onCreateBucket = new Event(this);
	this.onUploadObjectToBucket = new Event(this);
	this.onDeleteObjectFromBucket = new Event(this);
	this.onCreateDirectory = new Event(this);

	/*Jobs*/
	this.onJobStatus = new Event(this);
	this.onJobResult = new Event(this);
	this.onTable = new Event(this);
	this.onPoll = new Event(this);

	/*ANALYSIS*/
	this.onRunAnalysis = new Event(this);
	
	/*BAM*/
	this.onBamList = new Event(this);
	this.onGetAccountInfo = new Event(this);
	this.onRegion = new Event(this);
	
	this.onError = new Event(this);
}

GcsaRestManager.prototype = {
    host : GCSA_HOST,
    getHost : function(){
        return this.host;
    },
    setHost : function(hostUrl){
        this.host = hostUrl;
    },
    doGet : function (url, successCallback, errorCallback, enctype){
        if(!enctype) enctype = "application/x-www-form-urlencoded";
        $.ajax({
            type: "GET",
            url: url,
            dataType: "text",
            cache: false,
            success: successCallback,
            error: errorCallback,
            contentType: enctype
        });
    },
    doPost : function (url, formData, successCallback, errorCallback){
        $.ajax({
            type: "POST",
            url: url,
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            success: successCallback,
            error: errorCallback
        });
    },
    getQuery : function(paramsWS){
        var query = "";
        for ( var key in paramsWS) {
            if(paramsWS[key]!=null)
                query+=key+'='+paramsWS[key]+'&';
        }
        if(query!='')
            query = "?"+query.slice(0,-1);
        return query;
    },


    getAccountUrl : function(accountId){
        return this.getHost()+'/account/'+accountId;
    },
    getStorageUrl : function(accountId){
        return this.getAccountUrl(accountId)+'/storage';
    },
    getBucketUrl : function(accountId, bucketId){
        return this.getStorageUrl(accountId)+'/'+bucketId;
    },
    getObjectUrl : function(accountId, bucketId, objectId){
        return this.getStorageUrl(accountId)+'/'+bucketId+'/'+objectId;
    },
    getJobUrl : function(accountId, jobId){
        return this.getAccountUrl(accountId)+'/storage/job/'+jobId;
    },
    /*ACCOUNT METHODS*/
    createAccount : function (accountId, email, name, password, suiteId){
        var _this = this;
        var queryParams = {
            'name':name,
            'email':email,
            'password':password,
            'suiteid':suiteId
        };
        var url =  this.getAccountUrl(accountId)+'/create'+this.getQuery(queryParams);
        function success(data){
            _this.onCreateAccount.notify(data);
        }
        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    login : function(accountId, password, suiteId){
        var _this=this;
        var queryParams = {
            'password':password,
            'suiteid':suiteId
        };
        var url =  this.getAccountUrl(accountId)+'/login'+this.getQuery(queryParams);
        function success(data){
            if(data.indexOf("ERROR") == -1){
                _this.onLogin.notify(JSON.parse(data));
            }else{
                _this.onLogin.notify({errorMessage:data});
            }
        }
        function error(data){
            console.log("ERROR: " + data);
        }
        this.doGet(url, success, error);
    },
    logout : function(accountId, sessionId){
        var _this=this;
        var queryParams = {
            'sessionid':sessionId
        };
        var url =  this.getAccountUrl(accountId)+'/logout'+this.getQuery(queryParams);
        function success(data){
            _this.onLogout.notify(data);
        }

        function error(data){
            $.cookie('bioinfo_sid', null);
            $.cookie('bioinfo_sid', null, {path: '/'});
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    getAccountInfo : function(accountId, sessionId, lastActivity){
        var _this=this;
        var queryParams = {
            'lastActivity':lastActivity,
            'sessionid':sessionId
        };
        var url =  this.getAccountUrl(accountId)+'/info'+this.getQuery(queryParams);
        function success(data){
            if(data.indexOf("ERROR") == -1){
                _this.onGetAccountInfo.notify(JSON.parse(data));
            }else{
                console.log(data);
            }
        }
        function error(data){
            console.log("ERROR: " + data);
            console.log(data);
        }
        this.doGet(url, success, error);
    	console.log(url);
    },
    changePassword : function(accountId, sessionId, old_password, new_password1, new_password2){
        var _this=this;
        var queryParams = {
            'old_password':old_password,
            'new_password1':new_password1,
            'new_password2':new_password2,
            'sessionid':sessionId
        };
        var url =  this.getAccountUrl(accountId)+'/profile/change_password'+this.getQuery(queryParams);
        function success(data){
            _this.onChangePassword.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    resetPassword : function(accountId, email){
        var _this=this;
        var queryParams = {
            'email':email
        };
        var url =  this.getAccountUrl(accountId)+'/profile/reset_password'+this.getQuery(queryParams);
        function success(data){
            _this.onResetPassword.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    changeEmail : function(accountId, sessionId, new_email){
    	var _this=this;
        var queryParams = {
            'new_email':new_email,
            'sessionid':sessionId
        };
        var url =  this.getAccountUrl(accountId)+'/profile/change_email'+this.getQuery(queryParams);
    	function success(data){
    		_this.onChangeEmail.notify(data);
    	}

    	function error(data){
    		console.log("ERROR: " + data);
    	}

    	this.doGet(url, success, error);
    //	console.log(url);
    },

    /* BUCKET METHODS */
    getBuckets : function(){
        return 'TODO';
    },

    createBucket : function(bucketId, description, accountId, sessionId){
        var _this=this;
        var queryParams = {
            'description':description,
            'sessionid':sessionId
        };
        var url =  this.getBucketUrl(accountId,bucketId)+'/create'+this.getQuery(queryParams);
        function success(data){
            _this.onCreateBucket.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    renameBucket : 'TODO',
    deleteBucket : 'TODO',
    shareBucket : 'TODO',

    uploadObjectToBucket : function(accountId, sessionId, bucketId, formData, parents){
        var _this=this;
        var queryParams = {
            'parents':(parents || false),
            'sessionid':sessionId
        };
        var url =  this.getBucketUrl(accountId,bucketId)+'/upload'+this.getQuery(queryParams);

        function success(data){
            console.log(data);
            _this.onUploadObjectToBucket.notify({status:"done",data:data});
        }

        function error(data){
            _this.onUploadObjectToBucket.notify({status:"fail",data:data});
        }

        this.doPost(url, formData, success, error);
    //	console.log(url);
    },
    createDirectory : function(accountId, sessionId, bucketId, objectId, parents){
        objectId = objectId.replace(new RegExp("/", "gi"),":");
	    var _this=this;
        var queryParams = {
            'parents':(parents || false),
            'objectid' : objectId,
            'sessionid':sessionId
        };
        var url =  this.getBucketUrl(accountId,bucketId)+'/create_directory'+this.getQuery(queryParams);
        function success(data){
            console.log(data);
            _this.onCreateDirectory.notify(data);
        }
        function error(data){
            console.log("ERROR: " + data);
        }
        this.doGet(url, success, error);
    },
    deleteObjectFromBucket : function(accountId, sessionId, bucketId, objectId){
        objectId = objectId.replace(new RegExp("/", "gi"),":");
        var _this=this;
        var queryParams = {
            'sessionid':sessionId
        };
        var url =  this.getObjectUrl(accountId,bucketId,objectId)+'/delete'+this.getQuery(queryParams);

        function success(data){
            console.log(data);
            _this.onDeleteObjectFromBucket.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    region : function(accountId, sessionId, bucketId, objectId, region, queryParams){
        var _this=this;
        queryParams["sessionid"] = sessionId;
        queryParams["region"] = region;
        var url = this.getObjectUrl(accountId,bucketId,objectId)+'/fetch'+this.getQuery(queryParams);
        console.log(url);
        function success(data){
            _this.onRegion.notify({resource:queryParams["category"],result:JSON.parse(data),filename:objectId,query:region,params:queryParams});
        }

        function error(data){
            console.log("ERROR: " + data);
            console.log(data);
        }

        this.doGet(url, success, error);
        console.log(url);
    },

    /* JOB METHODS */
    jobResult : function(accountId, sessionId, jobId, format){
        var _this=this;
        //@Path("/{accountid}/{bucketname}/job/{jobid}/result.{format}")
        var queryParams = {
            'sessionid':sessionId
        };
        var url = this.getJobUrl(accountId,jobId)+'/result.'+format+this.getQuery(queryParams);

        //var url = this.getHost() + '/job/'+jobId+'/result.'+format+'?incvisites=true&sessionid='+sessionId;
        function success(data){
            _this.onJobResult.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },
    jobStatus : function(accountId, sessionId,  jobId){
        var _this=this;
        var queryParams = {
            'sessionid':sessionId
        };
        var url = this.getJobUrl(accountId,jobId)+'/status'+this.getQuery(queryParams);
        function success(data){
            _this.onJobStatus.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },

    table : function(accountId, sessionId, jobId, filename, colNames, colVisibility){
        var _this=this;
        var queryParams = {
            'filename':filename,
            'colNames':colNames,
            'colVisibility':colVisibility,
            'sessionid':sessionId
        };
        var url = this.getJobUrl(accountId,jobId)+'/table'+this.getQuery(queryParams);
        function success(data){
            _this.onTable.notify(data);
        }

        function error(data){
            console.log("ERROR: " + data);
        }

        this.doGet(url, success, error);
    //	console.log(url);
    },

    tableurl : function(accountId, sessionId, jobId, filename, colNames, colVisibility){
        var queryParams = {
            'filename':filename,
            'colNames':colNames,
            'colVisibility':colVisibility,
            'sessionid':sessionId
        };
        return this.getJobUrl(accountId,jobId)+'/table'+this.getQuery(queryParams);

    },

    poll : function(accountId, sessionId, jobId, filename, zip){
        //debugger
        var _this=this;
        var queryParams = {
            'filename':filename,
            'sessionid':sessionId
        };
        var url;
        if(zip==true){
            url = this.getJobUrl(accountId,jobId)+'/poll'+this.getQuery(queryParams);
            open(url);
        }else{
            queryParams['zip']=false;
            url = this.getJobUrl(accountId,jobId)+'/poll'+this.getQuery(queryParams);
            function success(data){
                _this.onPoll.notify(data);
            }
            function error(data){
                console.log("ERROR: " + data);
            }
            this.doGet(url, success, error);
        }
    //	console.log(url);
    },

    pollurl : function(accountId, sessionId, jobId, filename){
        var queryParams = {
            'filename':filename,
            'sessionid':sessionId,
            'zip':false
        };
        return this.getJobUrl(accountId,jobId)+'/poll'+this.getQuery(queryParams);
        //debugger
    },



    /* ANALYSIS */
    getAnalysisUrl : function(accountId, analysis){return this.getAccountUrl(accountId)+'/analysis/'+analysis;},
    runAnalysis : function(analysis, paramsWS){
        var _this=this;

        var url = this.getAnalysisUrl(accountId, analysis)+'/run';
        console.log(url);
        console.log(paramsWS);

        function success(data){
            _this.onRunAnalysis.notify({status:"done",data:data});
        }

        function error(data){
            _this.onRunAnalysis.notify({status:"fail",data:data});
        }

        $.ajax({type:"POST", url:url, data:paramsWS, success:success, error:error});
    }
};


//
///*project management*/

//
//
//
//

//
///**General**/
//GcsaRestManager.prototype.experimentList = function(queryParams){
//	var _this=this;
//	var url = this.getHost()+'/experiment'+this.getQuery(queryParams);
//
//	function success(data){
//		_this.onBamList.notify(JSON.parse(data));
//	}
//
//	function error(data){
//		console.log("ERROR: " + data);
//		console.log(data);
//	}
//
//	this.doGet(url, success, error);
////	console.log(url);
//
//};
//
///**BAM**/
//GcsaRestManager.prototype.bamList = function(queryParams){
//	var _this=this;
//	var url = this.getHost()+'/bam/list'+this.getQuery(queryParams);;
//
//	function success(data){
//		_this.onBamList.notify(JSON.parse(data));
//	}
//
//	function error(data){
//		console.log("ERROR: " + data);
//		console.log(data);
//	}
//
//	this.doGet(url, success, error);
////	console.log(url);
//
//};
//
//
//
////old
////GcsaRestManager.prototype.region = function(category, filename, region, queryParams){
//	//var _this=this;
//	//var url = this.getHost()+'/'+category+'/'+filename+'/'+region+'/region'+this.getQuery(queryParams);
//	//console.log(url);
//	//function success(data){
//		//_this.onRegion.notify({resource:category,result:JSON.parse(data),filename:filename,query:region,params:queryParams});
//	//}
//	//
//	//function error(data){
//		//console.log("ERROR: " + data);
//		//console.log(data);
//	//}
//	//
//	//this.doGet(url, success, error);
//	//console.log(url);
////};
//

//
//

//

