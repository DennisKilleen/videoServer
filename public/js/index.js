var temp=[];//variable needed for button injections 
var socket = io('http://'+location.hostname+':9001'); //set the socket port up to redirect to the server ip
window.addEventListener("load", Ready); 
var SelectedFile;
var Path = "http://localhost/";
var FReader;
var Name;
					

function Ready()
{ 
	if(window.File && window.FileReader)
	{ //These are the necessary HTML5 objects the we are going to use 
		document.getElementById('UploadButton').addEventListener('click', StartUpload);  
		document.getElementById('FileBox').addEventListener('change', FileChosen);
	}
	else
	{
		document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
	}
}

function FileChosen(evnt) 
{
	SelectedFile = evnt.target.files[0];
	document.getElementById('NameBox').value = SelectedFile.name;
}

function StartUpload()
{
	if(document.getElementById('FileBox').value != "")
	{
		FReader = new FileReader();
		Name = document.getElementById('NameBox').value;
		var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
		Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">50%</span>';
		Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
		document.getElementById('UploadArea').innerHTML = Content;
		FReader.onload = function(evnt){
			socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
		}
		socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
	}
	else
	{
		alert("Please Select A File");
	}
}


$(document).ready(function()
{
	$("#player").hide(); //hide the player until the user makes a choice
	$("#backToFiles").hide(); //hide the button to restart the selection process
	$("#folders").show(); //show the options the user has
});
$("#folders").click(function() 
{
	
	projekktor('#player_a', 
	{
		volume: 0.8,
		playerFlashMP4: 'http://www.yourdomain.com/StrobeMediaPlayback.swf',
		playerFlashMP3: 'http://www.yourdomain.com/StrobeMediaPlayback.swf'
	}); //load the player when the user pushes the button
});

function folders()
{
	socket.emit("GET_FOLDERS", {"source": "public/media/"}); //get the folders from the server
	$("#folders").hide(); //hide the button to get folders
}

socket.on("RETURN_GET_FOLDERS", function(data)
{
	temp = data.data; //get the data from the socket
	for(var i = 0; i < temp.length;i++) 
	{
		var $input = $('<button id="'+temp[i]+'" class="btn btn-primary btn-xl page-scroll" onclick="placeholderFolder(this.id);">'+temp[i]+'</button>'); //inject buttons to the page with the names of the folder
		$input.appendTo( $('#buttons')); //add the buttons to the page
	}
});

socket.on("RETURN_GET_FILES", function(data)
{
	
	temp=[];
	$('#buttons').empty(); //empty the buttons div
	temp = data.data; //get the data from the socket
	for(var i = 0; i < temp.length;i++)
	{
		var $input = $('<button id="'+temp[i]+'" class="btn btn-primary btn-xl page-scroll" onclick="placeholderFile(this.id);">'+temp[i].substring(22, temp[i].length)+'</button>');//inject buttons to the page with the names of the files
		$input.appendTo( $('#buttons')); //add the buttons to the page
	}
});

function placeholderFolder(id)
{
	for(var i = 0; i<temp.length;i++)
	{
		if(temp[i] == id)
		{
			socket.emit("GET_FILES", {"folder": id}); //get the files associated with the folder id
		}
	}
}

function placeholderFile(id)
{
	$("#buttons").hide(); //hide the buttons menu with the shows
	$("#backToFiles").show(); // show the button to restart the selection process
	$("#player").show(); //show the player
	document.getElementById("player_a").src = id.replace("/public", ""); //set the source for the player
}

function backToFiles()
{
	$("#buttons").show(); // show the files previously selected
	$("#player").hide(); //hide the player
	$("#backToFiles").hide(); //hide the back to files button
}

socket.on('MoreData', function (data){
	UpdateBar(data['Percent']);
	var Place = data['Place'] * 524288; //The Next Blocks Starting Position
	var NewFile; //The Variable that will hold the new Block of Data
	if(SelectedFile.webkitSlice) 
		NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	else
		NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	FReader.readAsBinaryString(NewFile);
});
function UpdateBar(percent){
	document.getElementById('ProgressBar').style.width = percent + '%';
	document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
	var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
	document.getElementById('MB').innerHTML = MBDone;
}

socket.on('Done', function (data){
	var Content = "Video Successfully Uploaded !!"
	Content += "<img id='Thumb' src='" + Path + data['Image'] + "' alt='" + Name + "'><br>";
	Content += "<button	type='button' name='Upload' value='' id='Restart' class='Button'>Upload Another</button>";
	document.getElementById('UploadArea').innerHTML = Content;
	document.getElementById('Restart').addEventListener('click', Refresh);
	document.getElementById('UploadBox').style.width = '270px';
	document.getElementById('UploadBox').style.height = '270px';
	document.getElementById('UploadBox').style.textAlign = 'center';
	document.getElementById('Restart').style.left = '20px';
});
function Refresh(){
	location.reload(true);
}

