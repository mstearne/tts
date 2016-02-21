'use strict';

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

    if(req.query.pass!="true") {

        var watson = require('watson-developer-cloud');
        var fs = require('fs');
        var util = require("util"), request = require("request"), cheerio = require("cheerio");
        var extractor = require("unfluff");
        var md5 = require('md5');
        var Promise = require('promise');
        var FFmpeg = require('plain-ffmpeg');
        require('buffer-concat');

        var params = [];
        var promiseCount = 0;
        var myPromises = [];

/// This object holds all of the data that the text to speech returns
        var returnData = [];
        var inputURL = req.query.id;
        var inputURLMD5 = md5(inputURL);

        if (!fs.existsSync("./public/audio/" + inputURLMD5)) {
            fs.mkdirSync("./public/audio/" + inputURLMD5);
        }


//	process.setMaxListeners(0);
//console.log(req.query);
        request(req.query.id, function (error, response, html) {

            if (!error && response.statusCode == 200) {

                var data = extractor(html);
                var pageTitle = data.title;
                var pageTitleNoSpaces = pageTitle.replace(/ /g, '_');
                pageTitleNoSpaces = pageTitleNoSpaces.replace(/'/g, '');
                pageTitleNoSpaces = pageTitleNoSpaces.replace(/\?/g, '');

                var pageBody = data.text;
                /// we need to make the story short because of the API
                pageBody = pageTitle + ". " + pageBody;

                var page = pageBody.match(/[\s\S]{1,4800}/g)

//		console.log(pageBody);
                console.log(page);
                console.log(page.length);
                console.log(pageTitleNoSpaces);
                console.log(pageBody.length + " characters.");
                if (pageBody.length > 10000) {
                    console.log("+++++ Hey this is a long article. It may take a minute to voicify.");
                }
                console.log(page.length + " parts in the article.");
                console.log("Title: " + data.title);

                var text_to_speech = watson.text_to_speech({
                    username: '7b2797f8-bdd5-49d9-be2b-e0e6a6088788',
                    password: '2zX9Bk0cBMsm',
                    version: 'v1'
                });


                for (var i = 0; i < page.length; i++) {

                    // en-US_AllisonVoice
                    params = {
                        text: page[i],
                        voice: 'en-US_AllisonVoice', // Optional voice
                        accept: 'audio/ogg; codecs=opus',
                        fileName: "public/audio/" + inputURLMD5 + "/" + inputURLMD5 + '_' + zeroFill(i, 2) + '.ogg'
                    };

                    promiseCount++;

                    var promise = new Promise(function (resolve, reject) {

                        console.log("Started promise " + promiseCount);
                        returnData[promiseCount] = params;
                        text_to_speech.synthesize(params, function (err, res) {

                            if (err) {
                                console.log("===================================================");
                                console.log(err);
                                console.log("===================================================");
                            }

                            returnData[promiseCount].res = res;
                            returnData[promiseCount].promiseItem = promiseCount;
                            resolve(returnData[promiseCount]);
                        });
                    });

                    promise.then(function (data) {

                        console.log("returnData and data in resolve");
                        console.log(data);

                        //We resolved a promise, decrement the counter
                        promiseCount--;

                        console.log('Got data! Promise fulfilled. ');

                        console.log("Promise resolved: " + promiseCount);

                        //	if all promises are returned then we should do the assembly of the files
                        if (promiseCount == 0) {
                            console.log("Got em promises!");

                            var allBinaryData = [];
                            var allBinaryDataSize = 0;

                            console.log("all return data");
                            console.log("all return data");
                            console.log("all return data");
                            console.log(returnData);
                            console.log("all return data");
                            console.log("all return data");
                            console.log("all return data");

                            console.log("returnData length");
                            console.log(returnData.length);

                            console.log("all return data sorted");
                            console.log("all return data sorted");
                            console.log("all return data sorted");


                            for (var k = 1; k < returnData.length; k++) {
                                if (returnData[k].res) {
                                    allBinaryDataSize += returnData[k].res.length;
                                    allBinaryData.push(returnData[k].res);
                                }
                            }

                            console.log("new allBinaryData");
                            console.log(allBinaryData);
                            console.log(allBinaryDataSize);

                            var allBinaryDataToWrite = Buffer.concat(allBinaryData, allBinaryDataSize);

                            console.log("allBinaryData");
                            console.log(allBinaryDataToWrite);


                            console.log("allBinaryData X");

                            var outputFileWAV = 'public/audio/' + inputURLMD5 + '/' + pageTitleNoSpaces + '.ogg';

                            var wstream = fs.createWriteStream(outputFileWAV);
                            var buffer = allBinaryDataToWrite;
                            wstream.write(buffer);
                            wstream.end();

                            console.log("The file was saved as " + './public/audio/' + inputURLMD5 + "/" + pageTitleNoSpaces + ".ogg");

                            var outputFile = 'public/audio/' + inputURLMD5 + '/' + pageTitleNoSpaces + '.m4a';

                            var options = {
                                global: {
                                    '-y': null,
                                },
                                input: {
                                    '-i': './public/audio/' + inputURLMD5 + "/" + pageTitleNoSpaces + ".ogg"

                                },
                                output: {
                                    '-b:a': '160k',
                                    '-filter:a': 'atempo=1.25',
                                    'outputFile': outputFile
                                }
                            }

                            console.log(options);
                            var ffmpeg = new FFmpeg(options);
                            ffmpeg.start();

//					response.send("http://readmystory.com/"+outputFile);
                            console.log("http://readmystory.com/" + outputFile);

                            res.render('p', {title: req.query.id});


                        }
                    }, function (error) {
                        console.log('Promise rejected.');
                        console.log(error.message);
                    });


                }

            }
        });
    }else{
        res.render('p', {title: req.query.id,audio:'/audio/9796ec337346ac604d5f9e3290159faa/Rachel_Maddow_just_made_a_convincing_case_for_why_Bernie_Sanders_could_be_president_[Video].m4a'});
    }

});



function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

function zeroFill( number, width )
{
    width -= number.toString().length;
    if ( width > 0 )
    {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // always return a string
}

function compare(a,b) {
    if (a.promiseItem < b.promiseItem)
        return -1;
    else if (a.promiseItem > b.promiseItem)
        return 1;
    else
        return 0;
}



module.exports = router;
