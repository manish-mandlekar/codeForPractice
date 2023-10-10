const nodemailer = require("nodemailer")
const googleApis = require("googleapis")

const REDIRECT_URI =`https://developers.google.com/oauthplayground`;
const CLIENT_ID = ``;
const CLIENT_SECRET = ``;
const REFRESH_TOKEN = ``;

const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET,REDIRECT_URI);
authClient.setCredentials({refresh_token: REFRESH_TOKEN});

async function mailer(receiver,id,key){
    try{
        const ACCESS_TOKEN = await authClient.getAccessToken();
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user:"mmandlekar88@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })
        const details = {
            from: "Manish Mandlekar<mmandlekar88@gmail.com>",
            to: receiver,
            subject: "about you",
            text:"kuch to kuch to",
            html: `hey you can recover your account by clicking on the following link <a href="http://localhost:3000/forgot/${id}/${key}">http://localhost:3000/forgot/${id}/${key}</a>`
        }
        const result = await transport.sendMail(details);
        return result;
        
    }
    catch(err){
        return err;
    }
}

module.exports = mailer
