var path 	= require('path');
var fs 		= require('fs');
var exec 	= require('child_process').execFile;
var ffmpeg 	= require('fluent-ffmpeg');
var util 	= require('util');
var Files = {};

//videoApi constructor
function videoAPI(osParam)
{
	this.os = osParam; //set the os parameter 
}

//gets a list of folders
videoAPI.prototype.getFolders = function(srcpath) 
{
  return fs.readdirSync(srcpath).filter(function(file) 
  {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

//get a list of files
videoAPI.prototype.getFiles = function(dir, files_)
{
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files)
	{
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory())
		{
            getFiles(name, files_);
        } 
		else 
		{
            files_.push(name);
        }
    }
    return files_;
}

videoAPI.prototype.startFFmpeg = function()
{
	switch(this.os)
	{
		case 'Linux':
			console.log("in linux");
			break;
		case 'Windows_NT':
			console.log("in Windows");
			exec('./ffmpeg/Windows/bin/ffmpeg.exe');
			var proc = new ffmpeg({ source: './public/media/Movies/H264_mp3(mkvmerge).mkv', nolog: true });

			//Set the path to where FFmpeg is installed
			proc.setFfmpegPath("./ffmpeg/Windows/bin/ffmpeg.exe");

			proc.withSize('50%').withFps(24).toFormat('mp4').on('end', function() 
			{
				console.log('file has been converted successfully');
			}).on('error', function(err) 
			{
				console.log('an error happened: ' + err.message);
			}).saveToFile('./public/media/Movies/.mp4');
			break;
		case 'OSX':
			console.log("in OSX");
			break;
	}
}

videoAPI.prototype.deleteFolder = function(folderPath) 
{
	
  if( fs.existsSync(folderPath) ) 
  {
	fs.readdirSync(folderPath).forEach(function(file,index)
	{
	  var curPath = folderPath + "/" + file;
	  if(fs.lstatSync(curPath).isDirectory()) 
	  { // recurse
		deleteFolderRecursive(curPath);
	  } 
	  else 
	  { // delete file
		fs.unlinkSync(curPath);
	  }
	});
	fs.rmdirSync(folderPath);
	return folderPath+" deleted.";
  }
  else{
	return "Something went wrong check your folder structure";
  }
}

videoAPI.prototype.deleteFiles = function()
{
	var files = fs.readdirSync("./Temp");
	for (var i = 0; i < files.length; i++) 
	{
	  var filePath = "./Temp" + '/' + files[i];
	  if (fs.statSync(filePath).isFile())
		fs.unlinkSync(filePath);
	}
}

videoAPI.prototype.startUpload = function(data, socket)
{
	var Name = data['Name'];
	Files[Name] = {  //Create a new Entry in The Files Variable
		FileSize : data['Size'],
		Data	 : "",
		Downloaded : 0
	}
	var Place = 0;
	try{
		var Stat = fs.statSync('Temp/' +  Name);
		if(Stat.isFile())
		{
			Files[Name]['Downloaded'] = Stat.size;
			Place = Stat.size / 524288;
		}
	}
	catch(er){} //It's a New File
	fs.open("Temp/" + Name, 'a', 0755, function(err, fd){
		if(err)
		{
			console.log(err);
		}
		else
		{
			Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
			socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
		}
	});
}

videoAPI.prototype.upload = function(data, socket)
{
	var Name = data['Name'];
	Files[Name]['Downloaded'] += data['Data'].length;
	Files[Name]['Data'] += data['Data'];
	if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
	{
		fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen)
		{
			var inp = fs.createReadStream("Temp/" + Name);
			var out = fs.createWriteStream("public/media/"+ data.Path +"/" + data.fullName);
			util.pump(inp, out, function()
			{
				fs.unlink("Temp/" + Name, function () 
				{ 
					var name = (data.fullName).substring(0, (data.fullName).length -4);
					var proc = new ffmpeg({ source: "public/media/"+data.Path+"/"+data.fullName, nolog: true });
					proc.setFfmpegPath("./ffmpeg/Windows/bin/ffmpeg.exe");
					proc.setFfprobePath("./ffmpeg/Windows/bin/ffprobe.exe");
					if((data.fullName).substring((data.fullName).length -4, (data.fullName).length) == ".mp4"
					|| (data.fullName).substring((data.fullName).length -4, (data.fullName).length) == ".m4a"
					|| (data.fullName).substring((data.fullName).length -4, (data.fullName).length) == ".3gp"
					|| (data.fullName).substring((data.fullName).length -4, (data.fullName).length) == ".3g2"
					|| (data.fullName).substring((data.fullName).length -4, (data.fullName).length) == ".mj2"
					|| (data.fullName).substring((data.fullName).length -4, (data.fullName).length) == ".mov")
					{
						proc.takeScreenshots({
							count: 1,
							timestamps: ['50%'],
							filename: name+'.jpg',
							size: '640x480'
						}, "./public/images");
					}
					setTimeout(function()
					{ 
						socket.emit('Done', {'Image' : './images/'+name+'.jpg', "Name": data.fullName}); 
					}, 2000);
					
					return "done";
				});
			});
		});
		/**
		proc.setFfmpegPath("./ffmpeg/Windows/bin/ffmpeg.exe");
					proc.withSize('50%').withFps(24).toFormat('avi').on('end', function() 
					{
						console.log('file has been converted successfully');
					}).on('error', function(err) 
					{
						console.log('an error happened: ' + err.message);
					}).saveToFile('./public/media/Tv Shows/JellyJelly.avi');
							
		**/
	}
	else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
		fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
			Files[Name]['Data'] = ""; //Reset The Buffer
			var Place = Files[Name]['Downloaded'] / 524288;
			var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
			socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
			return "uploading";
		});
	}
	else
	{
		var Place = Files[Name]['Downloaded'] / 524288;
		var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
		socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
		return "uploading";
	}
}

videoAPI.prototype.transcode = function(data, socket)
{
	var proc = new ffmpeg({ source: './public/media/'+data.Path+"/"+data.fullName, nolog: true });
	//Set the path to where FFmpeg is installed
	proc.setFfmpegPath("./ffmpeg/Windows/bin/ffmpeg.exe");

	proc.withSize('50%').withFps(24).toFormat('mp4').on('end', function() 
	{
		socket.emit("TRANSCODE", {"name": data.fullName, "path": './public/media/'+data.Path+'/'});
		fs.unlinkSync('./public/media/'+data.Path+'/'+data.fullName);
	}).on('error', function(err) 
	{
		console.log('an error happened: ' + err.message);
	}).saveToFile('./public/media/'+data.Path+'/'+((data.fullName).substring(0, (data.fullName).length -4))+'.mp4');
}
////Format mov,mp4,m4a,3gp,3g2,mj2
module.exports = videoAPI;