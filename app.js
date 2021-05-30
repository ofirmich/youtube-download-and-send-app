//all modules 
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const ytdl = require('ytdl-core');
var nodemailer = require('nodemailer');

//defult port for now - please check that this port available
const port = 4000; 

//parsing post method body helpera
app.use('/public',express.static(path.join(__dirname,'static')));
app.use(bodyParser.urlencoded({extended: false}));


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'static','index.html'));
});

  
//for email sending
function createTransport(){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ofirmichaelyforseatback@gmail.com',
          pass: '12qwasdz'
        }
    });
     return transporter;
}

function createMailOptions(emailSendTo, urlOnly){
    var mailOptions = {
        from: 'ofirmichaelyforseatback@gmail.com',
        to: emailSendTo,
        subject: 'I did it!',
        text: 'Hi Adiel!' + '\n' + 'Thank you very much for the opportunity.'+ '\n' + 'I enjoyed and learned a lot from this assignment.' + '\n' + "Here's the link:" + '\n' + urlOnly 
    }
    return mailOptions;
}


//check if url input is valid for youtube url
function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if(url.match(p)){
        return true;
    }
    return false;
}

//after pressing on submit button we got here
app.post('/' , async(req,res)=>{
    var youTubeUrl = req.body.url;
    var emailSendTo = req.body.email;

    if(!matchYoutubeUrl(youTubeUrl)){
        res.send('url is invalid! <a href="http://localhost:4000">try again</a>');
        return;
    }

    //download url youtube link with ytdl
    var videoStream = ytdl(youTubeUrl);
    res.header('Content-Disposition', 'attachment; filename="myVideo.mp4"');
    videoStream.pipe(res);

    //get inside info from url to get direct download link
    const info = await ytdl.getInfo(youTubeUrl);
    
    //turn object to string
    const infoAsString = JSON.stringify(info);
    
    // get only the link url we need from info
    const StartTerm = '"url":"';
    const indexOfStart = infoAsString.indexOf(StartTerm);
    const tempString = infoAsString.substring(indexOfStart + 7) 

    const EndTerm = '"';
    const indexOfEnd = tempString.indexOf(EndTerm);

    //now we have only the url we needed
    const urlOnly = tempString.substring(0, indexOfEnd);

    //send the email with requsted link
    var transporter = createTransport();
    var mailOptions = createMailOptions(emailSendTo, urlOnly);

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent!');

        }
        });
    });


//listen to server
app.listen(port,function(){
    console.log(`Server listening on port ${port}`);
  });
