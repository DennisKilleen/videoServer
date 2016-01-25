
# Home use video server 
This project is designed for people who have a lot of media files and wish to share them throughout a local network without the use of a usb. It is a server built on node.js and uses a simple html front end. This project will host media to all devices on a local network.

## Installation
To run firstly install Node.js on whichever operating system you use. Then run the command "npm install" after you cd to the folder in the terminal. Next run the command "node app.js" and go to the localhost:9000 on the browser of your choice. For devices that the softwre is not onstalled on use the ip address of the machine ruinng the video server for example: '192.196.2.103:9000' and the page should show up. These external devices should be connected to the same wifi to enable the cross device use. 

## Usage
After running the project direct your browser to the ip with the port number at :9000

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
  
## History
Initially build on 23/1/2016 includes sample media with playback.  
Latest build on 25/01/2016 has workinjg upload but is not accesible to media player.

## Planned todo list:
1.	Code clean.
2.	Recode the file upload to check for file extension.
3.	Pass all files that are not mp4 or avi to ffmpeg to transcode to mp4.
4.	Save the files into the relevant folder in Node.
5.	Create and input system to allow the user to create files.
6.	Set up an input system to delete files or folders.  

## Thanks
Thanks to Gabriel Manricks for the binary stream upload tutorial and Projekktor for the open source player.  

## Contact 
dennis_killeen@hotamil.com if you have any issues or questions.

