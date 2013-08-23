#!/usr/bin/env node

var Miner = request('./miner');

process.on('message', function(message) {
    switch(message.type){
        var options = message.data || {};
        case 'scrape' : 
            var miner = new Miner(options);
            miner.start(function(data){
                process.send({
                    type : 'scrape-return',
                    data : data
                });
            });
            break;
        default : throw('unknown message type:'+message.type);
    }
});