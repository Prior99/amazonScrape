const cron = require("node-cron");
const Product = require("./model/Product").Product;
const UserProductRelationship = require("./model/UserProductRelationship").UserProductRelationship;
const User = require("./model/User").User;
const request = require("request-promise");
const cheerio = require("cheerio");
const parseDecimalNumber = require("parse-decimal-number");
const numeral = require("numeral");
const notifyUsers = require("./notifyUsers");

numeral.register("locale", "de", {
  delimiters: {
    thousands: ".",
    decimal: ",",
  },
});


const cronRoutine = async() => {
  try {
    const productList = await Product.findAll();
    // expected - [ { asin: '1asin', price: 0, country_code: 'de' }, { asin: '2asin', price: 0, country_code: 'de' } ]

    console.log(productList, "productList");


    const productsWithNewPrice = await Promise.all(
      productList.map(({ asin, country_code }) => scrapePrices(asin, country_code)),
    );
    // // [ { asin: '1asin', new_price: 15 }, { asin: '2asin', new_price: 25 } ]

    // console.log(productsWithNewPrice, "productsWithNewPrice");

    const mergedProduct = mergeArraysFromAsin(productList, productsWithNewPrice);

    // console.log(mergedProduct, "mergedProduct");
    // [ { asin: 'B075RHX3WP', price: 0, new_price: 15, country_code: 'de' }, { asin: 'B01M7Y7BMG', price: 0,
    // new_price: 25, country_code: 'de' } ]

    const changedProducts = mergedProduct.filter(
      (product) => !!product.new_price && Number.parseFloat(product.price) !== product.new_price);

    console.log(changedProducts, "changedProducts");

    const changedAsinWithUserEmails = await Promise.all(
      changedProducts.map(async(productWithoutId) => {
        const { asin, country_code, new_price } = productWithoutId;
        console.log(asin, "asin");
        console.log(country_code, "countryCode");
        const productId = await Product.getByAsinAndCountryCode(asin, country_code);
        console.log(productId, "productId");
        Product.updatePriceById(productId, new_price);

        const userIdsTrackingChangedProducts = await UserProductRelationship.findAllUserIdsByProductId(productId);
        console.log(userIdsTrackingChangedProducts, "userIdsTrackingChangedProducts");

        const emailAddresses = await Promise.all(
          userIdsTrackingChangedProducts.map(async({ user_id }) => {
            return await User.getEmailById(user_id);
          }),
        );
        console.log(emailAddresses, "emailAddresses");

        return {
          asin,
          email: emailAddresses,
        };
      }),
    );

    const mergedProductWithEmails = mergeArraysFromAsin(changedProducts, changedAsinWithUserEmails);

    console.log(mergedProductWithEmails, "FINAL");
    // [{
    //   asin: "B075RHX3WP",
    //   country_code: "de",
    //   price: 0,
    //   new_price: "",
    //   email: ["zl2048@protonmail.com", "vibra.app@gmail.com"],
    // },
    //   {
    //     asin: "B01M7Y7BMG",
    //     country_code: "de",
    //     price: 0,
    //     new_price: "103,85 €",
    //     email: ["zl2048@protonmail.com"],
    //   }];

    if (mergedProductWithEmails.length > 0) {
      const infoSentMails = await Promise.all(
        mergedProductWithEmails.map(async(infoObject) => {
          await notifyUsers(infoObject);
        }),
      );

      console.log(infoSentMails, "SENT EMAILS RESPONSE");
    }


  } catch(e) {
    console.log(e);
  }
};


const mergeArraysFromAsin = (array1, array2) => {
  return array1.map((array1Member) => ({
    ...array1Member,
    ...array2.find((updatedProduct) => updatedProduct.asin === array1Member.asin),
  }));
};
const scrapePrices = async(asin, country_code) => {
  try {
    const amazonPage = await request({
      uri: `https://www.amazon.${country_code}/dp/${asin}`,
      gzip: true,
    });
    let $ = cheerio.load(amazonPage);
    const price = $("#priceblock_ourprice").text().trim();
    const priceWithoutCurrency = price
      .replace(/EUR/g, "")
      .replace(/€/g, "")
      .replace(/\$/g, "")
      .replace(/£/g, "")
      .trim();
    console.log(priceWithoutCurrency, "priceWithoutCurrencypriceWithoutCurrency");

    let priceToFloat = priceWithoutCurrency;
    if (priceToFloat) {
      priceToFloat = parseDecimalNumber(priceWithoutCurrency, numeral.localeData("de").delimiters);
    }
    const productTitle = $("#productTitle").text().trim();
    const productImage = $("#landingImage").attr("src");
    console.log(priceToFloat, "PRICE WITHOUT CURRENCY AND IN DECIMAL");
    return {
      asin,
      new_price: priceToFloat,
      product_title: productTitle,
      product_image: productImage,
    };
  } catch(err) {
    throw err;
  }
};

const startCron = () => {
  console.log("in start CRON");

  cron.schedule("50 * * * *", () => {
    console.log("in cron schedule");

    cronRoutine();
  });
};

module.exports = cronRoutine;

// Add product name to product array
