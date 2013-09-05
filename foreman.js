#!/usr/bin/env node

var art = require('ascii-art');
//require('ServerEvent');
var url = require('url');
var fs = require('fs');
var util = require('./util');
var clone = require('clone');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function missingResource(uri) {
    console.log('Resource missing: '+uri);
}

var spawnScraper;

var cp = require('child_process');
var uuid = require('node-uuid');
//computeCombinations

function Scraper(options){
    this.options = options;
    this.workers = [];
    this.handlers = {};
    this.on('error', function(error){
        console.log('error', error)
    })
};
Scraper.prototype.scrape = function(options, callback){
    var jobs = util.combinations(options.data, options.workerFields);
    //console.log('# of jobs'+jobs.length, jobs); process.exit();
    if(this.options.cache && !options.webcache) options.webcache = this.options.cache;
    var ob = this;
    var mergedData = [];
    //forAllEmissionsInPool
    jobs.forEachEmission(function(job, index, done){
        var optCopy = clone(options);
        optCopy.data = job;
        var worker = cp.fork('./excavate.js');
        console.log('Subprocess Created');
        ob.workers.push(worker);
        worker.on('message', function(message) {
            message.worker;
            if(ob.handlers[message.type]) ob.handlers[message.type].forEach(function(handler){
                handler(message.data, message.id);
            });
        });
        if(ob.options.proxy) optCopy.proxy = ob.options.proxy;
        ob.emitAsync('scrape', optCopy, function(data){
            var index = ob.workers.indexOf(worker)
            if(index) ob.workers.splice(index, 1);
            mergedData = mergedData.concat(data);
            worker.kill(); //reclaim
            console.log('Subprocess Completed');
            done();
        });
    }, function(){
        callback(mergedData);
    });
}
Scraper.prototype.emitAsync = function(event, options, callback){
    var id = uuid.v1();
    var ob = this;
    var cb = function(data, returnId){
        if(returnId == id){
            ob.off(event+'-return', cb);
            callback(data);
        }
    };
    this.emit(event, options, id);
    this.on(event+'-return', cb)
}
Scraper.prototype.emit = function(event, data, id){
    this.workers.forEach(function(worker){
        if(worker.connected) worker.send({
            type : event,
            data : data,
            id : id
        });
    });
}
Scraper.prototype.on = function(event, callback){
    if(!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(callback);
}
Scraper.prototype.off = function(event, callback){
    if(this.handlers[event] && this.handlers[event].indexOf(callback) != -1){
        this.handlers[event].splice(this.handlers[event].indexOf(callback), 1);
    }
}
module.exports = Scraper;
