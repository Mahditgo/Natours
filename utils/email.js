const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');


module.exports = class Eamil {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`

  }


  newTransport() {
    if(process.env.NODE_ENV === 'production') {

      return 1
    }

    return nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "ff73d6ec574c28",
        pass: "8238ca865bf56b"
      }
    })
  }

  async send(template, subject) {

    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName : this.firstName,
      url : this.url,
      subject
    });


    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
      
    };

    await this.newTransport().sendMail(mailOptions)
  }
  async sendWelcome() {
    await this.send('welcome', 'welcom to the Natours')
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Youre password reset Token (valid only 10 minites)')
  }
}







