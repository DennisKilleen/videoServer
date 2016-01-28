
# Home use video server 
This project is designed for people who have a lot of media files and wish to share them throughout a local network without the use of a usb. It is a server built on node.js and uses a simple html front end. This project will host media to all devices on a local network. If a file cant be played on the web player this software will transcode the media to a viewable format.

## Installation
Firstly install Node.js on whichever operating system you use. https://nodejs.org/  
Unzip the project and store it somewhere.  
Open the terminal and cd to the 'videoServer' directory.  
Then run the command "npm install".  
Next run the command "node app.js".   

## Usage
Open the browser of your choice.  
If you are on the machine this software is running on, in the address bar on your browser enter in the address 'localhost:9000'.  
If you are not on the same machine this software is runnning on make sure your device is on the same WiFi network and open your browser and enter the address 'YourIp:9000'.  
To get the ip of the machine running the software:  
In windows open a command prompt and enter in the command 'ipconfig' and the 'ENTER' button.  
On Ubuntu on the command prompt and enter in the command 'ip addr show' and the 'ENTER' button.  
In Mac on the command prompt and enter in the command 'ifconfig |grep inet' and the 'ENTER' button.  
THe ip address will look something like "194.153.205.26"  

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
  
## History
Initially build on 23/1/2016 includes sample media with playback.  
Latest build on 25/01/2016 has workinig upload but is not accesible to media player.
Latest build 26/01/2016 file upload sends file to the "Movies" folder.  
Latest build 27/01/2016 file uploads to selected directory. Graphical Progress bar works. Need to work on transcoding file format, adding thumbnail images and fix 'Temp' directory deletion, deleting specific files.  
Latest build the 28/01/2016 all aspects of the project work just have one final bug with the Temp folder deleting binary stream temp files(They take up space but only a few mb per 100 mb).  

## Planned todo list:
1.	~~Code clean.~~
2.	~~Recode the file upload to check for file extension.~~
3.	~~Pass all files that are not mp4 or avi to ffmpeg to transcode to mp4.~~
4.	~~Save the files into the relevant folder in Node.~~
5.	~~Create and input system to allow the user to create files.~~
6.	~~Set up an input system to delete files or folders.~~
7.	~~Fix folder upload destination.~~
8.	~~Create delete file/folder button.~~
9.	Create .bat, .sh to run file on os for ease of use.
10.	~~Add footer to html page.~~
11.	~~Fix graphical progress bar.~~ 
12.	Fix the deletion of the Temp folder.
13.	Add in image gallery.
14.	Add in sound player ability.   

## Thanks
Thanks to Gabriel Manricks for the binary stream upload tutorial and Projekktor for the open source player.  

## Contact 
dennis_killeen@hotamil.com if you have any issues or questions.

