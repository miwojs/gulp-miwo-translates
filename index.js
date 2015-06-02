var through = require('through');
var path = require('path');
var gutil = require('gulp-util');

// consts
const PLUGIN_NAME = 'gulp-miwo-translates';

// define main
function gulpMiwoTranslates(opt) {
	if (!opt) opt = {};

	var langFiles = {};
	var langData = {};

	function bufferContents(file) {
		if (file.isNull()) return; // ignore
		if (file.isStream()) return this.emit('error', new gutil.PluginError(PLUGIN_NAME,  'Streaming not supported'));

		var fileName = path.basename(file.path, '.json');
		var section = path.dirname(file.path);
		section = section.replace(path.dirname(section)+'/', '');
		section = section.split(path.sep).slice(-1)[0];

		if (!langFiles[fileName]) {
			langFiles[fileName] = file;
		}

		if (!langData[fileName]) {
			langData[fileName] = {};
		}

		langData[fileName][section] = file.contents.toString();
	}

	function endStream() {
		for(var lang in langData) {
			// prepare content
			var data = langData[lang];
			var content = '';
			for(var section in data) {
				content += "miwo.translator.setTranslates('"+lang+"', '"+section+"', "+data[section]+");\n\n";
			}

			// store data to file
			var file = langFiles[lang];
			file.contents = new Buffer(content);

			// change file path
			var dirname = path.dirname(path.dirname(file.path));
			var filename = path.basename(file.path, '.json');
			file.path = dirname+'/'+filename+'.js';
			this.emit('data', file);
		}

		this.emit('end');
	}

	return through(bufferContents, endStream);
};

// exporting the plugin main function
module.exports = gulpMiwoTranslates;