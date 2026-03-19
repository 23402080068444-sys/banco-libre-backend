const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mg307966@gmail.com",
    pass: "vmuc blcu yczg wjyd"
  }
});

let mailOptions = {
  from: "mg307966@gmail.com",
  to: "23402080068444@cecytebc.edu.mx",
  subject: "Prueba Banco Libre",
  text: "Este es un correo de prueba."
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log("Error:", error);
  }
  console.log("Correo enviado:", info.response);
});
