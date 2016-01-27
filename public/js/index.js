var temp				=[];//variable needed for button injections 
var socket 				= io('http://'+location.hostname+':9001'); //set the socket port up to redirect to the server ip
var SelectedFile;
var Path = "http://localhost/";
var FReader;
var Name;

//When the document has finished loading this function will be the first to run
$(document).ready(function()
{
	$("#player").hide(); //hide the player until the user makes a choice
	$("#backToFiles").hide(); //hide the button to restart the selection process
	$("#backToFolders").hide(); //hide the button to restart the selection process
	$("#folders").show(); //show the options the user has
	if(window.File && window.FileReader) //check if the browser is compatible
	{ 
		document.getElementById('UploadButton').addEventListener('click', StartUpload); //when the upload button is clicked start the function startUpload() 
		document.getElementById('FileBox').addEventListener('change', FileChosen); //when the file box has been used starts the fileChosen()
	}
	else //if the browser is not compatible
	{
		document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser"; //if the current browser needs to be updated
	}
	socket.emit("GET_FOLDERS_FOR_RADIOBUTTONS", {"source": "public/media/"});
	socket.on("RETURN_GET_FOLDERS_FOR_RADIOBUTTONS", function(data)
	{
		temp = data.data; //get the data from the socket
		for(var i = 0; i < temp.length;i++) 
		{
			if(temp[i].length == 0)
			{
				$('#UploadButton').before('<label for="folderSelector">Choose the folder upload to: </label></br>');
				$('#UploadButton').before('<input id="radioSelection" name="folderSelector" type="Radio" value="'+temp[i]+'">'+temp[i]+'</input>'); //inject buttons to the page with the names of the folder
			}
			else if(i == temp.length-1)
			{
				$('#UploadButton').before('<input id="radioSelection" name="folderSelector" type="Radio" value="'+temp[i]+'">'+temp[i]+'</input></br>');
			}
			else
			{
				$('#UploadButton').before('<input id="radioSelection" name="folderSelector" type="Radio" value="'+temp[i]+'">'+temp[i]+'</input>');
			}
		}	
	});
});	
$("input[name='folderSelector']").change(function()
{
    alert($(this).val());
});
/************************************************************************************
/
/ Web player div functions below
/
************************************************************************************/
//When the user searches for folders load the player now.
$("#folders").click(function() 
{
	projekktor('#player_a', 
	{
		volume: 0.8,
		playerFlashMP4: './js/swf/StrobeMediaPlayback/StrobeMediaPlayback.swf',
		playerFlashMP3: './js/swf/StrobeMediaPlayback/StrobeMediaPlayback.swf'
	}); //load the player when the user pushes the button with the above settings
});

//the button this function is called by is dual use it loads the player and searches the directory
function folders()
{
	socket.emit("GET_FOLDERS", {"source": "public/media/"}); //get the folders from the server
	$("#folders").hide(); //hide the button to get folders
}

//the button this function is called by is dual use it loads the player and searches the directory
function createFolder()
{
	$("#folders").hide(); //hide the button to get folders
	var $input = $('<label for="NameBox">Name For the file: </label><input type="text" id="folderName" style="color: #000000;"></br><button type="button" class="btn btn-primary btn-xl page-scroll" onclick="sendingCreateFolder()">Submit</button>'); //inject buttons to the page with the names of the folder
	$input.appendTo($('#buttons')); //add the buttons to the page
}
function sendingCreateFolder()
{
	socket.emit("CREATE_FOLDER", {"source": "public/media/", "name": document.getElementById('folderName').value}); //send the folder name and address to the server
	socket.on("RETURN_CREATE_FOLDER", function(data) //listen for the socket return
	{
		if(data.data == true) // if the folder was created
		{
			alert("Folder was created"); //alert the user
			Refresh(); //refresh the page
		}
		else //if the folder was not ccreated
		{
			if (e.code != 'EEXIST') //if the folder is already in the directory
			{
				alert("Folder already exists"); //alert the user
				Refresh(); //refresh the page
			}
			else if (e.code != 'EPERM') //if the os wont allow the server to create the folder
			{
				alert("Folder cannot be created due to permission issues"); //alert the user
				Refresh(); //refresh the folder
			}
			else //if there was an error elsewhere
			{
				alert("Folder cannot be created due to some unforeseen error"); //alert the user
				Refresh(); //refresh the page
			}
		}
	});
}
//the socket listener for the returning folder names
socket.on("RETURN_GET_FOLDERS", function(data)
{
	temp = data.data; //get the data from the socket
	for(var i = 0; i < temp.length;i++) 
	{
		var $input = $('<button id="'+temp[i]+'" class="btn btn-primary btn-xl page-scroll" onclick="placeholderFolder(this.id);">'+temp[i]+'</button>'); //inject buttons to the page with the names of the folder
		$input.appendTo($('#buttons')); //add the buttons to the page
	}	
});

//the function associated with the injected buttons passes the folder id so the folder can be searched
function placeholderFolder(id)
{
	socket.emit("GET_FILES", {"folder": id}); //get the files associated with the folder id
}

//the socket listener for the returning file names
socket.on("RETURN_GET_FILES", function(data)
{
	if(data.data == "Empty directory") //if the server returns empty directory e.g. theres nothing in the directory
	{
		$('#buttons').empty(); //empty the buttons div
		var $input = $('<p>The selected directory is empty</p>');//inject buttons to the page with the names of the files
		$input.appendTo( $('#buttons')); //add the buttons to the page
		$('#backToFolders').show();
	}
	else //if the server returns files
	{
		temp=[];
		$('#buttons').empty(); //empty the buttons div
		temp = data.data; //get the data from the socket
		var res;
		for(var i = 0; i < temp.length;i++)
		{
			res = temp[i].split("/");
			var $input = $('<button id="'+temp[i]+'" class="btn btn-primary btn-xl page-scroll" onclick="placeholderFile(this.id);">'+res[4]+'</button>');//inject buttons to the page with the names of the files
			$input.appendTo( $('#buttons')); //add the buttons to the page
		}
		$('#backToFolders').show();
	}
});


//the function associated with the injected buttons passes the file id so the file can be used as the src file for the player
function placeholderFile(id)
{
	$("#buttons").hide(); //hide the buttons menu with the shows
	$("#backToFiles").show(); // show the button to restart the selection process
	$("#player").show(); //show the player
	document.getElementById("player_a").src = id.replace("/public", ""); //set the source for the player
}

//function for the button press to bring back up a file list
function backToFiles()
{
	$('#backToFiles').hide(); //hide the back to files button because were on going back one level
	$("#player").hide(); //show the player
	$('#buttons').show(); //show the buttons menu again
}

//function to go back to the folders
function backToFolders()
{
	$('#backToFiles').hide(); //hide the back to files because in the folder menu we have known
	$('#backToFolders').hide();// hide the back to folders because were back at  the origin
	$("#player").hide(); //show the player
	$('#buttons').empty(); //empty the buttons div
	$('#buttons').show(); //show the buttons menu again
	socket.emit("GET_FOLDERS", {"source": "public/media/"}); //get the folders from the server
}

/************************************************************************************
/
/ Video uploader div functions below
/
************************************************************************************/
//get the reference to the file
function FileChosen(evnt) 
{
	SelectedFile = evnt.target.files[0]; //the selected file is the uploaded file
	document.getElementById('NameBox').value = SelectedFile.name; //the namebox name gets set to the files name
}


//File upload function
function StartUpload()
{
	if($("input[name=folderSelector]:checked").val() != "")
	{
		var path = $("input[name=folderSelector]:checked").val();
		var nameWithExtension; 
		if(document.getElementById('FileBox').value != "") //Check to see if the user has entered a file
		{
			FReader = new FileReader(); //create a new filereder object
			Name = document.getElementById('NameBox').value;
			nameWithExtension = Name+SelectedFile.name.substring(SelectedFile.name.length -4, SelectedFile.name.length);
			var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + nameWithExtension + "</span>"; //alert the user of the file being uploaded being renamed
			Content += '<center><div id="ProgressContainer" class="ProgressContainer"><div id="ProgressBar" class="ProgressBar"></div></div><span id="percent">50%</span></center>'; //Injects a new div to graphically show progress
			Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>"; //injects text to give a visual representation of the file upload progress
			document.getElementById('UploadArea').innerHTML = Content; //adds the injection to the content
			FReader.onload = function(evnt)
			{
				socket.emit('Upload', { 'Name' : Name, 'fullName': nameWithExtension, Data : evnt.target.result, 'Path':  path});
			}
			socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
		}
		else //if no file has been submitted and upload button pressed
		{
			alert("Please Select A File"); //alert the user to select a file
		}
	}
	else{
		alert("Please select a folder to upload too");
	}
}

//the data chunks function. this will fire everytime the data sent has reached the limit
socket.on('MoreData', function (data)
{
	UpdateBar(data['Percent']);
	var Place = data['Place'] * 524288; //The Next Blocks Starting Position
	var NewFile; //The Variable that will hold the new Block of Data
	if(SelectedFile.webkitSlice) 
		NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	else
		NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	FReader.readAsBinaryString(NewFile);
});

//this function shows the upload progress
function UpdateBar(percent)
{
	document.getElementById('ProgressBar').style.width = percent + '%'; 
	document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%'; //sends the update text progress to the percent span
	var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576); //sets the amount of mb uploaded
	document.getElementById('MB').innerHTML = MBDone; //sends the amount of mb uploaded to the html
}

//listen on the socket to see if the upload is done
socket.on('Done', function (data)
{
	var Content = "Video Successfully Uploaded !!" //show the user the upload is complete
	//Content += "<img id='Thumb' src='" + Path + data['Image'] + "' alt='" + Name + "'><br>"; --------------need to get working ------------------
	Content += "</br><button type='button' name='Upload' value='' id='Restart' class='btn btn-primary btn-xl page-scroll'>Upload Another</button>"; //sets a button to allow the user to upload again
	document.getElementById('UploadArea').innerHTML = Content; //set the content to the div
	document.getElementById('Restart').addEventListener('click', Refresh); //make the refresh button direct to the refresh function
	//document.getElementById('Restart').style.left = '20px';
});

//If the user wants to upload another refresh the page
function Refresh()
{
	location.reload(true); //refresh the page
}

/************************************************************************************
/
/ Delete file or folder div functions below
/
************************************************************************************/


function deleteFolder()
{
	socket.emit("DELETE_FOLDERS", {"dir": "public/media/", "folder":document.getElementById("deleteFolderName").value});
	socket.on("RETURN_DELETE_FOLDER", function(data)
	{
		alert(data.data);
	});
}