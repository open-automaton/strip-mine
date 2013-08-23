#!/usr/bin/env node

var commandLineInput = require('commander');
var art = require('ascii-art');
//todo: profile networks
commandLineInput.version(require('./package').version);
//commandLineInput.option('-s, --scrapes [type]', 'Show detailed information on a particular scrape');
//commandLineInput.option('-a, --alert [jobID] [location]', 'Send notification to a chat room or email upon completion');
//commandLineInput.option('-S, --search [where_clause]', 'Find queued jobs that match the specified criteria');
//commandLineInput.option('-h, --host [IP]', 'Specify the IP of the foreman [localhost]', 'localhost');
//commandLineInput.option('-p, --port [number]', 'Specify the port of the foreman [8080]', '8080');
//commandLineInput.option('-t, --tail [search]', 'Receive detailed log data');
//commandLineInput.option('-c, --cancel [scrapeID]', 'If set, detailed error information will be logged here.');
//commandLineInput.option('-d, --dashboard', 'Heads up status display');
//commandLineInput.option('-i, --interactive', 'Heads up status display');
//commandLineInput.parse(process.argv);