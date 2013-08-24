#!/usr/bin/env node

var art = require('ascii-art');
//require('ServerEvent');
var url = require('url');
var fs = require('fs');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function missingResource(uri) {
    console.log('Resource missing: '+uri);
}

var spawnScraper;

/*var app = require('http').createServer(function handler (req, res) {
    var uri = url.parse(req.url,true);
    res.writeHead(200);
    var type = uri.pathname.lastIndexOf('.') != -1 ? uri.pathname.substring(uri.pathname.lastIndexOf('.')+1) : '!';
    var path = ((type == '!' && uri.pathname != '/')?uri.pathname+'.html':uri.pathname);
    type = path.lastIndexOf('.') != -1 ? path.substring(path.lastIndexOf('.')+1) : '!';
    console.log(['path', path, type, '|'+uri.pathname+'|']);
    switch(path.toLowerCase()){
        case '/':
        case '/index.html':
            res.end('<html><head><script src="/socket.io/socket.io.js"></script><script src="/nexus.js"></script></head><body>'+
            '<div id="controls"></div>'+
            '<div id="dashboard"></div>'+
            '</body></html>');
            break;
        default :
            switch(type.toLowerCase()){
                case 'png':
                case 'gif':
                case 'jpg':
                case 'jpeg':
                    fs.readFile(__dirname+'/Images'+path, function (err, data) {
                        if (err) missingResource(__dirname+'/Images'+path);
                        res.end(data);
                    });
                    break;
                case 'js':
                    fs.readFile(__dirname+'/Scripts'+path, function (err, data) {
                        if (err) missingResource(__dirname+'/ClientLib'+path);
                        res.end(data);
                    });
                    break;
                case 'html':
                    fs.readFile(__dirname+'/Pages'+path, function (err, data) {
                        if (err) missingResource(__dirname+'/Pages'+path);
                        res.end(data);
                    });
                    break;
                case 'css':
                    fs.readFile(__dirname+'/Styles'+path, function (err, data) {
                        if (err) missingResource(__dirname+'/Styles'+path);
                        res.end(data+'._'+path.replace(/[^-a-z0-9A-Z]/gi,"")+'_load_test {display: none;}');
                    });
                    break;
                default:
                    //?????
                    fs.readFile(__dirname+'/404.html', function (err, data) {
                        if (err) throw(err);
                        res.end(data);
                    });   
            }
    }
});

var io = require('socket.io').listen(app);
var fs = require('fs')
app.listen(80);

io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    socket.on('spawn', function(data){ //from robots
        
    });
    socket.on('action', function(data){ //from clients
        
    });
});
 //*/

var cp = require('child_process');
var uuid = require('node-uuid');


function Scraper(options){
    this.options = options;
    this.fork = cp.fork('./excavate.js'); //there's always a local scrape process
    var ob = this;
    this.fork.on('message', function(message) {
        console.log('M', message.type)
        if(ob.handlers[message.type]) ob.handlers[message.type].forEach(function(handler){
            console.log('M-handle')
            handler(message.data, message.id);
        });
    });
    this.handlers = {};
    this.on('error', function(){
        console.log('error')
    })
};
Scraper.prototype.scrape = function(options, callback){
    if(this.options.cache && !options.webcache) options.webcache = this.options.cache;
    this.emitAsync('scrape', options, callback);
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
    this.fork.send({
        type : event,
        data : data,
        id : id
    });
}
Scraper.prototype.on = function(event, callback){
    console.log('added event', event);
    if(!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(callback);
}
Scraper.prototype.off = function(event, callback){
    if(this.handlers[event] && this.handlers[event].indexOf(callback) != -1){
        this.handlers[event].splice(this.handlers[event].indexOf(callback), 1);
    }
}
module.exports = Scraper;



