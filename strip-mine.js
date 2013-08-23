#!/usr/bin/env node

module.exports = {
    mine : function(options){
        var Miner = require('./miner');
        var miner = new Miner(options);
        return miner;
    },
    forman : function(options){
        var Foreman = require('./foreman');
        var foreman = new Foreman(options);
        foreman.handle = function(){ //local
        
        };
        foreman.delegate = function(){ //remote
        
        };
        return foreman;
    },
    inspect : function(options){
        
    }
};