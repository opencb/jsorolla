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

var CellBaseManager = {
    get: function (args) {
        var success = args.success;
        var error = args.error;
        var async = (_.isUndefined(args.async) || _.isNull(args.async) ) ? true : args.async;
        var urlConfig = _.omit(args, ['success', 'error', 'async']);

        var url = CellBaseManager.url(urlConfig);
        console.log(url);

        var d;
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
            async: async,
            success: function (data, textStatus, jqXHR) {
                data.params = args.params;
                data.resource = args.resource;
                data.category = args.category;
                data.subCategory = args.subCategory;
                if (_.isFunction(success)) success(data);
                d = data;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("CellBaseManager: Ajax call returned : " + errorThrown + '\t' + textStatus + '\t' + jqXHR.statusText + " END");
                if (_.isFunction(error)) error(jqXHR, textStatus, errorThrown);
            }
        });
        return d;
    },
    url: function (args) {
        if (!_.isObject(args)) args = {};
        if (!_.isObject(args.params)) args.params = {};

        if (_.isUndefined(args.host) || _.isNull(args.host)) {
            delete args.host;
        }
        if (_.isUndefined(args.version) || _.isNull(args.version)) {
            delete args.version;
        }

        var config = {
            host: CELLBASE_HOST,
            version: CELLBASE_VERSION
        };
        var params = {
            of: 'json'
        };

        _.extend(config, args);
        _.extend(config.params, params);

        var query = '';
        if (!_.isUndefined(config.query) && !_.isNull(config.query)) {
            if (_.isArray(config.query)) {
                config.query = config.query.toString();
            }
            query = '/' + config.query;
        }

        //species can be the species code(String) or an object with text attribute
        if (!_.isString(config.species)) {
            config.species = Utils.getSpeciesCode(config.species.text);
        }

        var url = config.host + '/' + config.version + '/' + config.species + '/' + config.category + '/' + config.subCategory + query + '/' + config.resource;
        url = Utils.addQueryParamtersToUrl(config.params, url);
        return url;
    }
};