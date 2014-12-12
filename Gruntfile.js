var sh = require('shelljs');
var path = require('path');

module.exports = function(grunt){
  grunt.registerTask('default', function(){
    sh.exec(path.join(__dirname,'node_modules/.bin/bower')+' install');
    sh.mkdir('-p',path.join(__dirname,'public/js/vendor'));
    sh.cp(path.join(__dirname,'bower_components/bacon/dist/Bacon.js'), path.join(__dirname,'public/js/vendor/Bacon.js'));
    sh.cp(path.join(__dirname,'bower_components/d3/d3.js'), path.join(__dirname,'public/js/vendor/d3.js'));
    sh.cp(path.join(__dirname,'bower_components/jquery/dist/jquery.js'), path.join(__dirname,'public/js/vendor/jquery.js'));
    sh.cp(path.join(__dirname,'bower_components/lodash/dist/lodash.js'), path.join(__dirname,'public/js/vendor/lodash.js'));
    sh.cp(path.join(__dirname,'bower_components/underscore/underscore.js'), path.join(__dirname,'public/js/vendor/underscore.js'));
    sh.cp(path.join(__dirname,'bower_components/backbone/backbone.js'), path.join(__dirname,'public/js/vendor/backbone.js'));
  });
};
