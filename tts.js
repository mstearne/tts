'use strict';

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
var returnData=[];
var inputURL=process.argv[2];
var inputURLMD5=md5(inputURL);

if (!fs.existsSync("./audio/"+inputURLMD5)){
    fs.mkdirSync("./audio/"+inputURLMD5);
}




//	process.setMaxListeners(0);

request(process.argv[2], function (error, response, html) {

		if (!error && response.statusCode == 200) {

		var data = extractor(html);
		var pageTitle = data.title;
		var pageTitleNoSpaces = pageTitle.replace(/ /g, '_');


		var pageBody = data.text;
		/// we need to make the story short because of the API
		pageBody=pageTitle+". "+pageBody;

		var page=pageBody.match(/[\s\S]{1,4800}/g)

//		console.log(pageBody);
		console.log(page);
		console.log(page.length);
		console.log(pageTitleNoSpaces);
		console.log(pageBody.length+" characters.");
		if(pageBody.length>10000){
			console.log("+++++ Hey this is a long article. It may take a minute to voicify.");
		}
		console.log(page.length+" parts in the article.");
		console.log("Title: "+data.title);

		var text_to_speech = watson.text_to_speech({
		username: '5bab27f4-3e1a-4531-aca1-46be6cb113e0',
		password: 'DT4ukgq3agb1',
		version: 'v1'
		});



		for(var i=0;i<page.length;i++){

			

			 params = {
			  text: page[i],
			  voice: 'en-US_MichaelVoice', // Optional voice
			  accept: 'audio/wav',
			  fileName: "audio/"+inputURLMD5+"/"+inputURLMD5+'_'+zeroFill(i,2)+'.wav'
			};

			promiseCount++;

			var promise = new Promise(function (resolve, reject) {

				  stream.setMaxListeners(stream.getMaxListeners() + 1)

					console.log("Started promise "+promiseCount);
						returnData[promiseCount]=params;
						text_to_speech.synthesize(params, function(err, res) {

							if(err){
								console.log("===================================================");
								console.log(err);
								console.log("===================================================");
							}

							returnData[promiseCount].res=res;
							returnData[promiseCount].promiseItem=promiseCount;
							// console.log("returnData in tts");
							// console.log(returnData);
							resolve(returnData[promiseCount]);
						});
			});

			promise.then(function(data) {

							 console.log("returnData and data in resolve");
							// console.log(returnData);
							 console.log(data);

			//We resolved a promise, decrement the counter
			promiseCount--;

			//console.log(data);
		    console.log('Got data! Promise fulfilled. ');

			console.log("Promise resolved: "+promiseCount);

				//	if all promises are returned then we should do the assembly of the files
				if(promiseCount==0){
					console.log("Got em promises!");

					var allBinaryData= [];
					var allBinaryDataSize=0;

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
//					returnData.sort(compare);
					console.log("all return data sorted");
					console.log("all return data sorted");
					console.log("all return data sorted");


					for(var k=1;k<returnData.length;k++){
						if(returnData[k].res){
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

 					var outputFileWAV='audio/'+inputURLMD5+'/'+pageTitleNoSpaces+'.wav';

					var wstream = fs.createWriteStream(outputFileWAV);
					var buffer = allBinaryDataToWrite;
					wstream.write(buffer);
					wstream.end();

				    console.log("The file was saved as "+'./audio/'+inputURLMD5+"/"+pageTitleNoSpaces+".wav");

					var outputFile='audio/'+inputURLMD5+'/'+pageTitleNoSpaces+'.m4a';

					var options = {
						global: {
							'-y': null,
						},
						input: {
							'-i': './audio/'+inputURLMD5+"/"+pageTitleNoSpaces+".wav"

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
					console.log("http://readmystory.com/"+outputFile);


				}
			}, function(error) {
			    console.log('Promise rejected.');
			    console.log(error.message);
			});


		}

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

