var ffmpeg = require('ffmpeg-static');
var FFmpeg = require('plain-ffmpeg');
console.log(ffmpeg.path);


var ffmpeg = new FFmpeg({
    global: {'-y': null},
    input: {
        '-i ': "audio/db73fa4560a06c388b8817a4037af276_00.wav"
    },
    output: 'audio/db73fa4560a06c388b8817a4037af276_00.m4a'
});
ffmpeg.start();
ffmpeg.on('progress', function(progress) {
	console.log(progress);
})


