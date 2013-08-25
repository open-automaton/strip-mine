#!/usr/bin/env node

module.exports = {
    mine : function(options){
        var Miner = module.exports.Miner || (module.exports.Miner = require('./miner'));
        var miner = new Miner(options);
        return miner;
    },
    foreman : function(options){
        var Foreman = module.exports.Foreman || (module.exports.Foreman = require('./foreman'));
        var foreman = new Foreman({});
        foreman.on('log', function(item){
            if(options.log) options.log(item);
        });
        return foreman;
    },
    inspect : function(options){
        
    },
    waitForWork : function(){
        var Miner = module.exports.Miner || (module.exports.Miner = require('./miner'));
        
        process.on('uncaughtException', function(ex){
            console.log('!!', ex);
            process.send({
                type : 'error',
                stack : ex.stack
            });
        })

        process.on('message', function(message) {
            switch(message.type){
                case 'scrape' : 
                    var options = message.data || {};
                    if(options.cache) Miner.webcache = options.cache; //kind of a dumb way to do this
                    var miner = new Miner(options);
                    miner.start(function(data){
                        process.send({
                            type : 'scrape-return',
                            data : data,
                            id : message.id
                        });
                    });
                    break;
                default : throw('unknown message type:'+message.type);
            }
        });
    }
};