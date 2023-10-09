const nodemailer = require("nodemailer")
const googleApis = require("googleapis")

const REDIRECT_URI =`https://developers.google.com/oauthplayground`;
const CLIENT_ID = `895555928863-aftv33nol98blbipaj9l8v736scfglq3.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04LohX-SWeQBUCgYIARAAGAQSNwF-L9IrUnPbDXUf7RoYF5_1NsdslbIbWdDSFq14-9T_PFYVvkghDU6ib6YLS-uh4_JF4eJDVH8`;

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