import { createTransport } from 'nodemailer';
const senderEmail = 'showa.developer@gmail.com';
const transporter = createTransport({
  host: 'smtp.gmail.com', //'smtp.ethereal.email', //, //, //  smtp.gmail.com
  port: 465, //587, //, // 465
  secure: true, // true for port 465, false for other ports
  auth: {
    user: senderEmail,
    pass: 'oadw pgmk dojz kqfq',
  },
});

export const sendMail = async ({
  receiverEmail,
  subjectLine,
  htmlBody,
}: {
  receiverEmail: string;
  subjectLine: string;
  htmlBody: string;
}) => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const info = await transporter.sendMail({
    from: `"Showa" <${senderEmail}>`, // sender address
    to: receiverEmail, // list of receivers
    subject: subjectLine, // Subject line
    // text: 'Hello world YYYYYYYYYY?', // plain text body
    html: htmlBody, // html body
  });

  return null;
};
