const ks = require('kitchen-sync');
let Miner = function(){

}

Miner.prototype.work = function(cb){
    let callback = ks(cb);

    return callback.return;
}

Miner.prototype.getNextTask = function(){
    let callback = ks(cb);

    return callback.return;
}

Miner.prototype.deliverWorkAndGetNextTask = function(results, ){
    let callback = ks(cb);

    return callback.return;
}

Miner.prototype.pauseWhenDone = function(){
    let callback = ks(cb);

    return callback.return;
}

Miner.prototype.pauseWhenDone = function(){
    let callback = ks(cb);

    return callback.return;
}

Miner.default = Miner;

module.exports = Miner;
