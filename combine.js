/*
   I placed all the audio files in ./files directory
*/
var fs = require('fs'),
    files = fs.readdirSync('./audio');
files.forEach(function (file) {
    var currentname = './audio/' + file, 
        date = parseDate(file),
        newname = './audio/' + date.split(';').join('') + '.wav';
    renameFile(currentname, newname); 
    console.log('Renamed ' + currentname + ' to ' + newname);    
}); 
/*
    This function renames a file
    @param: (String) currentname - current file name
    @param: (String) newname - new file name     
*/
function renameFile(currentname, newname) {
    fs.renameSync(currentname, newname);
}
/*
    Extracts date/time from file name string
    @param: (String) filename - file name 
*/
function parseDate(name) {
    var date = name.substring(11, 19);
    return date;
}
console.log('Done');