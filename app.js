#!/usr/bin/env node

const H = require('nano-http');
const FS = require('fs');
const FG_RED = "\x1b[31m";
const RESET = "\x1b[0m";

const SOURCE_DRAW = 'PGh0bWw+Cgk8aGVhZD4KCQk8bWV0YSBjaGFyc2V0PSJ1dGYtOCI+CgkJPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCI+CgkJPHRpdGxlPndrPC90aXRsZT4KCTwvaGVhZD4KCTxib2R5PgoJCTx3ZWItYXBwPjwvd2ViLWFwcD4KCTwvYm9keT4KPC9odG1sPg==';
const SOURCE_LIST = 'Y2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudA0Kew0KCWNvbnN0cnVjdG9yKCl7IHN1cGVyKCk7IH0NCgljb25uZWN0ZWRDYWxsYmFjaygpDQoJew0KCQkNCgl9DQp9';
const SOURCE_BOOTSTRAP = '';

var commands =
{
	"init"  : init,
	"i"  : init
}

var args = process.argv.slice(2);
var command = args[0];
if (typeof command == "undefined")
	start();
else if (typeof commands[command] == 'undefined')
	print_small_help(command);
else
	commands[command](args);

function print_small_help(c)
{
	if (typeof c != 'undefined')
		error("invalid command: " + c);

	version();
	log("usage:");
	log("	sm       | starts sm");
	log("	sm init  | initializes folder structure");
}

function init()
{
	if (is_project_valid("./"))
	{
		error("current folder is already initialized");
		return;
	}

	log("initializing a new sm project");
	
	// b64_to_file(BASE_PATH_PUBLIC + "index.html", SOURCE_INDEX);
}

function write_list(l)
{
	FS.writeFileSync("./data.json", JSON.stringify(l), "utf8");
}

function read_list()
{
	return JSON.parse(FS.readFileSync("data.json", "utf8"));
}

function is_valid(obj)
{
	var fields = ["elements", "appState", "name"];
	for(var i=0;i<fields.length;i++)
		if (typeof[obj[fields[i]]] == "undefined")
			return false;

	return valid;
}

function onlist(q, res)
{
	var list = read_list();
	H.end(res, 200, JSON.stringify(list));
}

function oncreate(q, res)
{
	q = H.parse_fields(q, res, {}, {})
	if (!q)
		return;

	var list = read_list();
	var id = random_str(16);
	list[id] = "New sketch";
	write_list(list);
	H.end(res, 200, "");
}

function onupdate(req, res)
{
	var mandatory = { "id": "string" }
	var optional = 
	{
		"name": "string",
		"data": "string",
		"raster": "string",
		"thumb": "string"
	}
	q = H.parse_fields(q, res, mandatory, optional)
	if (!q)
		return;

	if (typeof q.name != "undefined")
	{
		var list = read_list();
		list[q.id] = q.name;
		write_list(list);
	}

	if (typeof q.raster != "undefined")
		FS.writeFileSync("./raster/"+q.id+".png", q.raster);

	if (typeof q.thumb != "undefined")
		FS.writeFileSync("./thumb/"+q.id+".jpeg", q.thumb);

	if (typeof q.data != "undefined")
		FS.writeFileSync("./data/"+q.id+".json", q.data, "utf8");
	
	H.end(res, 200, "");
}

function ondelete(q, res)
{

}

function start()
{
	H.enable_cors();
	H.get("/api/list", onlist);
	H.get("/api/create", oncreate);
	H.post("/api/update", onupdate);
	H.post("/api/delete", ondelete);
	H.start(4040);
	log("listening localhost:" + 4040);
}

function error(m){ console.log(FG_RED, m, RESET); }
function log(m){ console.log(RESET, m, RESET); }

function create_folder_if_not_exits(path)
{
	if (!FS.existsSync(path)){FS.mkdirSync(path);}
}

function delete_folder_recursive(path)
{
	if (FS.existsSync(path))
	{
		FS.readdirSync(path).forEach(function(file, index)
		{
			var curPath = path + "/" + file;
			if (FS.lstatSync(curPath).isDirectory())
				delete_folder_recursive(curPath);
			else
				FS.unlinkSync(curPath);
		});
		FS.rmdirSync(path);
	}
}

function to_ascii(source)
{
	return Buffer.from(source, 'base64').toString('ascii');
}

function b64_to_file(path, source)
{
	FS.writeFileSync(path, to_ascii(source), "utf8");
}

function render_index_html(development_mode)
{
	var CHEERIO = require('cheerio');
	var index = FS.readFileSync(BASE_PATH_PUBLIC + "index.html", "utf8");
	var $ = CHEERIO.load(index);
	$("head").append('<link rel="stylesheet" href="./dev.css">');
	$("head").append('<script src="./dev.js"></script>');
	var src = to_ascii(SOURCE_START_SCRIPT);
	if (development_mode)
	{
		var reloader = to_ascii(SOURCE_HOT_RELOAD);
		src = src.replace("//HOT_RELOAD_CODE//", reloader);
	}
	else
	{
		src = src.replace("//HOT_RELOAD_CODE//", "");
	}

	$("html").append(src);
	var h = $.html();
	h = h.replace("{{WS_PORT}}" , g_ws_port);
	return h;
}


function random_str(l)
{
	function r(){ return Math.floor(Math.random() * 16); }
	var s = ""
	for (var i=0;i<l;i++)
	{
		s += r().toString(16);
	}

	return s;
}
