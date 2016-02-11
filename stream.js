var fs = require('fs'),
    files = fs.readdirSync('./audio'),
    clips = [],
    stream,
    currentfile,
    dhh = fs.createWriteStream('./dhh-interview.wav');
// create an array with filenames (time)
files.forEach(function (file) {
    clips.push(file.substring(0, 34));  
});
// Sort
clips.sort(function (a, b) {
    return a - b;
});
// recursive function
function main() {
    if (!clips.length) {
        dhh.end("Done");
        return;
    }
    currentfile = './audio/' + clips.shift() + '.wav';
    stream = fs.createReadStream(currentfile);
    stream.pipe(dhh, {end: false});
    stream.on("end", function() {
        console.log(currentfile + ' appended');
        main();        
    });
}
main();

