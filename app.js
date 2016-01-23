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
var users 			= require('./routes/users');
var os 		= require('os');
var videoAPI		= require('./lib.js');
var port 			= 8080;
var app 			= express();
var server 			= require('http').createServer(app);
var io				= require('socket.io')(9000);
var files 			= [];

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
app.use('/users', users);
server.listen(port);


//Commands
var CMD_GET_FOLDERS 		= "GET_FOLDERS";
var CMD_GET_FILES 			= "GET_FILES";
var CMD_RETURN_GET_IP 		= "RETURN_GET_IP";
var CMD_RETURN_GET_FOLDERS 	= "RETURN_GET_FOLDERS";
var CMD_RETURN_GET_FILES 	= "RETURN_GET_FILES";

//set up the object used
var vid 					= new videoAPI(os.type());

//vid.startFFmpeg();

//the set up for the sockets
io.on('connect', function(socket)
{
	socket.on(CMD_GET_FOLDERS, function(data) //listen for the socket
	{
		getFolders(data, socket); //move the data and the socket handler to the function 
	});
	socket.on(CMD_GET_FILES, function(data) //listen for the socket
	{
		getFiles(data, socket); //move the data and the socket handler to the function 
	});
});


//the getFolders function searches the public/media directory and returns the folders there
function getFolders(data, socket)
{
	var folderList = vid.getFolders(data.source); //send the data taken from the socket to the vid object method getFolders()
	socket.emit(CMD_RETURN_GET_FOLDERS, {"data": folderList}); //emit the data back to the html page for displaying
}


function getFiles(data, socket)
{
	var fileList = vid.getFiles('./public/media/'+data.folder); //get the files that are inside the selected folders
	for(var i = 0; i < fileList.length; i++)
	{
		if(fileList[i].slice(-3) != "mkv") //find the files that dont end with '.mkv'
		{
			files.push(fileList[i]); //add the files remaining to the files list
		}
	}
	socket.emit(CMD_RETURN_GET_FILES, {"data": files});
}

server.listen(port, function () //set the server listening
{
  console.log('Server listening at port %d', port); //display on the prompt that the server is running
});

module.exports = app;
