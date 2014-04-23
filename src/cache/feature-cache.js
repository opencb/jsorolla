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

function FeatureCache(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

//    this.args = args;

    // Default values
    this.id = Utils.genId("FeatureCache");
    // Accepted values are 'memory' and 'indexeddb' [memory]
    this.storeType = 'memory';
    this.chunkSize = 50000;
    this.maxSize = 10*1024*1024;
    this.size = 0;
    this.verbose = false;
    this.gzip = true;

    // Now we set the args parameters
    // must be the last instruction
    _.extend(this, args);



    this.store;

//    this.cache = {};
    this.chunksDisplayed = {};

    this.maxFeaturesInterval = 0;

    this.init();
};

FeatureCache.prototype = {

    init: function() {
        this.size = 0;
        if(typeof this.storeType === 'undefined' || this.storeType == 'memory') {
            this.store = new MemoryStore({});
        }else {
            this.store = new IndexedDBStore({});
        }
//        this.cache = {};
    },

    _getChunk: function(position){
        return Math.floor(position/this.chunkSize);
    },

    _getChunkKey: function(chromosome, chunkId){
        return chromosome + ":" + chunkId;
    },

    getChunkRegion: function(region){
        start = this._getChunk(region.start) * this.chunkSize;
        end = (this._getChunk(region.end) * this.chunkSize) + this.chunkSize-1;
        return {start: start, end: end};
    },

    getFirstFeature: function(){
       return this.store.get(Object.keys(this.store.store)[0].key)[0];
    },


//new
    getFeatureChunk: function(key){
        return this.store.get(key);
    },
//new
    getFeatureChunksByRegion: function(region){
        var firstRegionChunk, lastRegionChunk;
        var chunks = [];
        var key;
        firstRegionChunk = this._getChunk(region.start);
        lastRegionChunk = this._getChunk(region.end);
        for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
            key = region.chromosome+":"+i;

            // check if this key exists in cache (features from files)
            var feature = this.store.get(key);
            if(!_.isUndefined(feature)){
                chunks.push(feature);
            }
        }
        // Returns empty list if nothing was found
        return chunks;
    },


    putFeatureByRegion:function(feature, region){

        var firstFeatureChunk = this._getChunk(feature.start);
        var lastFeatureChunk = this._getChunk(feature.end);

        var firstRegionChunk = this._getChunk(region.start);
        var lastRegionChunk = this._getChunk(region.end);

        for(var i=firstFeatureChunk; i<=lastFeatureChunk; i++) {
            if(i >= firstRegionChunk && i<= lastRegionChunk){//only if is inside the called region
                key = region.chromosome+":"+i;
                this.store.put()
                this.cache[key][dataType].push(gzipFeature);
            }
        }
    },

    putFeaturesByRegion: function(featureDataList, region){
        var key, firstRegionChunk, lastRegionChunk, firstChunk, lastChunk, feature, gzipFeature;

        //initialize region
        firstRegionChunk = this._getChunk(region.start);
        lastRegionChunk = this._getChunk(region.end);

        for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
            key = region.chromosome+":"+i;
            if(this.cache[key]==null){
                this.cache[key] = {};
                this.cache[key].key = key;
            }
//        else{
//            // TODO
//            console.log(region.chromosome+region.start+region.end+'-'+featureType+'-'+dataType);
////            return;
//        }

//            this.store.add(key+"_"+dataType, value);
//            this.store.add(key, {datatype: value});


            if(this.cache[key][dataType]==null){
                this.cache[key][dataType] = [];
            }
        }

        //Check if is a single object
        if(featureDataList.constructor != Array){
            featureDataList = [featureDataList];
        }

        //loop over features and set on corresponding chunks
        for(var index = 0, len = featureDataList.length; index<len; index++) {
            feature = featureDataList[index];
            feature.featureType = featureType;
            firstChunk = this._getChunk(feature.start);
            lastChunk = this._getChunk(feature.end);

            if(this.gzip) {
                gzipFeature = RawDeflate.deflate(JSON.stringify(feature));
            }else{
                gzipFeature = feature;
            }

            for(var i=firstChunk; i<=lastChunk; i++) {
                if(i >= firstRegionChunk && i<= lastRegionChunk){//only if is inside the called region
                    key = region.chromosome+":"+i;
                    this.cache[key][dataType].push(gzipFeature);
                }
            }
        }
//        console.log(this.cache[region.chromosome+":"+firstRegionChunk][dataType].length)
    },


//used by BED, GFF, VCF
    putFeatures: function(featureDataList, dataType){
        var feature, key, firstChunk, lastChunk;

        //Check if is a single object
        if(featureDataList.constructor != Array){
            featureDataList = [featureDataList];
        }

        for(var index = 0, len = featureDataList.length; index<len; index++) {
            feature = featureDataList[index];
            firstChunk = this._getChunk(feature.start);
            lastChunk = this._getChunk(feature.end);
            for(var i=firstChunk; i<=lastChunk; i++) {
                key = feature.chromosome+":"+i;
                if(this.cache[key]==null){
                    this.cache[key] = [];
                    this.cache[key].key = key;
                }
                if(this.cache[key][dataType]==null){
                    this.cache[key][dataType] = [];
                }
                if(this.gzip) {
                    this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
                }else{
                    this.cache[key][dataType].push(feature);
                }

            }
        }
    },

    putChunk: function(key, item){
        this.cache[key] = item;
    },

    getChunk: function(key){
        return this.cache[key];
    },

    putCustom: function(f){
        f(this);
    },

    getCustom: function(f){
        f(this);
    },



    remove: function(region){
        var firstChunk = this._getChunk(region.start);
        var lastChunk = this._getChunk(region.end);
        for(var i=firstChunk; i<=lastChunk; i++){
            var key = region.chromosome+":"+i;
            this.cache[key] = null;
        }
    },

    clear: function(){
        this.size = 0;
        this.cache = {};
    }
}



//END



//THOSE METHODS ARE NOT USED



/*
 FeatureCache.prototype.getFeaturesByChunk = function(key, dataType){
 var features =  [];
 var feature, firstChunk, lastChunk;

 if(this.cache[key] != null && this.cache[key][dataType] != null) {
 for ( var i = 0, len = this.cache[key][dataType].length; i < len; i++) {
 if(this.gzip) {
 feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][i]));
 }else{
 feature = this.cache[key][dataType][i];
 }

 //check if any feature chunk has been already displayed
 var displayed = false;
 firstChunk = this._getChunk(feature.start);
 lastChunk = this._getChunk(feature.end);
 for(var f=firstChunk; f<=lastChunk; f++){
 var fkey = feature.chromosome+":"+f;
 if(this.chunksDisplayed[fkey+dataType]==true){
 displayed = true;
 break;
 }
 }

 if(!displayed){
 features.push(feature);
 returnNull = false;
 }
 }
 this.chunksDisplayed[key+dataType]=true;
 return features;
 }

 return null;
 };


 FeatureCache.prototype.getFeaturesByRegion = function(region, dataType){
 var firstRegionChunk, lastRegionChunk, firstChunk, lastChunk, features = [], feature, key, returnNull = true, displayed;
 firstRegionChunk = this._getChunk(region.start);
 lastRegionChunk = this._getChunk(region.end);
 for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
 key = region.chromosome+":"+i;
 //check if this key exists in cache (features from files)
 if(this.cache[key] != null && this.cache[key][dataType] != null){
 for ( var j = 0, len = this.cache[key][dataType].length; j < len; j++) {
 if(this.gzip) {
 try {
 feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][j]));
 } catch (e) {
 //feature es ""
 console.log(e)
 debugger

 }

 }else{
 feature = this.cache[key][dataType][j];
 }
 // we only get those features in the region AND check if chunk has been already displayed
 if(feature.end > region.start && feature.start < region.end){

 //		 check displayCheck argument
 if(region.displayedCheck != false){
 //		check if any feature chunk has been already displayed
 displayed = false;
 firstChunk = this._getChunk(feature.start);
 lastChunk = this._getChunk(feature.end);
 for(var f=firstChunk; f<=lastChunk; f++){
 var fkey = region.chromosome+":"+f;
 if(this.chunksDisplayed[fkey+dataType]==true){
 displayed = true;
 break;
 }
 }

 if(!displayed){
 features.push(feature);
 returnNull = false;
 }
 }else{
 features.push(feature);
 returnNull = false;
 }


 }
 }
 }
 //check displayCheck argument
 if(region.displayedCheck != false){
 this.chunksDisplayed[key+dataType]=true;//mark chunk as displayed
 }
 }
 if(returnNull){
 return null;
 }else{
 return features;
 }
 };
 */




/*

 FeatureCache.prototype.putChunk = function(featureDataList, chunkRegion, dataType){
 var feature, key, chunk;
 chunk = this._getChunk(chunkRegion.start);
 key = chunkRegion.chromosome+":"+chunk;

 if(this.cache[key]==null){
 this.cache[key] = [];
 }
 if(this.cache[key][dataType]==null){
 this.cache[key][dataType] = [];
 }

 if(featureDataList.constructor == Object){
 if(this.gzip) {
 this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(featureDataList)));
 }else{
 this.cache[key][dataType].push(featureDataList);
 }
 }else{
 for(var index = 0, len = featureDataList.length; index<len; index++) {
 feature = featureDataList[index];
 if(this.gzip) {
 this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
 }else{
 this.cache[key][dataType].push(feature);
 }
 }
 }

 };

 */


//NOT USED dev not tested
//FeatureCache.prototype.histogram = function(region, interval){
//
//var intervals = (region.end-region.start+1)/interval;
//var intervalList = [];
//
//for ( var i = 0; i < intervals; i++) {
//var featuresInterval = 0;
//
//var intervalStart = i*interval;//deberia empezar en 1...
//var intervalEnd = ((i+1)*interval)-1;
//
//var firstChunk = this._getChunk(intervalStart+region.start);
//var lastChunk = this._getChunk(intervalEnd+region.start);
//
//console.log(this.cache);
//for(var j=firstChunk; j<=lastChunk; j++){
//var key = region.chromosome+":"+j;
//console.log(key);
//console.log(this.cache[key]);
//for ( var k = 0, len = this.cache[key].length; k < len; k++) {
//if(this.gzip) {
//feature = JSON.parse(RawDeflate.inflate(this.cache[key][k]));
//}else{
//feature = this.cache[key][k];
//}
//if(feature.start > intervalStart && feature.start < intervalEnd);
//featuresInterval++;
//}
//
//}
//intervalList[i]=featuresInterval;
//
//if(this.maxFeaturesInterval<featuresInterval){
//this.maxFeaturesInterval = featuresInterval;
//}
//}
//
//for ( var inter in  intervalList) {
//intervalList[inter]=intervalList[inter]/this.maxFeaturesInterval;
//}
//};
