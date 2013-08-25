#!/usr/bin/env node

if(!Array.prototype.forEachEmission) Array.prototype.forEachEmission = function(callback, complete){
    var a = {count : 0};
    var collection = this;
    var fn = function(collection, callback, complete){
        if(a.count >= collection.length){
            if(complete) complete();
        }else{
            callback(collection[a.count], a.count, function(){
                a.count++;
                fn(collection, callback, complete);
            });
        }
    };
    fn(collection, callback, complete);
};

if(Array.prototype.forAllEmissions) Array.prototype.forAllEmissions = function(callback, complete){
    var a = {count : 0};
    var collection = this;
    var begin = function(){
        a.count++;
    };
    var finish = function(){
        a.count--;
        if(a.count == 0 && complete) complete();
    };
    object.forEach(collection, function(value, key){
        begin();
        callback(value, key, function(){
           finish(); 
        });
    });
};

var ob_id = function(ob){
    var id = '';
    Object.keys(ob).forEach(function(key){
        id += ob[key]+'';
    });
    return id;
}

var addReturnUnique = function(ob, list){
    var id = ob_id(ob);
    if(list.indexOf(id) !== -1) return false;
    list.push(id);
    return true;
}

module.exports = {
    combinations : function(data, omit){
        var combinations = {};
        var results = [];
        var noArrays = true;
        var ids = [];
        Object.keys(data).forEach(function(key){
            if(omit && omit.indexOf(key) !== -1) return;
            var item = data[key];
            if(typeof item == 'object'){
                noArrays = false;
                //either an id (a range)
                try{
                    if(item.length != 2) throw('array not 2 long, skip to iterator');
                    var lower = parseInt(item[0]);
                    var upper = parseInt(item[1]);
                    for(var lcv=lower; lcv < upper; lcv++){
                        (function(){
                            var copy = JSON.parse(JSON.stringify(data));
                            copy[key] = lcv;
                            var combinations = module.exports.combinations(copy, omit);
                            combinations.forEach(function(item){
                                if(addReturnUnique(item, ids)) results.push(item);
                            });
                        })();
                    }
                //or a fixed set
                }catch(ex){
                    item.forEach(function(value){
                        var copy = JSON.parse(JSON.stringify(data));
                        copy[key] = value;
                        var combinations = module.exports.combinations(copy, omit);
                        combinations.forEach(function(item){
                            if(addReturnUnique(item, ids)) results.push(item);
                        });
                    });
                }
            }
        });
        if(noArrays) results.push(data);
        return results;
    }
};