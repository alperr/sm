// run this when assets are changed

const FS = require("fs");
var wk = FS.readFileSync("./wk.js", "utf8");
var lines = wk.split("\n");

var map =
{
	"const SOURCE_LIST = "		: "list.html",
	"const SOURCE_DRAW = " 		: "draw.html",
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
FS.writeFileSync("sm.js", out, "utf8");
