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

var EnsemblManager = {
    host : 'http://beta.rest.ensembl.org',
//    http://beta.rest.ensembl.org/feature/region/human/7:140424943-140624564?feature=gene;feature=transcript;feature=exon;content-type=application/json
    get: function (args) {
        var success = args.success;
        var error = args.error;
        var async = (_.isUndefined(args.async) || _.isNull(args.async) ) ? true : args.async;
        var urlConfig = _.omit(args, ['success', 'error', 'async']);

        var url = EnsemblManager.url(urlConfig);
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
                    if (_.isFunction(success)) success(data);
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
    },
    url: function (args) {
        if (!$.isPlainObject(args)) args = {};
        if (!$.isPlainObject(args.params)) args.params = {};

        var host = EnsemblManager.host;
        if (typeof args.host !== 'undefined') {
            host =  args.host;
        }
        if(typeof host === 'undefined'){
            console.log("CELLBASE_HOST is not configured");
            return;
        }

        delete args.host;

        var config = {
            host: host
        };

        var params = {
            'content-type':'application/json'
        };

        _.extend(config, args);
        _.extend(config.params, params);

        //species can be the species code(String) or an object with text attribute
        if ($.isPlainObject(config.species)) {
            config.species = Utils.getSpeciesCode(config.species.text);
        }

        var url = config.host + '/' + config.category + '/' + config.subCategory + '/' + config.species + '/' +  config.query;
        url = Utils.addQueryParamtersToUrl(config.params, url);
        return url;
    }
};