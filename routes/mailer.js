var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json'));
var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service : 'gmail',
    secure : false,
    auth : {
        user : config.hostEmailId,
        pass : config.hostEmailPass
    },
    tls : {
        rejectUnauthorized : false
    }
});

let HelperOptions = {
    from : 'config.hostEmailId',
    to : 'trianzankanm@gmail.com',
    subject : 'TEST EMAIL',
    text : 'Welcome 2 Automated mail by Locator'
}

transporter.sendMail(HelperOptions, (err,info) => {
    if(err){
        return console.log(err);
    }
    console.log('Email Send successfully');
    console.log(info);
});