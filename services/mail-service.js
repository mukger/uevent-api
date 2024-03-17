const nodemailer = require('nodemailer');
const config = require("../config.json");

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.mail.user,
                pass: config.mail.pass
            }
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: `Uevent <${config.mail.user}>`,
            to,
            subject: 'Activation account',
            text: '',
            html:
                `
                    <html>
                        <head>
                            <style>
                                body { 
                                    font-family: 'Didact Gothic', sans-serif;
                                    margin: 0px 40px;
                                }
                                p {
                                    padding: 0px;
                                    margin: 0px;
                                    
                                }
                                h1 {
                                    text-align: center;
                                    font-size: 36px;
                                    font-family: 'Comfortaa', cursive;
                                    color: green;
                                }
                                img {
                                    margin:auto;
                                    width: 100px;
                                    height: 100px;
                                }
                                .header {
                                    display: grid;
                                    justify-content: center;
                                    row-gap: 20px;
                                }
                                h2 {
                                    font-weight: 700;
                                    font-size: 20px;
                                    opacity: 0.6;
                                    margin-top: 30px;
                                    margin-bottom: 30px;   
                                }
                                .text-content {
                                    opacity: 0.6;
                                    padding: 10px 20px;
                                    font-size: 18px;
                                    margin-bottom: 20px;
                                }
                                .link {
                                    margin: auto;
                                    text-align: center;
                                    margin-bottom: 20px;
                                }
                                .link a {
                                    text-transform: none;
                                    text-decoration: none;
                                    color: white;
                                    background-color: green;
                                    font-family: 'Comfortaa', cursive;
                                    text-transform: uppercase;
                                    font-size: 30px;
                                    padding: 5px 30px;
                                    transition: 0.4s;
                                    
                                }
                                .link a:hover{
                                    background-color: rgb(23, 88, 3);
                                }
                                .link a:active{
                                    background-color: rgb(0, 150, 12);
                                    color: #ffffff;
                                    box-shadow: 10px 15px 15px rgb(112, 112, 112);
                                }
                                .last-part {
                                    text-align: right;
                                    opacity: 0.7;
                                    font-size: 24px;
                                    margin-top: 40px;
                                    color: green;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Uevent</h1>
                                <img className="logo" src='https://i.ibb.co/7jqPbX7/Untitled-logo-3-free-file-1-transformed.png' alt='logo'/>
                            </div>
                            <div>
                                <h2>Your activation account link here: </h2>
                                <a href="${link}">${link}</a>
                                <p class="last-part">This letter does not require a response, have a nice day!</p>
                            </div>
                        </body>
                    </html>
                `
        });
    }

    async sendTicket(to, pdfOutput) {
        await this.transporter.sendMail({
            from: `Uevent <${config.mail.user}>`,
            to,
            subject: "Ticket",
            text: "Wait for you",
            attachments: [{ filename: 'ticket.pdf', path: pdfOutput }],
        });
    }

    async sendEventNotification(mailUsersArray, event_name) {
        await this.transporter.sendMail({
            from: `Uevent <${config.mail.user}>`,
            to: `${mailUsersArray}`,
            subject: `Event ${event_name} get started!`,
            html:`
                <html>
                    <head>
                        <style>
                            body { 
                                font-family: 'Didact Gothic', sans-serif;
                                margin: 0px 40px;
                            }
                            p {
                                padding: 0px;
                                margin: 0px;
                                
                            }
                            h1 {
                                text-align: center;
                                font-size: 36px;
                                font-family: 'Comfortaa', cursive;
                                color: green;
                            }
                            img {
                                margin:auto;
                                width: 100px;
                                height: 100px;
                            }
                            .header {
                                display: grid;
                                justify-content: center;
                                row-gap: 20px;
                            }
                            h2 {
                                font-weight: 700;
                                font-size: 20px;
                                opacity: 0.6;
                                margin-top: 30px;
                                margin-bottom: 30px;   
                            }
                            .text-content {
                                opacity: 0.6;
                                padding: 10px 20px;
                                font-size: 18px;
                                margin-bottom: 20px;
                            }
                            .link {
                                margin: auto;
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .link a {
                                text-transform: none;
                                text-decoration: none;
                                color: white;
                                background-color: green;
                                font-family: 'Comfortaa', cursive;
                                text-transform: uppercase;
                                font-size: 30px;
                                padding: 5px 30px;
                                transition: 0.4s;
                                
                            }
                            .link a:hover{
                                background-color: rgb(23, 88, 3);
                            }
                            .link a:active{
                                background-color: rgb(0, 150, 12);
                                color: #ffffff;
                                box-shadow: 10px 15px 15px rgb(112, 112, 112);
                            }
                            .last-part {
                                text-align: right;
                                opacity: 0.7;
                                font-size: 24px;
                                margin-top: 40px;
                                color: green;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Uevent</h1>
                            <img className="logo" src='https://i.ibb.co/7jqPbX7/Untitled-logo-3-free-file-1-transformed.png' alt='logo'/>
                        </div>
                        <div>
        
                            <h2>Reminder</h2>
                            <p class="text-content">Event ${event_name} you was subscribed to get started!</p>
        
                            <p class="last-part">This letter does not require a response!</p>
                        </div>
                    </body>
                </html>
            `
        });
    }

    async sendCompanyNotification(mailUsersArray, cname, event_name) {
        await this.transporter.sendMail({
            from: `Uevent <${config.mail.user}>`,
            to: `${mailUsersArray}`,
            subject: `${cname[0].toUpperCase() + cname.slice(1)} notification`,
            html:`
                <html>
                    <head>
                        <style>
                            body { 
                                font-family: 'Didact Gothic', sans-serif;
                                margin: 0px 40px;
                            }
                            p {
                                padding: 0px;
                                margin: 0px;
                                
                            }
                            h1 {
                                text-align: center;
                                font-size: 36px;
                                font-family: 'Comfortaa', cursive;
                                color: green;
                            }
                            img {
                                margin:auto;
                                width: 100px;
                                height: 100px;
                            }
                            .header {
                                display: grid;
                                justify-content: center;
                                row-gap: 20px;
                            }
                            h2 {
                                font-weight: 700;
                                font-size: 20px;
                                opacity: 0.6;
                                margin-top: 30px;
                                margin-bottom: 30px;   
                            }
                            .text-content {
                                opacity: 0.6;
                                padding: 10px 20px;
                                font-size: 18px;
                                margin-bottom: 20px;
                            }
                            .link {
                                margin: auto;
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .link a {
                                text-transform: none;
                                text-decoration: none;
                                color: white;
                                background-color: green;
                                font-family: 'Comfortaa', cursive;
                                text-transform: uppercase;
                                font-size: 30px;
                                padding: 5px 30px;
                                transition: 0.4s;
                                
                            }
                            .link a:hover{
                                background-color: rgb(23, 88, 3);
                            }
                            .link a:active{
                                background-color: rgb(0, 150, 12);
                                color: #ffffff;
                                box-shadow: 10px 15px 15px rgb(112, 112, 112);
                            }
                            .last-part {
                                text-align: right;
                                opacity: 0.7;
                                font-size: 24px;
                                margin-top: 40px;
                                color: green;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Uevent</h1>
                            <img className="logo" src='https://i.ibb.co/7jqPbX7/Untitled-logo-3-free-file-1-transformed.png' alt='logo'/>
                        </div>
                        <div>
        
                            <h2>Notification</h2>
                            
                            Company "${cname}" published a new event "${event_name}"
        
                            <p class="last-part">This letter does not require a response!</p>
                        </div>
                    </body>
                </html>
            `
        });
    }

    async sendNotificationByFailedPayment(userEmail, event_name) {
        await this.transporter.sendMail({
            from: `Uevent <${config.mail.user}>`,
            to: `${userEmail}`,
            subject: `Payment have failed!`,
            html:`
                <html>
                    <head>
                        <style>
                            body { 
                                font-family: 'Didact Gothic', sans-serif;
                                margin: 0px 40px;
                            }
                            p {
                                padding: 0px;
                                margin: 0px;
                                
                            }
                            h1 {
                                text-align: center;
                                font-size: 36px;
                                font-family: 'Comfortaa', cursive;
                                color: green;
                            }
                            img {
                                margin:auto;
                                width: 100px;
                                height: 100px;
                            }
                            .header {
                                display: grid;
                                justify-content: center;
                                row-gap: 20px;
                            }
                            h2 {
                                font-weight: 700;
                                font-size: 20px;
                                opacity: 0.6;
                                margin-top: 30px;
                                margin-bottom: 30px;   
                            }
                            .text-content {
                                opacity: 0.6;
                                padding: 10px 20px;
                                font-size: 18px;
                                margin-bottom: 20px;
                            }
                            .link {
                                margin: auto;
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .link a {
                                text-transform: none;
                                text-decoration: none;
                                color: white;
                                background-color: green;
                                font-family: 'Comfortaa', cursive;
                                text-transform: uppercase;
                                font-size: 30px;
                                padding: 5px 30px;
                                transition: 0.4s;
                                
                            }
                            .link a:hover{
                                background-color: rgb(23, 88, 3);
                            }
                            .link a:active{
                                background-color: rgb(0, 150, 12);
                                color: #ffffff;
                                box-shadow: 10px 15px 15px rgb(112, 112, 112);
                            }
                            .last-part {
                                text-align: right;
                                opacity: 0.7;
                                font-size: 24px;
                                margin-top: 40px;
                                color: green;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Uevent</h1>
                            <img className="logo" src='https://i.ibb.co/7jqPbX7/Untitled-logo-3-free-file-1-transformed.png' alt='logo'/>
                        </div>
                        <div>
        
                            <h2>Alert</h2>
                            <p class="text-content">Event "${event_name}" ticket purchase operation failed</p>
        
                            <p class="last-part">This letter does not require a response!</p>
                        </div>
                    </body>
                </html>
            `
        });
    }

}

module.exports = new MailService();