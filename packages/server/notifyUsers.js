const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function notifyUsers(infoObject) {
  // infoObject = {
  //   asin: "B075RHX3WP",
  //   country_code: "de",
  //   price: 0,
  //   new_price: "",
  //   email: ["zl2048@protonmail.com", "vibra.app@gmail.com"],
  //   product_title:
  //      'Blink XT System für Videoüberwachung, mit Bewegungserkennung, Befestigungsset, HD-Video, 2 Jahre
  //      Batterielaufzeit, inkl. Cloud-Speicherdienst, Drei-Kamera-System',
  //  product_image:
  //      'https://images-na.ssl-images-amazon.com/images/I/41QJ0k5GPuL._SY300_.jpg', }
  // ${`https://www.amazon.${country_code}/dp/${asin}`}
  const {
    asin,
    country_code,
    price,
    new_price,
    product_title,
    product_image,
    email,
  } = infoObject;
  return new Promise((resolve, reject) => {
    // send mail with defined transport object
    const msg = {
      to: email,
      html: `
      <div>
            <div>
              <a style="text-decoration:none; color: black" target="_blank" href="${`https://www.amazon.${country_code}/dp/${asin}`}">
                <img alt="Product:" src=${product_image} /> <br/>
                <h4>${product_title}</h4>
              </a>
            </div>
            <h3>Your product now costs <strike style="color:red">${price}</strike> <b style="color:green">${new_price}</b></h3> <br />
            <a target="_blank" href="${`https://www.amazon.${country_code}/dp/${asin}`}">Check on Amazon</a>
      </div>
      `,
      from: "noreply@tracker.com",
      subject: `Your updated amazon product price for ${asin}`,
    };
    sgMail
      .send(msg)
      .then(info => {
        resolve(info.response);
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = notifyUsers;