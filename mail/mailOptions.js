const dotenv = require("dotenv");
const Mailgen = require("mailgen");

dotenv.config();

function createMailOptions(theme,to, subject, body) {

  const MailGenerator = new Mailgen({
    theme: theme,
    product: {
      name: process.env.APPLICATION_NAME,
      link: "https://google.com",
    },
  });

  let EmailBody = MailGenerator.generate(body);
  let emailtext = MailGenerator.generatePlaintext(body);

//   const mailOptions = {
//     from: process.env.EMAIL_NAME,
//     to: to,
//     subject: subject,
//     html: EmailBody,
//     text: mailGenerator.generatePlaintext(body),
//   };

  return {
    from: process.env.EMAIL_NAME,
    to: to,
    subject: subject,
    html: EmailBody,
    text: emailtext
  };
}

module.exports = createMailOptions;
