import os

# turns the version into a string
def versionStr(major, minor):
	return str(major) + "." + str(minor);

# target files
html_target = "index.html";
js_target = "drawing.js";

# set version number
major_version = 1;
version = 92;

# calculate strings
last_version = version - 1;
curr = versionStr(major_version, version);
prev = versionStr(major_version, last_version);
print("Next Version: " + curr);
print("Prev Version: " + prev);

# open html file and replace strings
file = open(html_target, "rt");
html = file.read();
html = html.replace(prev, curr);
file.close();
file = open(html_target, "wt");
file.write(html);
file.close();

# open javascript file and replace strings
file = open(js_target, "rt");
js = file.read();
js = js.replace("Version " + prev, "Version " + curr);
file.close();
file = open(js_target, "wt");
file.write(js);
file.close();

# done
print("Finished");