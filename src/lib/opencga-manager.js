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

/**
 * Composes an url with the given parameters.
 * resourceType: any of OpencgaManager.resourceTypes.
 * resourceId: id of the resource in catalog.
 * action: all actions are in OpencgaManager.actions, but some methods don't allow every action.
 * queryParams: Object with the query parameters.
 * args: Object with extra arguments, like the success callback function, or host override.
 *
 * examples of use:
 *
 * OpencgaManager.users.create({
 *      query:{
 *          userId: 'user1',
 *          name: 'User One',
 *          email: 'user@example.com',
 *          password: 'password_one'
 *      },
 *      request:{
 *          success:function(response){
 *              console.log(response);
 *          },
 *          error:function(){
 *              console.log('Server error');
 *          }
 *      }
 * });
 *
 * OpencgaManager.users.login({
 *      id:'user1',
 *      query:{
 *          password: 'password_one'
 *      },
 *      request:{
 *          success:function(response){
 *              console.log(response);
 *          },
 *          error:function(){
 *              console.log('Server error');
 *          }
 *      }
 * });
 *
 * OpencgaManager.users.info({
 *      id:'user1',
 *      query:{
 *          sid: Cookies('bioinfo_sid'),
 *          lastActivity: 'lastActivity'
 *      },
 *      request:{
 *          success:function(response){
 *              console.log(response);
 *          },
 *          error:function(){
 *              console.log('Server error');
 *          }
 *      }
 * });
 *
 *    http://cafetal:8080/opencga/rest/files/3/fetch?region=20:100-200&sid=nsrblm
 *    http://cafetal:8080/opencga/rest/files/17/fetch?sid=eUZtTdnA9EU89vjACyAe&region=20%3A80000-82000&view_as_pairs=false&include_coverage=true&process_differences=false
 *    http://cafetal:8080/opencga/rest/files/17/fetch?sid=eUZtTdnA9EU89vjACyAe&region=20%3A80000-82000&view_as_pairs=false&include_coverage=true&process_differences=false
 */
var OpencgaManager = {
//    host: (typeof OPENCGA_HOST === 'undefined') ? 'http://ws.bioinfo.cipf.es/opencga/rest' : OPENCGA_HOST,
    host: (typeof OPENCGA_HOST === 'undefined') ? 'http://cafetal:8080/opencga/rest' : OPENCGA_HOST,
    version: (typeof OPENCGA_VERSION === 'undefined') ? 'v3' : OPENCGA_VERSION,

    users: {
        login: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'login');
        },
        logout: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'logout');
        },
        read: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'info');
        },
        update: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'modify');
        },
        updateEmail: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'change-email');
        },
        updatePassword: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'change-password');
        },
        resetPassword: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'reset-password');
        },
        create: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'create');
        },
        delete: function (args) {
            return OpencgaManager._doRequest(args, 'users', 'delete');
        }
    },

    projects: {
        list: function (args) {
            return OpencgaManager._doRequest(args, 'projects', 'all-projects');
        },
        read: function (args) {
            return OpencgaManager._doRequest(args, 'projects', 'info');
        },
        update: function (args) {
            return OpencgaManager._doRequest(args, 'projects', 'modify');
        },
        create: function (args) {
            return OpencgaManager._doRequest(args, 'projects', 'create');
        },
        delete: function (args) {
            return OpencgaManager._doRequest(args, 'projects', 'delete');
        },
        studies: function (args) {
            return OpencgaManager._doRequest(args, 'projects', 'studies');
        }
    },

    studies: {
        list: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'all-studies');
        },
        read: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'info');
        },
        update: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'modify');
        },
        create: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'create');
        },
        delete: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'delete');
        },
        analysis: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'analysis');
        },
        job: function (args) {
            return OpencgaManager._doRequest(args, 'studies', 'job');
        }
    },

    files: {
        list: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'list');
        },
        fetch: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'fetch');
        },
        read: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'info');
        },
        info: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'info');
        },
        delete: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'delete');
        },
        index: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'index');
        },
        search: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'search');
        },
        filesByFolder: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'files');
        },
        content: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'content');
        },
        contentGrep: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'content-grep');
        },
        createFolder: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'create-folder');
        },
        setHeader: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'set-header');
        },
        contentExample: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'content-example');
        },
        downloadExample: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'download-example');
        },
        modify: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'modify');
        },
        download: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'download');
        },
        upload: function (args) {
            return OpencgaManager._doRequest(args, 'files', 'upload');
        },
        upload2: function (args) {
            var url = OpencgaManager._url({
                query: {
                    sid: args.sid
                },
                request: {}
            }, 'files', 'upload');
            args.url = url;
            OpencgaManager._uploadFile(args);
        }

    },
    jobs: {
        create: function (args) {
            return OpencgaManager._doRequest(args, 'job', 'create');
        },
        delete: function (args) {
            return OpencgaManager._doRequest(args, 'job', 'delete');
        }
    },
    util: {
        proxy: function (args) {
            return OpencgaManager._doRequest(args, 'util', 'proxy');
        }
    },
    //analysis: {
    //    jobs: function (args) {
    //        return OpencgaManager._doRequest(args, 'analysis', 'jobs');
    //    },
    //    create: function (args) {
    //        return OpencgaManager._doRequest(args, 'analysis', 'create');
    //    }
    //},
    _url: function (args, api, action) {
        var host = OpencgaManager.host;
        if (typeof args.request.host !== 'undefined' && args.request.host != null) {
            host = args.request.host;
        }
        var version = OpencgaManager.version;
        if (typeof args.request.version !== 'undefined' && args.request.version != null) {
            version = args.request.version;
        }
        var id = '';
        if (typeof args.id !== 'undefined' && args.id != null) {
            id = '/' + args.id;
        }

        var url = host + '/' + api + id + '/' + action;
        url = Utils.addQueryParamtersToUrl(args.query, url);
        return url;
    },

    _doRequest: function (args, api, action) {
        var url = OpencgaManager._url(args, api, action);
        if (args.request.url === true) {
            return url;
        } else {
            var method = 'GET';
            if (typeof args.request.method !== 'undefined' && args.request.method != null) {
                method = args.request.method;
            }
            var async = true;
            if (typeof args.request.async !== 'undefined' && args.request.async != null) {
                async = args.request.async;
            }

            console.log(url);
            var request = new XMLHttpRequest();
            request.onload = function () {
                var contentType = this.getResponseHeader('Content-Type');
                if (contentType === 'application/json') {
                    args.request.success(JSON.parse(this.response), this);
                } else {
                    args.request.success(this.response, this);
                }
            };
            request.onerror = function () {
                args.request.error(this);
            };
            request.open(method, url, async);
            request.send();
            return url;
        }
    },
    _uploadFile: function (args) {
        var url = args.url;
        var inputFile = args.inputFile;
        var fileName = args.fileName;
        var userId = args.userId;
        var studyId = args.studyId;
        var relativeFilePath = args.relativeFilePath;
        var fileFormat = args.fileFormat;
        var bioFormat = args.bioFormat;
        var description = args.description;
        var callbackProgress = args.callbackProgress;

        /**/
        var resume = true;
        var resumeInfo = {};
        var chunkMap = {};
        var chunkId = 0;
        var blob = inputFile;
        var BYTES_PER_CHUNK = 2 * 1024 * 1024;
        var SIZE = blob.size;
        var NUM_CHUNKS = Math.max(Math.ceil(SIZE / BYTES_PER_CHUNK), 1);
        var start;
        var end;


        var getResumeInfo = function (formData) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, false);//false = sync call
            xhr.send(formData);
            var response = JSON.parse(xhr.responseText);
            return response.response[0];
        };
        var checkChunk = function (id, size, resumeInfo) {
            if (typeof resumeInfo[id] === 'undefined') {
                return false;
            } else if (resumeInfo[id].size != size /*|| resumeInfo[id].hash != hash*/) {
                return false;
            }
            return true;
        };
        var processChunk = function (c) {
            var chunkBlob = blob.slice(c.start, c.end);

            if (checkChunk(c.id, chunkBlob.size, resumeInfo) == false) {
                var formData = new FormData();
                formData.append('chunk_content', chunkBlob);
                formData.append('chunk_id', c.id);
                formData.append('chunk_size', chunkBlob.size);
                /*formData.append('chunk_hash', hash);*/
                formData.append("filename", fileName);
                formData.append('userId', userId);
                formData.append('studyId', studyId);
                formData.append('relativeFilePath', relativeFilePath);
                /*formData.append('chunk_gzip', );*/
                if (c.last) {
                    formData.append("last_chunk", true);
                    formData.append("total_size", SIZE);
                    formData.append("fileFormat", fileFormat);
                    formData.append("bioFormat", bioFormat);
                    formData.append("description", description);
                }
                uploadChunk(formData, c, function (chunkResponse) {
                    callbackProgress(c, NUM_CHUNKS, chunkResponse);
                    if (!c.last) {
                        processChunk(chunkMap[(c.id + 1)]);
                    } else {

                    }
                });
            } else {
                callbackProgress(c, NUM_CHUNKS);
                if (!c.last) {
                    processChunk(chunkMap[(c.id + 1)]);
                } else {

                }
            }

        };
        var uploadChunk = function (formData, chunk, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.onload = function (e) {
                chunk.done = true;
                console.log("chunk done");
                callback(JSON.parse(xhr.responseText));
            };
            xhr.send(formData);
        };

        /**/
        /**/

        if (resume) {
            var resumeFormData = new FormData();
            resumeFormData.append('resume_upload', resume);
            resumeFormData.append('filename', fileName);
            resumeFormData.append('userId', userId);
            resumeFormData.append('studyId', studyId);
            resumeFormData.append('relativeFilePath', relativeFilePath);
            resumeInfo = getResumeInfo(resumeFormData);
        }

        start = 0;
        end = BYTES_PER_CHUNK;
        while (start < SIZE) {
            var last = false;
            if (chunkId == (NUM_CHUNKS - 1)) {
                last = true;
            }
            chunkMap[chunkId] = {
                id: chunkId,
                start: start,
                end: end,
                done: false,
                last: last
            };
            start = end;
            end = start + BYTES_PER_CHUNK;
            chunkId++;
        }
        processChunk(chunkMap[0]);

    },


    /**/
    /**/
    /**/
    /**/
    /**/
    /**/
    /**/
    /**/
    /**/
    /**/
    /**/
    resourceTypes: {
        USERS: "users",
        PROJECTS: "projects",
        STUDIES: "studies",
        FILES: "files",
        ANALYSES: "analyses",
        JOBS: "jobs"
    },
    actions: {
        LOGIN: "login",
        LOGOUT: "logout",
        CREATE: "create",
        UPLOAD: "upload",
        INFO: "info",
        LIST: "list",
        FETCH: "fetch",
        UPDATE: "update",
        DELETE: "delete"
    },
    httpMethods: {},    // defined after OpencgaManager

    /**
     * @param queryParams required: password, sid (sessionId)
     * @return sid (sessionId)
     */
    login: function (userId, queryParams, args) {
        this._call(this.resourceTypes.USERS, userId, this.actions.LOGIN, queryParams, args);
    },
    /**
     * @param queryParams required: sid (sessionId)
     */
    logout: function (userId, queryParams, args) {
        this._call(this.resourceTypes.USERS, "", this.actions.LOGOUT, queryParams, args);
    },
    /**
     * @param queryParams required: {resource}Id, password, sid (sessionId)
     */
    create: function (resourceType, queryParams, args) {
        this._call(resourceType, "", this.actions.CREATE, queryParam, args);
    },
    /**
     * @param queryParams required: sid (sessionId)
     */
    upload: function (resourceType, queryParams, args) {
        this._call(resourceType, "", this.actions.UPLOAD, queryParams, args);
    },
    /**
     * @param action restricted to OpencgaManager.actions.INFO, OpencgaManager.actions.FETCH
     * @param queryParams required: sid (sessionId)
     */
    get: function (resourceType, resourceId, action, queryParams, args) {
//        resourceId = "7";
        _.extend(queryParams, {
            sid: "RNk4P0ttFGHyqLA3YGS8",
            view_as_pairs: 'false',
            include_coverage: 'true',
            process_differences: 'false'
        });
        this._call(resourceType, resourceId, action, queryParams, args);
    },
    /**
     * @param queryParams required: sid (sessionId)
     */
    list: function (resourceType, queryParams, args) {
        this._call(resourceType, "", this.actions.LIST, queryParams, args);
    },
    /**
     * @param queryParams required: sid (sessionId)
     */
    update: function (resourceType, resourceId, queryParams, args) {
        this._call(resourceType, resourceId, this.actions.UPDATE, queryParams, args);
    },
    /**
     * @param queryParams required: sid (sessionId)
     */
    delete: function (resourceType, resourceId, queryParams, args) {
        this._call(resourceType, resourceId, this.actions.DELETE, queryParams, args);
    },

    _call: function (resourceType, resourceId, action, queryParams, args) {
        var url = this._url(resourceType, resourceId, action, queryParams, args);

        if (typeof url === 'undefined' || url == null) {
            return;
        }
        console.log(url);
        var async = (_.isUndefined(args.async) || _.isNull(args.async) ) ? true : args.async;
        var success = args.success;
        var error = args.error;

        var d;
        $.ajax({
            type: OpencgaManager.httpMethods[resourceType],
            url: url,
            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
            async: async,
            success: function (data, textStatus, jqXHR) {
                if ($.isPlainObject(data) || $.isArray(data)) {
//                    data.params = args.params;
//                    data.resource = args.resource;
//                    data.category = args.category;
//                    data.subCategory = args.subCategory;
                    if (_.isFunction(success)) {
                        success(data);
                    }
                    d = data;
                } else {
                    console.log('Cellbase returned a non json object or list, please check the url.');
                    console.log(url);
                    console.log(data)
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("CellBaseManager: Ajax call returned : " + errorThrown + '\t' + textStatus + '\t' + jqXHR.statusText + " END");
                if (_.isFunction(error)) {
                    error(jqXHR, textStatus, errorThrown);
                }
            }
        });
        return url;
    },

    _url2: function (resourceType, resourceId, action, queryParams, args) {
        if (resourceId == undefined || resourceId == null) {
            resourceId = "";
        } else {
            resourceId = resourceId + "/";
        }
        var host = this.host;
        if (typeof args.host !== 'undefined' && args.host != null) {
            host = args.host;
        }
        var opencga = this.opencga;
        if (typeof args.opencga !== 'undefined' && args.opencga != null) {
            opencga = args.opencga;
        }
        /* still no version in the REST api
         var version = this.version;
         if(typeof args.version !== 'undefined' && args.version != null){
         version = args.version
         }
         */
        var url = host + opencga + resourceType + '/' + resourceId + action;
        /*
         _.extend(queryParams, {
         sid: 'RNk4P0ttFGHyqLA3YGS8',
         view_as_pairs: 'false',
         include_coverage: 'true',
         process_differences: 'false'
         });*/

        url = Utils.addQueryParamtersToUrl(queryParams, url);
        return url;
    }

    /*
     get: function (args) {
     var success = args.success;
     var error = args.error;
     var async = (_.isUndefined(args.async) || _.isNull(args.async) ) ? true : args.async;
     var urlConfig = _.omit(args, ['success', 'error', 'async']);

     var url = OpencgaManager.url(urlConfig);
     if(typeof url === 'undefined'){
     return;
     }
     console.log(url);

     var d;
     $.ajax({
     type: "GET",
     url: url,
     dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
     async: async,
     success: function (data, textStatus, jqXHR) {
     if($.isPlainObject(data) || $.isArray(data)){
     //                    data.params = args.params;
     //                    data.resource = args.resource;
     //                    data.category = args.category;
     //                    data.subCategory = args.subCategory;
     if (_.isFunction(success)) {
     success(data);
     }
     d = data;
     }else{
     console.log('Cellbase returned a non json object or list, please check the url.');
     console.log(url);
     console.log(data)
     }
     },
     error: function (jqXHR, textStatus, errorThrown) {
     console.log("CellBaseManager: Ajax call returned : " + errorThrown + '\t' + textStatus + '\t' + jqXHR.statusText + " END");
     if (_.isFunction(error)) error(jqXHR, textStatus, errorThrown);
     }
     });
     return d;
     },*/
//////// old version
//    host: (typeof OPENCGA_HOST === 'undefined') ? 'http://ws.bioinfo.cipf.es/opencga/rest' : OPENCGA_HOST,
//    getHost: function () {
//        return OpencgaManager.host;
//    },
//    setHost: function (hostUrl) {
//        OpencgaManager.host = hostUrl;
//    },
//    doGet: function (url, successCallback, errorCallback) {
//        $.ajax({
//            type: "GET",
//            url: url,
//            success: successCallback,
//            error: errorCallback
//        });
//    },
//    doPost: function (url, formData, successCallback, errorCallback) {
//        $.ajax({
//            type: "POST",
//            url: url,
//            data: formData,
//            processData: false,  // tell jQuery not to process the data
//            contentType: false,  // tell jQuery not to set contentType
//            success: successCallback,
//            error: errorCallback
//        });
//    },
//    getQuery: function (paramsWS) {
//        var query = "";
//        for (var key in paramsWS) {
//            if (paramsWS[key] != null)
//                query += key + '=' + paramsWS[key] + '&';
//        }
//        if (query != '')
//            query = "?" + query.slice(0, -1);
//        return query;
//    },
//
//
//    getAccountUrl: function (accountId) {
//        return OpencgaManager.getHost() + '/account/' + accountId;
//    },
//    getStorageUrl: function (accountId) {
//        return OpencgaManager.getAccountUrl(accountId) + '/storage';
//    },
//    getAdminProfileUrl: function (accountId) {
//        return OpencgaManager.getAccountUrl(accountId) + '/admin/profile';
//    },
//    getAdminBucketUrl: function (accountId, bucketId) {
//        return OpencgaManager.getAccountUrl(accountId) + '/admin/bucket/' + bucketId;
//    },
//    getAdminProjectUrl: function (accountId, projectId) {
//        return OpencgaManager.getAccountUrl(accountId) + '/admin/project/' + projectId;
//    },
//    getBucketUrl: function (accountId, bucketId) {
//        return OpencgaManager.getStorageUrl(accountId) + '/' + bucketId;
//    },
//    getObjectUrl: function (accountId, bucketId, objectId) {
//        return OpencgaManager.getStorageUrl(accountId) + '/' + bucketId + '/' + objectId;
//    },
//    getAnalysisUrl: function (accountId, analysis) {
//        return OpencgaManager.getAccountUrl(accountId) + '/analysis/' + analysis;
//    },
//    getJobAnalysisUrl: function (accountId, jobId) {
//        return OpencgaManager.getAccountUrl(accountId) + '/analysis/job/' + jobId;
//    },
//    getUtilsUrl: function () {
//        return OpencgaManager.getHost() + '/utils';
//    },
//    /*ACCOUNT METHODS*/
//    createAccount: function (args) {
////      accountId, email, name, password, suiteId
//        var queryParams = {
//            'name': args.name,
//            'email': args.email,
//            'password': args.password,
//            'suiteid': args.suiteId
//        };
//        var url = OpencgaManager.getAccountUrl(args.accountId) + '/create' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    login: function (args) {
////        accountId, password, suiteId
//        var queryParams = {
//            'password': args.password,
//            'suiteid': args.suiteId
//        };
//        var url = OpencgaManager.getAccountUrl(args.accountId) + '/login' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    logout: function (args) {
////        accountId, sessionId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAccountUrl(args.accountId) + '/logout' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    getAccountInfo: function (args) {
////        accountId, sessionId, lastActivity
////        console.log(args.lastActivity)
//        var queryParams = {
//            'last_activity': args.lastActivity,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAccountUrl(args.accountId) + '/info' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                if (data.response.errorMsg === '') {
//                    args.success(data.response.result[0]);
//                } else {
//                    $.cookie('bioinfo_sid', null);
//                    $.cookie('bioinfo_sid', null, {path: '/'});
//                    $.cookie('bioinfo_account', null);
//                    $.cookie('bioinfo_account', null, {path: '/'});
//                    console.log(data);
//                }
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    changePassword: function (args) {
////        accountId, sessionId, old_password, new_password1, new_password2
//        var queryParams = {
//            'old_password': args.old_password,
//            'new_password1': args.new_password1,
//            'new_password2': args.new_password2,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAdminProfileUrl(args.accountId) + '/change_password' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    resetPassword: function (args) {
////        accountId, email
//        var queryParams = {
//            'email': args.email
//        };
//        var url = OpencgaManager.getAdminProfileUrl(args.accountId) + '/reset_password' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    changeEmail: function (args) {
////        accountId, sessionId, new_email
//        var queryParams = {
//            'new_email': args.new_email,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAdminProfileUrl(args.accountId) + '/change_email' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    /* BUCKET METHODS */
//    getBuckets: function () {
//        return 'TODO';
//    },
//
//    createBucket: function (args) {
////        bucketId, description, accountId, sessionId
//        var queryParams = {
//            'description': args.description,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAdminBucketUrl(args.accountId, args.bucketId) + '/create' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    refreshBucket: function (args) {
////        accountId, bucketId, sessionId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAdminBucketUrl(args.accountId, args.bucketId) + '/refresh' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    renameBucket: function (args) {
////        accountId, bucketId, newBucketId, sessionId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getAdminBucketUrl(args.accountId, args.bucketId) + '/rename/' + args.newBucketId + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    deleteBucket: 'TODO',
//    shareBucket: 'TODO',
//
//    uploadObjectToBucket: function (args) {
////        accountId, sessionId, bucketId, objectId, formData, parents
//        var queryParams = {
//            'parents': (args.parents || false),
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/upload' + OpencgaManager.getQuery(queryParams);
//        $.ajax({
//            type: "POST",
//            url: url,
//            data: args.formData,
//            processData: false,  // tell jQuery not to process the data
//            contentType: false,  // tell jQuery not to set contentType
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    createDirectory: function (args) {
////        accountId, sessionId, bucketId, objectId, parents
//        args.objectId = args.objectId.replace(new RegExp("/", "gi"), ":");
//        var queryParams = {
//            'parents': (args.parents || false),
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/create_directory' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    deleteObjectFromBucket: function (args) {
////        accountId, sessionId, bucketId, objectId
//        args.objectId = args.objectId.replace(new RegExp("/", "gi"), ":");
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/delete' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    pollObject: function (args) {
////       accountId, sessionId, bucketId, objectId
//        var queryParams = {
//            'start': args.start,
//            'limit': args.limit,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/poll' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            async: args.async,
//            success: function (data, textStatus, jqXHR) {
//                args.success(data);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    grepObject: function (args) {
////       accountId, sessionId, bucketId, objectId
//        var queryParams = {
//            'pattern': encodeURIComponent(args.pattern),
//            'ignoreCase': args.ignoreCase,
//            'multi': args.multi,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/grep' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            async: args.async,
//            success: function (data, textStatus, jqXHR) {
//                args.success(data);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    region: function (args) {
////        accountId, sessionId, bucketId, objectId, region, queryParams
//        args.objectId = args.objectId.replace(new RegExp("/", "gi"), ":");
//        args.queryParams["sessionid"] = args.sessionId;
//        args.queryParams["region"] = args.region;
//        args.queryParams["cellbasehost"] = CELLBASE_HOST + '/' + CELLBASE_VERSION;
//
//        if (OpencgaManager.host.indexOf("localhost") != -1) {
//            args.queryParams["region"] = args.region;
//            args.queryParams["filepath"] = args.objectId;
//            var url = OpencgaManager.host + '/storage/fetch' + OpencgaManager.getQuery(args.queryParams);
//        } else {
//            var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/fetch' + OpencgaManager.getQuery(args.queryParams);
//        }
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
////                args.success(data.response);
//
////               TODO fix
//                if (!(data.substr(0, 5).indexOf('ERROR') != -1)) {
//                    var jsonData = JSON.parse(data);
//                    var r = {response: []};
//                    for (var i = 0; i < args.region.length; i++) {
//                        var result = jsonData[i];
//                        // TODO temporal fix
//                        r.response.push({
//                            id: args.region[i],
//                            result: jsonData[i]
//                        });
//                    }
//                    args.success(r);
////                args.success({resource: args.queryParams["category"], response: JSON.parse(data), filename: args.objectId, query: args.region, params: args.queryParams});
//                }
//
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//
//        function success(data) {
//
//        }
//    },
//
//    /* JOB METHODS */
//    jobResult: function (args) {
////        accountId, sessionId, jobId, format
//        //@Path("/{accountid}/{bucketname}/job/{jobid}/result.{format}")
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/result.js' + OpencgaManager.getQuery(queryParams);
//        //var url = OpencgaManager.getHost() + '/job/'+jobId+'/result.'+format+'?incvisites=true&sessionid='+sessionId;
//
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//
////        function success(data) {
////            args.success(data);
////        }
////
////        function error(data) {
////            if (_.isFunction(args.error)) args.error(data);
////        }
////
////        OpencgaManager.doGet(url, success, error);
////        console.log(url);
//    },
//    jobResultUrl: function (args) {
////        accountId, sessionId, jobId, format
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        return OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/result.js' + OpencgaManager.getQuery(queryParams);
//    },
//    jobStatus: function (args) {
////        accountId, sessionId, jobId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/status' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    table: function (args) {
////        accountId, sessionId, jobId, filename, colNames, colVisibility
//        var queryParams = {
//            'filename': args.filename,
//            'colNames': args.colNames,
//            'colVisibility': args.colVisibility,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/table' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    tableurl: function (args) {
////        accountId, sessionId, jobId, filename, colNames, colVisibility
//        var queryParams = {
//            'filename': args.filename,
//            'colNames': args.colNames,
//            'colVisibility': args.colVisibility,
//            'sessionid': args.sessionId
//        };
//        return OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/table' + OpencgaManager.getQuery(queryParams);
//    },
//
//    poll: function (args) {
////        accountId, sessionId, jobId, filename, zip
//        var queryParams = {
//            'filename': args.filename,
//            'sessionid': args.sessionId
//        };
//        var url;
//        if (args.zip == true) {
//            url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/poll' + OpencgaManager.getQuery(queryParams);
//            open(url);
//        } else {
//            queryParams['zip'] = false;
//            url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/poll' + OpencgaManager.getQuery(queryParams);
//
//            $.ajax({
//                type: "GET",
//                url: url,
//                async: args.async,
//                success: function (data, textStatus, jqXHR) {
//                    args.success(data);
//                },
//                error: function (jqXHR, textStatus, errorThrown) {
//                    if (_.isFunction(args.error)) args.error(jqXHR);
//                }
//            });
//        }
//    },
//
//    jobFileGrep: function (args) {
////        accountId, sessionId, jobId, filename, zip
//        var queryParams = {
//            'pattern': encodeURIComponent(args.pattern),
//            'ignoreCase': args.ignoreCase,
//            'multi': args.multi,
//            'filename': args.filename,
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/grep' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            async: args.async,
//            success: function (data, textStatus, jqXHR) {
//                args.success(data);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//
//    pollurl: function (args) {
////        accountId, sessionId, jobId, filename
//        var queryParams = {
//            'filename': args.filename,
//            'sessionid': args.sessionId,
//            'zip': false
//        };
//        return OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/poll' + OpencgaManager.getQuery(queryParams);
//        //debugger
//    },
//
//    deleteJob: function (args) {
////        accountId, sessionId, jobId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/delete' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    downloadJob: function (args) {
////        accountId, sessionId, jobId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        open(OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/download' + OpencgaManager.getQuery(queryParams));
//    },
//
//    jobInfo: function (args) {
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/info' + OpencgaManager.getQuery(queryParams);
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//
//    /* ANALYSIS */
//    runAnalysis: function (args) {
////        analysis, paramsWS
//        var accountId = args.paramsWS.accountid;
//        var queryParams = {
////            'projectId':'default'
//        };
//        var url = OpencgaManager.getAnalysisUrl(accountId, args.analysis) + '/run' + OpencgaManager.getQuery(queryParams);
//        console.log(url);
//
//        $.ajax({
//            type: "POST",
//            url: url,
//            data: args.paramsWS,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    indexer: function (args) {
////        accountId, sessionId, bucketId, objectId
//        var queryParams = {
//            'sessionid': args.sessionId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/index' + OpencgaManager.getQuery(queryParams);
//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
//            success: function (data, textStatus, jqXHR) {
//                args.success(data.response);
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                if (_.isFunction(args.error)) args.error(jqXHR);
//            }
//        });
//    },
//    indexerStatus: function (args) {
////        accountId, sessionId, bucketId, objectId, indexerId
//        var queryParams = {
//            'sessionid': args.sessionId,
//            'indexerid': args.indexerId
//        };
//        var url = OpencgaManager.getObjectUrl(args.accountId, args.bucketId, args.objectId) + '/index_status' + OpencgaManager.getQuery(queryParams);
//        console.log(url);
//
//        function success(data) {
//            args.success(data);
//        }
//
//        function error(data) {
//            if (_.isFunction(args.error)) args.error(data);
//        }
//
//        OpencgaManager.doGet(url, success, error);
//    },
//
//    localFileList: function (args) {
//
//        var url = OpencgaManager.host + '/getdirs';
//        console.log(url);
//
//        function success(data) {
//            args.success(data);
//        }
//
//        function error(data) {
//            if (_.isFunction(args.error)) args.error(data);
//        }
//
//        OpencgaManager.doGet(url, success, error);
//    },
//
//
//    /********/
//    /********/
//    /********/
//    /********/
//    /********/
//    // variation
//    variantsUrl: function (args) {
////        accountId, jobId
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variantsMongo'
//        return url
//    },
//    variantInfoMongo: function (args) {
////        accountId, sessionId, jobId, filename
//        var queryParams = {
//            'sessionid': args.sessionId
////            'filename': args.filename
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variantInfoMongo' + OpencgaManager.getQuery(queryParams);
//
//        function success(data) {
//            console.log(data);
//            args.success(data);
//        }
//
//        function error(data) {
//            if (_.isFunction(args.error)) args.error(data);
//        }
//
//        $.ajax({
//            type: "GET",
//            url: url,
//            async: args.async,
//            success: success,
//            error: error
//        });
//        //	console.log(url);
//    },
//
//
//    variant_effects: function (args) {
////        accountId, sessionId, jobId, filename
//        var queryParams = {
//            'sessionid': args.sessionId,
//            'filename': args.filename
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variant_effects' + OpencgaManager.getQuery(queryParams);
//
//        function success(data) {
//            args.success(data);
//        }
//
//        function error(data) {
//            if (_.isFunction(args.error)) args.error(data);
//        }
//
//        $.ajax({
//            type: "POST",
//            url: url,
//            data: args.formData,
//            dataType: 'json',
//            success: success,
//            error: error
//        });
//
////        OpencgaManager.doPost(url, args.formData ,success, error);
//        //	console.log(url);
//    },
//    variantInfo: function (args) {
////        accountId, sessionId, jobId, filename
//        var queryParams = {
//            'sessionid': args.sessionId,
//            'filename': args.filename
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variant_info' + OpencgaManager.getQuery(queryParams);
//
//        function success(data) {
//            console.log(data);
//            args.success(data);
//        }
//
//        function error(data) {
//            if (_.isFunction(args.error)) args.error(data);
//        }
//
//        OpencgaManager.doGet(url, success, error);
//        //	console.log(url);
//    },
//    variantStats: function (args) {
////        accountId, sessionId, jobId, filename
//        var queryParams = {
//            'sessionid': args.sessionId,
//            'filename': args.fileName
//        };
//        var url = OpencgaManager.getJobAnalysisUrl(args.accountId, args.jobId) + '/variant_stats' + OpencgaManager.getQuery(queryParams);
//
//        function success(data) {
//            args.success(data);
//        }
//
//        function error(data) {
//            if (_.isFunction(args.error)) args.error(data);
//        }
//
//        $.ajax({
//            type: "POST",
//            url: url,
//            data: args.formData,
//            dataType: 'json',
//            success: success,
//            error: error
//        });
//
////        OpencgaManager.doPost(url, args.formData ,success, error);
//        //	console.log(url);
//    }
};


OpencgaManager.httpMethods[OpencgaManager.actions.LOGIN] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.LOGOUT] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.CREATE] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.UPLOAD] = "POST";
OpencgaManager.httpMethods[OpencgaManager.actions.INFO] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.LIST] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.FETCH] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.UPDATE] = "GET";
OpencgaManager.httpMethods[OpencgaManager.actions.DELETE] = "GET";
