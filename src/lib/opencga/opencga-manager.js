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
 *
 */

var OpencgaManager = {
    host: (_.isUndefined(OPENCGA_HOST) ? 'http://ws.bioinfo.cipf.es/opencga/rest' : OPENCGA_HOST),
    getHost: function () {
        return OpencgaManager.host;
    },
    setHost: function (hostUrl) {
        OpencgaManager.host = hostUrl;
    },
    doGet: function (url, successCallback, errorCallback) {
        $.ajax({
            type: "GET",
            url: url,
            success: successCallback,
            error: errorCallback
        });
    },
    doPost: function (url, formData, successCallback, errorCallback) {
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
    getQuery: function (paramsWS) {
        var query = "";
        for (var key in paramsWS) {
            if (paramsWS[key] != null)
                query += key + '=' + paramsWS[key] + '&';
        }
        if (query != '')
            query = "?" + query.slice(0, -1);
        return query;
    },


    getAccountUrl: function (accountId) {
        return OpencgaManager.getHost() + '/account/' + accountId;
    },
    getStorageUrl: function (accountId) {
        return OpencgaManager.getAccountUrl(accountId) + '/storage';
    },
    getAdminProfileUrl: function (accountId) {
        return OpencgaManager.getAccountUrl(accountId) + '/admin/profile';
    },
    getAdminBucketUrl: function (accountId, bucketId) {
        return OpencgaManager.getAccountUrl(accountId) + '/admin/bucket/' + bucketId;
    },
    getAdminProjectUrl: function (accountId, projectId) {
        return OpencgaManager.getAccountUrl(accountId) + '/admin/project/' + projectId;
    },
    getBucketUrl: function (accountId, bucketId) {
        return OpencgaManager.getStorageUrl(accountId) + '/' + bucketId;
    },
    getObjectUrl: function (accountId, bucketId, objectId) {
        return OpencgaManager.getStorageUrl(accountId) + '/' + bucketId + '/' + objectId;
    },
    getAnalysisUrl: function (accountId, analysis) {
        return OpencgaManager.getAccountUrl(accountId) + '/analysis/' + analysis;
    },
    getJobAnalysisUrl: function (accountId, jobId) {
        return OpencgaManager.getAccountUrl(accountId) + '/analysis/job/' + jobId;
    },
    /*ACCOUNT METHODS*/
    createAccount: function (args) {
//      accountId, email, name, password, suiteId
        var queryParams = {
            'name': args.name,
            'email': args.email,
            'password': args.password,
            'suiteid': args.suiteId
        };
        var url = OpencgaManager.getAccountUrl(args.accountId) + '/create' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data)
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },
    login: function (args) {
//        accountId, password, suiteId
        var queryParams = {
            'password': args.password,
            'suiteid': args.suiteId
        };
        var url = OpencgaManager.getAccountUrl(args.accountId) + '/login' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            if(data.indexOf("ERROR") == -1){
                args.success(JSON.parse(data))
            }else{
                args.success({errorMessage:data})
            }
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
    },
    logout: function (args) {
//        accountId, sessionId
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAccountUrl(args.accountId) + '/logout' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },
    getAccountInfo: function (args) {
//        accountId, sessionId, lastActivity
//        console.log(args.lastActivity)
        var queryParams = {
            'last_activity': args.lastActivity,
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAccountUrl(args.accountId) + '/info' + OpencgaManager.getQuery(queryParams);

        function success(data) {

            if(data.indexOf("ERROR") == -1){
                args.success(JSON.parse(data));
            }else{
                $.cookie('bioinfo_sid', null);
                $.cookie('bioinfo_sid', null, {path: '/'});
                $.cookie('bioinfo_account',null);
                $.cookie('bioinfo_account', null, {path: '/'});
                console.log(data);
            }
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
//        console.log(url);
    },
    changePassword: function (args) {
//        accountId, sessionId, old_password, new_password1, new_password2
        var queryParams = {
            'old_password': args.old_password,
            'new_password1': args.new_password1,
            'new_password2': args.new_password2,
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAdminProfileUrl(args.accountId) + '/change_password' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data)
        }

        function error(data) {
            console.log("ERROR: " + data);
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },
    resetPassword: function (args) {
//        accountId, email
        var queryParams = {
            'email': args.email
        };
        var url = OpencgaManager.getAdminProfileUrl(args.accountId) + '/reset_password' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data)
        }

        function error(data) {
            console.log("ERROR: " + data);
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },
    changeEmail: function (args) {
//        accountId, sessionId, new_email
        var queryParams = {
            'new_email': args.new_email,
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAdminProfileUrl(args.accountId) + '/change_email' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },

    /* BUCKET METHODS */
    getBuckets: function () {
        return 'TODO';
    },

    createBucket: function (args) {
//        bucketId, description, accountId, sessionId
        var queryParams = {
            'description': args.description,
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAdminBucketUrl(args.accountId, args.bucketId) + '/create' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },

    refreshBucket: function (args) {
//        accountId, bucketId, sessionId
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAdminBucketUrl(args.accountId, args.bucketId) + '/refresh' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        console.log(url);
    },

    renameBucket: function (args) {
//        accountId, bucketId, newBucketId, sessionId
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getAdminBucketUrl(args.accountId, args.bucketId) + '/rename/' + args.newBucketId + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        console.log(url);
    },
    deleteBucket: 'TODO',
    shareBucket: 'TODO',

    uploadObjectToBucket: function (args) {
//        accountId, sessionId, bucketId, objectId, formData, parents
        var queryParams = {
            'parents': (args.parents || false),
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/upload' + OpencgaManager.getQuery(queryParams);


        function success(data){
            console.log(data);
            args.success({status:"done",data:data});
        }

        function error(data){
            if(_.isFunction(args.error)) args.error({status:"fail",data:data});
        }

        OpencgaManager.doPost(url, args.formData, success, error);
        //	console.log(url);
    },
    createDirectory: function (args) {
//        accountId, sessionId, bucketId, objectId, parents
        args.objectId = args.objectId.replace(new RegExp("/", "gi"), ":");
        var queryParams = {
            'parents': (args.parents || false),
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/create_directory' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
    },
    deleteObjectFromBucket: function (args) {
//        accountId, sessionId, bucketId, objectId
        args.objectId = args.objectId.replace(new RegExp("/", "gi"), ":");
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/delete' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },
    region: function (args) {
//        accountId, sessionId, bucketId, objectId, region, queryParams
        args.objectId = args.objectId.replace(new RegExp("/", "gi"), ":");
        args.queryParams["sessionid"] = args.sessionId;
        args.queryParams["region"] = args.region;
        args.queryParams["cellbasehost"] = CELLBASE_HOST + '/' + CELLBASE_VERSION;

        if (OpencgaManager.host.indexOf("localhost") != -1) {
            args.queryParams["region"] = args.region;
            args.queryParams["filepath"] = args.objectId;
            var url = OpencgaManager.host + '/storage/fetch' + OpencgaManager.getQuery(args.queryParams);
        } else {
            var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/fetch' + OpencgaManager.getQuery(args.queryParams);
        }


        function success(data) {
            if (!(data.substr(0, 5).indexOf('ERROR') != -1)) {
                args.success({resource: args.queryParams["category"], result: JSON.parse(data), filename: args.objectId, query: args.region, params: args.queryParams});
            }
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        console.log(url);
    },

    /* JOB METHODS */
    jobResult: function (args) {
//        accountId, sessionId, jobId, format
        //@Path("/{accountid}/{bucketname}/job/{jobid}/result.{format}")
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/result.js' + OpencgaManager.getQuery(queryParams);
        //var url = OpencgaManager.getHost() + '/job/'+jobId+'/result.'+format+'?incvisites=true&sessionid='+sessionId;

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        console.log(url);
    },
    jobResultUrl: function (args) {
//        accountId, sessionId, jobId, format
        var queryParams = {
            'sessionid': args.sessionId
        };
        return OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/result.js' + OpencgaManager.getQuery(queryParams);
    },
    jobStatus: function (args) {
//        accountId, sessionId, jobId
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/status' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        console.log(url);
    },

    table: function (args) {
//        accountId, sessionId, jobId, filename, colNames, colVisibility
        var queryParams = {
            'filename': args.filename,
            'colNames': args.colNames,
            'colVisibility': args.colVisibility,
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/table' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },

    tableurl: function (args) {
//        accountId, sessionId, jobId, filename, colNames, colVisibility
        var queryParams = {
            'filename': args.filename,
            'colNames': args.colNames,
            'colVisibility': args.colVisibility,
            'sessionid': args.sessionId
        };
        return OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/table' + OpencgaManager.getQuery(queryParams);
    },

    poll: function (args) {
//        accountId, sessionId, jobId, filename, zip
        var queryParams = {
            'filename': args.filename,
            'sessionid': args.sessionId
        };
        var url;
        if (args.zip == true) {
            url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/poll' + OpencgaManager.getQuery(queryParams);
            open(url);
        } else {
            queryParams['zip'] = false;
            url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/poll' + OpencgaManager.getQuery(queryParams);

            function success(data) {
                args.success(data);
            }

            function error(data) {
                if(_.isFunction(args.error)) args.error(data);
            }

            OpencgaManager.doGet(url, success, error);
        }
        //	console.log(url);
    },

    pollurl: function (args) {
//        accountId, sessionId, jobId, filename
        var queryParams = {
            'filename': args.filename,
            'sessionid': args.sessionId,
            'zip': false
        };
        return OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/poll' + OpencgaManager.getQuery(queryParams);
        //debugger
    },

    deleteJob: function (args) {
//        accountId, sessionId, jobId
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/delete' + OpencgaManager.getQuery(queryParams);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    },

    downloadJob: function (args) {
//        accountId, sessionId, jobId
        var queryParams = {
            'sessionid': args.sessionId
        };
        open(OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/download' + OpencgaManager.getQuery(queryParams));
    },


    /* ANALYSIS */
    runAnalysis: function (args) {
//        analysis, paramsWS
        var accountId = args.paramsWS.accountid;
        var queryParams = {
//            'projectId':'default'
        };
        var url = OpencgaManager.getAnalysisUrl(accountId, args.analysis) + '/run' + OpencgaManager.getQuery(queryParams);
        console.log(url);
        console.log(args.paramsWS);


        function success(data){
            args.success({status:"done",data:data});
        }

        function error(data){
            if(_.isFunction(args.error)) args.error({status:"fail",data:data});
        }


        $.ajax({type: "POST", url: url, data: args.paramsWS, success: success, error: error});
    },
    indexer: function (args) {
//        accountId, sessionId, bucketId, objectId
        var queryParams = {
            'sessionid': args.sessionId
        };
        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/index' + OpencgaManager.getQuery(queryParams);
        console.log(url);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
    },
    indexerStatus: function (args) {
//        accountId, sessionId, bucketId, objectId, indexerId
        var queryParams = {
            'sessionid': args.sessionId,
            'indexerid': args.indexerId
        };
        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/index_status' + OpencgaManager.getQuery(queryParams);
        console.log(url);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
    },

    localFileList: function (args) {

        var url = OpencgaManager.host + '/getdirs';
        console.log(url);

        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        OpencgaManager.doGet(url, success, error);
    },

    variants: function (args) {
//        accountId, sessionId, jobId, filename
        var queryParams = {
            'sessionid': args.sessionId,
            'filename': args.fileName
        };
        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variants' + OpencgaManager.getQuery(queryParams);
        function success(data) {
            args.success(data);
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }

        $.ajax({
            type: "POST",
            url: url,
            data: args.formData,
            dataType: 'json',
            success: success,
            error: error
        });

//        OpencgaManager.doPost(url, args.formData ,success, error);
        //	console.log(url);
    },
    variantInfo: function (args) {
//        accountId, sessionId, jobId, filename
        var queryParams = {
            'sessionid': args.sessionId,
            'filename': args.fileName
        };
        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variant_info' + OpencgaManager.getQuery(queryParams);
        function success(data) {
            args.success(JSON.parse(data));
        }

        function error(data) {
            if(_.isFunction(args.error)) args.error(data);
        }
        OpencgaManager.doGet(url, success, error);
        //	console.log(url);
    }
};
