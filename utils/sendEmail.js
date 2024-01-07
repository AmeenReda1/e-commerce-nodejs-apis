const nodemailer=require('nodemailer')
const sendEmail=async(options)=>{
    // 1)create transporter (service that will send email like "Gmail", "Mailgun","mailtrap","sendGrid")
    //2) define email options ( like from, to, subject,content)
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT, // if secure false port=587 if true port=465
        secure:true,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    const mailOpts={
        from:`E-shop App <${process.env.EMAIL_USER}>`,
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    await transporter.sendMail(mailOpts)
}
module.exports=sendEmail