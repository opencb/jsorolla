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

function CellBaseManager(species, args) {
//	console.log(species);

    _.extend(this, Backbone.Events);

    this.version = CELLBASE_VERSION;

    //species can be the species code or an object with text attribute
    if (typeof species === 'string') {
        this.species = species;
    } else if (species != null) {
        this.species = Utils.getSpeciesCode(species.text);
    }

    this.category = null;
    this.subcategory = null;

    // commons query params
    this.contentformat = "json";
    this.fileformat = "";
    this.outputcompress = false;
    this.dataType = "script";

    this.query = null;
    this.originalQuery = "";
    this.resource = "";

    this.params = {};

    this.async = true;

    //set instantiation args, must be last
    _.extend(this, args);

    this.host = CELLBASE_HOST || this.host;

    //Events
    this.completed = new Event();
    this.success = new Event();
    this.batchSuccessed = new Event();
    this.error = new Event();
}

CellBaseManager.prototype = {
    setVersion : function (version) {
        this.version = version;
    },
    setSpecies : function (specie) {
        this.species = specie;
    },
    getVersion : function () {
        return this.version;
    },
    getSpecies : function () {
        return this.species;
    },
    setAsync : function (async) {
        this.async = async;
    },

    getQuery: function (paramsWS, url) {
        var chr = "?";
        if (url.indexOf("?") != -1) {
            chr = "&";
        }
        var query = "";
        for (var key in paramsWS) {
            if (paramsWS[key] != null)
                query += key + "=" + paramsWS[key].toString() + "&";
        }
        if (query != "")
            query = chr + query.substring(0, query.length - 1);
        return query;
    },
    getUrl: function () {
        if (this.query != null) {
            return this.host + "/" + this.version + "/" + this.species + "/" + this.category + "/" + this.subcategory + "/" + this.query + "/" + this.resource;
        } else {
            return this.host + "/" + this.version + "/" + this.species + "/" + this.category + "/" + this.subcategory + "/" + this.resource;
        }
    },
    get: function (category, subcategory, query, resource, params) {
        var _this = this;
        if (params != null) {
            this.params = params;
        }
        this.category = category;
        this.subcategory = subcategory;
        if(_.isArray(query)){
            query = query.toString();
        }
        this.query = query;

        this.resource = resource;

        var url = this.getUrl();
        this.params["of"] = this.contentformat;
        url = url + this.getQuery(this.params, url);
        console.log(url);

        if (this.async == true) {
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
                async: this.async,
                success: function (data, textStatus, jqXHR) {
                    data.metadata.params = _this.params;
                    data.metadata.resource = _this.resource;
                    data.metadata.category = _this.category;
                    data.metadata.subcategory = _this.subcategory;
                    _this.success.notify(data);
                },
                complete: function () {
                    _this.completed.notify();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("CellBaseManager: Ajax call returned : " + errorThrown + '\t' + textStatus + '\t' + jqXHR.statusText + " END");
                    _this.error.notify();

                }
            });
        } else {
            var response = null;
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                async: this.async,
                success: function (data, textStatus, jqXHR) {
                    data.metadata.params = _this.params;
                    data.metadata.resource = _this.resource;
                    data.metadata.category = _this.category;
                    data.metadata.subcategory = _this.subcategory;
                    response = data;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("CellBaseManager: Ajax call returned : " + errorThrown + '\t' + textStatus + '\t' + jqXHR.statusText + " END");
                    _this.error.notify();

                }
            });
            return response;
        }
    }
};
