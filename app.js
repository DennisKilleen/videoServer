/*****************************************************
/
/	Author(s): Dennis Killeen.	
/
*****************************************************/
var express 		= require('express');
var path 			= require('path');
var favicon 		= require('serve-favicon');
var logger 			= require('morgan');
var cookieParser 	= require('cookie-parser');
var bodyParser		= require('body-parser');
var routes	 		= require('./routes/index');
var os 				= require('os');
var videoAPI		= require('./lib.js');
var multer 			= require('multer');
var util 			= require('util');
var fs 				= require('fs');
var port 			= 9000;
var app 			= express();
var server 			= require('http').createServer(app);
var exec 			= require('child_process').execFile;
var io				= require('socket.io')(9001);
var files 			= [];
var Files 			= {};

//set up the app handlers
app.use(favicon(__dirname + '/public/tv.ico'));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
server.listen(port);

//Commands
var CMD_GET_FOLDERS 						= "GET_FOLDERS";
var CMD_GET_FILES 							= "GET_FILES";
var CMD_RETURN_GET_IP 						= "RETURN_GET_IP";
var CMD_RETURN_GET_FOLDERS 					= "RETURN_GET_FOLDERS";
var CMD_RETURN_GET_FILES 					= "RETURN_GET_FILES";
var CMD_UPLOADED_FILES						= "UPLOADED_FILES";
var CMD_CREATE_FOLDER 						= "CREATE_FOLDER";
var CMD_RETURN_CREATE_FOLDER				= "RETURN_CREATE_FOLDER";
var CMD_DELETE_FOLDERS						= "DELETE_FOLDERS";
var CMD_RETURN_DELETE_FOLDER				= "RETURN_DELETE_FOLDER";
var CMD_GET_FOLDERS_FOR_RADIOBUTTONS 		= "GET_FOLDERS_FOR_RADIOBUTTONS";
var CMD_RETURN_GET_FOLDERS_FOR_RADIOBUTTONS = "RETURN_GET_FOLDERS_FOR_RADIOBUTTONS";
//set up the object used
var vid 					= new videoAPI(os.type());

//vid.startFFmpeg();


//the set up for the sockets
io.on('connect', function(socket)
{
	socket.on(CMD_GET_FOLDERS_FOR_RADIOBUTTONS, function(data) //listen for the socket
	{
		getFoldersForRadiobuttons(data, socket); //move the data and the socket handler to the function 
	});
	socket.on(CMD_DELETE_FOLDERS, function(data) //listen for the socket
	{
		deleteFolder(data, socket);
	});
	
	socket.on(CMD_GET_FOLDERS, function(data) //listen for the socket
	{
		getFolders(data, socket); //move the data and the socket handler to the function 
	});
	socket.on(CMD_GET_FILES, function(data) //listen for the socket
	{
		getFiles(data, socket); //move the data and the socket handler to the function 
	});
	socket.on(CMD_CREATE_FOLDER, function(data) //listen for the socket
	{
		createFolder(data, socket); //move the data and the socket handler to the function 
	});
	socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
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
	});
	
	socket.on('Upload', function (data)
	{
		var Name = data['Name'];
		Files[Name]['Downloaded'] += data['Data'].length;
		Files[Name]['Data'] += data['Data'];
		if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
		{
			fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen)
			{
				var inp = fs.createReadStream("Temp/" + Name);
				var out = fs.createWriteStream("public/media/"+ data.Path +"/" + Name);
				util.pump(inp, out, function()
				{
					fs.unlink("Temp/" + Name, function () 
					{ //This Deletes The Temporary File
						//exec("ffmpeg -i Video/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Video/" + Name  + ".jpg", function(err){
							socket.emit('Done', {'Image' : 'Video/' + Name + '.jpg'});
						//});
					});
				});
			});
		}
		else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
			fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
				Files[Name]['Data'] = ""; //Reset The Buffer
				var Place = Files[Name]['Downloaded'] / 524288;
				var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
				socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
			});
		}
		else
		{
			var Place = Files[Name]['Downloaded'] / 524288;
			var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
			socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
		}
	});
});

//function populates the radio buttons
function getFoldersForRadiobuttons(data, socket)
{
	var folderList = vid.getFolders(data.source); //send the data taken from the socket to the vid object method getFolders()
	socket.emit(CMD_RETURN_GET_FOLDERS_FOR_RADIOBUTTONS, {"data": folderList}); //emit the data back to the html page for displaying
}

//the getFolders function searches the public/media directory and returns the folders there
function getFolders(data, socket)
{
	var folderList = vid.getFolders(data.source); //send the data taken from the socket to the vid object method getFolders()
	socket.emit(CMD_RETURN_GET_FOLDERS, {"data": folderList}); //emit the data back to the html page for displaying
}

//the getFiles function searches the current directory and returns the files there
function getFiles(data, socket)
{
	var fileList = vid.getFiles('./public/media/'+data.folder); //get the files that are inside the selected folders
	if(fileList.length > 0)
	{
		for(var i = 0; i < fileList.length; i++)
		{
			if(fileList[i].slice(-3) != "mkv") //find the files that dont end with '.mkv'
			{
				files.push(fileList[i]); //add the files remaining to the files list
			}
		}
		socket.emit(CMD_RETURN_GET_FILES, {"data": files});
		files.splice(0,files.length);
	}
	else
	{
		socket.emit(CMD_RETURN_GET_FILES, {"data": "Empty directory"});
	}
}

//function to create the user specified folder
function createFolder(data, socket)
{
	fs.mkdir(data.source+"/"+data.name, function(e) //create the directory in the specified location
	{
        if (!e) //if the file has been created
			socket.emit(CMD_RETURN_CREATE_FOLDER, {"data": true}); //send a socket to the browser stating the creation is true
		else //if the file was not created
			socket.emit(CMD_RETURN_CREATE_FOLDER, {"data": e}); //send the error code to the browser
	});
}

function deleteFolder(data, socket)
{
	var deletedFolder = vid.deleteFolder(data.dir+data.folder);
	socket.emit(CMD_RETURN_DELETE_FOLDER, {"data": deletedFolder});
}

//set the server listening
server.listen(port, function () 
{
	console.log('\x1b[33m', 'Listening on port :'+ port ,'\x1b[0m'); //display on the prompt that the server is running
});

module.exports = app;
