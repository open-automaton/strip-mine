const ks = require('kitchen-sync');
const extend = require('extend-interface');
const expand = require('range-expansion');
let Foreman = function(){

}

Foreman.prototype.queue = function(cb){
    let callback = ks(cb);

    return callback.return;
}

Foreman.extend = function(cls, cns){
    var cons = cns || function(){ Miner.apply(this, arguments); return this };
    return extendClass(cls, cons, Miner);
};

Foreman.default = Foreman;

module.exports = Foreman;
