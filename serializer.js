// run this when assets are changed

const FS = require("fs");
var app = FS.readFileSync("./app.js", "utf8");
var lines = app.split("\n");

var map =
{
	"const SOURCE_DRAW_JS = "	: "draw.js",
	"const SOURCE_DRAW = " 		: "draw.html",
	"const SOURCE_LIST = " 		: "list.html",
	"const SOURCE_BOOTSTRAP = "	: "bootstrap.css"
}

for (var i in lines)
{
	var l = lines[i];
	for (m in map)
	{
		if (l.indexOf(m) == 0)
		{
			lines[i] =  m + "'" + Buffer.from(FS.readFileSync("./asset/" + map[m], "utf8")).toString('base64') + "';";
			console.log("serialized " + map[m]);
		}
	}
}

var out = lines.join("\n");
FS.writeFileSync("app.js", out, "utf8");
