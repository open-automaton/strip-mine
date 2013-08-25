#!/usr/bin/env node

var request = require('request'); //url fetch lib
var fs = require('fs');

var libs = {};

function DOM(html, callback){
    switch(DOM.engine){
        case 'jsdom':
            if(!libs.jsdom){
                libs.jsdom = require("jsdom");
            }
            jsdom.env({
                html:html,
                done: function(errors, window){
                    jsdom.jQueryify(window, "http://code.jquery.com/jquery.js", function(){
                        if(callback) callback(window.$);
                    });
                }
            });
            break;
        case 'cheerio':
            if(!libs.cheerio){
                libs.cheerio = require('cheerio');
                libs.cheerio.prototype.contents = function(){
                    var nodes = [];
                    [].forEach.call(this, function(node){
                        node.children.forEach(function(childNode){
                            childNode.innerHTML = childNode.data; //for compatible code
                            nodes.push(childNode);
                        });
                    });
                    return nodes;
                }
                libs.cheerio.prototype.forEach = function(callback){
                    this.each(function(index, item){ //stop the insanity!!
                        callback(item, index);
                    });
                }
            }
            $ = libs.cheerio.load(html);
            if(callback) callback($);
            break;
        default : throw(new Error('unknown mode'));
    }
    //todo: index
}
DOM.engine = 'cheerio';
DOM.next = function(node){
    if(!node) return;
    if(node.nextSibling) return node.nextSibling;
    if(node[0]) return DOM.next(node[0]);
    return node.next;
};
DOM.xpathText = function(selector, value){
    if(!libs.libxmljs) libs.libxmljs = require("libxmljs");
    var xmlDoc = libs.libxmljs.parseHtmlString(value);
    var result = xmlDoc.find(selector);
    var results = [];
    if(type(result) != 'array') result = [result];
    result.forEach(function(node){
        if(node) results.push(node.toString());
    })
    return results;
};
DOM.regexText = function(selector, value){
    var filter = new RegExp(selector, 'g');
    var selection=[];
    var a;
    while(a=regexp.exec(filter, value)){
        if(a[1]) selection.push(a[1]);
        else selection.push(a[0]);
    }
    return selection;
};
DOM.previous = function(node){
    if(!node) return;
    if(node.nextSibling) return node.previousSibling;
    if(node[0]) return DOM.next(node[0]);
    return node.prev;
};
DOM.value = function(node){
    if(!node) return '';
    if(node.val) return node.val();
    if(node.data) return node.data;
    if(node.value) return node.value;
    //if(node.children && node.children[0] && node.children[0].type=='text' && node.children[0].data.trim()) return node.children[0].data;
    return node.nodeValue || '';
};
DOM.html = function(node, $){
    if(!node) return '';
    if(node.innerHTML) return node.innerHTML;
    if(node.html) return node.html();
    if(node.data) return node.data;
    if($) return $(node).html();
};
DOM.attr = function(node, attr, $){
    if(!node) return '';
    if(node.attribs) return node.attribs[attr];
    if(node.attr) return node.attr(attr);
    if(node.getAttribute) return node.getAttribute(attr);
    if($) return $(node).html();
};
DOM.hash = function(value){
    if(!libs.crypto) libs.crypto = require('crypto');
    return libs.crypto.createHash('md5').update(value).digest("hex");
};

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

var lastFetch = Date.now();
var fetchDelayInMs = 0;
var pageIndex = {};

var log = function(type, message){
    //console.log('LOG:', message);
}

function getPage(url, callback){
    var id = DOM.hash(JSON.stringify(url));
    if(pageIndex[id]){
        callback(null, pageIndex[id]);
    }else{
        function save(data){
            pageIndex[id] = data;
            if(Miner.webcache){
                fs.writeFile(Miner.webcache+id+'.html', data, function(err) {
                    if(err) console.log('ERROR', err);
                    callback(null, pageIndex[id]);
                });
            }
        }
        function fetch(){
            log('event', '[WEB FETCHED] '+(url.split('?')[0]));
            var now = Date.now();
            //setTimeout(function(){
                request.get( url ,function(error, response, body){
                    if(!error) save(body);
                    callback(error, body);
                });
            //}, Math.max(now - (lastFetch+fetchDelayInMs), 0));
            lastFetch = now;
        }
        if(Miner.webcache){
            fs.readFile(Miner.webcache+id+'.html', function(err, data) {
                if(err) fetch();
                else{
                    log('event', '[CACHE FETCHED] '+(url.split('?')[0]), data);
                    pageIndex[id] = data;
                    callback(null, pageIndex[id]);
                }
            });
        }else{
            fetch();
        }
    }
}

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

function computeCombinations(data){
    var combinations = {};
    var results = [];
    var noArrays = true;
    Object.keys(data).forEach(function(key){
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
                        var combinations = computeCombinations(copy);
                        combinations.forEach(function(item){
                            results.push(item);
                        });
                    })();
                }
            //or a fixed set
            }catch(ex){
                item.forEach(function(value){
                    var copy = JSON.parse(JSON.stringify(data));
                    copy[key] = value;
                    var combinations = computeCombinations(copy);
                    combinations.forEach(function(item){
                        results.push(item);
                    });
                });
            }
        }
    });
    if(noArrays) results.push(data);
    return results;
}


function Miner(options){
    this.options = options;
    this.work = [];
    if(options.definition){
        var definition;
        if(typeof options.definition == 'string') definition = require(Miner.directory + options.definition);
        else definition = options.definition;
        options.mine = definition.mine;
        var init = options.initialize;
        options.initialize = function(){
            if(definition.setup) definition.setup.apply(this, arguments);
            if(init) init.apply(this, arguments);
        }
        this.definition = definition;
    }else{
        
    }
    if(options.complete){
        this.start(options.complete);
    }
}

Miner.prototype.blueprint = function(data){
    return computeCombinations(data);
}

Miner.prototype.accept = function(job){
    this.work.push(job);
}

Miner.prototype.dole = function(job){
    var ob = this;
    this.blueprint(job).forEach(function(activity){
        ob.accept(activity);
    })
}

Miner.webcache = false;

Miner.directory = process.cwd()+'/' || './';

Miner.prototype.start = function(callback){
    var ob = this;
    this.options.initialize(this, function(){
        var results = [];
        ob.work.forEachEmission(function(job, index, done){
            var vein = new Lode(ob.options, job);
            console.log('JOB', job);
            vein.mine(job, ob, function(ore){
                ore.forEach(function(nugget){
                    results.push(nugget);
                });
                done();
            })
        }, function(){
            if(ob.definition.sift) results = ob.definition.sift(results, DOM.hash);
            callback(results);
        }); 
    });
    
}

Miner.prototype.queue = function(options){
    
}

Miner.prototype.stop = function(options, callback){
    
}



function Lode(progenitor, options){
    this.options = options;
    if(typeof progenitor == 'function'){
        this.parent = progenitor;
        this.work = this.parent.mine;
    }else{
        if(progenitor.mine) this.work = progenitor.mine;
    }
}

Lode.prototype.mine = function(job, miner, callback){
    var i = require('node-uuid').v1();
    var done = false;
    this.work(this, DOM, miner, job, function(results){
        if(!done){
            callback(results);
            done = true;
        }
    })
}
var url = require('url');

Lode.prototype.navigateTo = function(options, callback){
    try{
    if(!options) options = {};
    if(typeof options == 'string') options = {url : options};
    var uri = url.parse(options.url);
    if(options.get){
        uri.query = options.get;
    }
    options.url = url.format(uri);
    var ob = this;
    getPage(options.url, function(error, html){
        DOM(html, function(selector, document, window){
            var newState = new Lode(this);
            newState['$'] = selector;
            newState.document = document;
            newState.window = window;
            newState.html = html;
            ob.lastSelector = selector;
            callback(newState);
        });
    });
    }catch(ex){
        //console.log('ERROR', ex);
        throw(ex);
    }
};

Lode.prototype.nodes = function(selector, callback){
    var result = this.$(selector);
    if(callback) callback(result);
    return result;
}

Lode.prototype.html = function(selector, callback){
    var result = this.$(selector);
    if(callback) callback(result);
    return result;
}

Lode.prototype.text = function(selector, callback){
    var result = DOM.xpathText(selector);
    if(callback) callback(result);
    return result;
}

Lode.prototype.xml = function(selector, callback){
    var result = DOM.regexText(selector);
    if(callback) callback(result);
    return result;
}

module.exports = Miner;