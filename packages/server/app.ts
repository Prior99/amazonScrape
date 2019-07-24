import * as dotenv as from "dotenv"
import * as express from "express";
import * as bodyParser from "body-parser";
import * as User from "./model/User".User;
import * as Product from "./model/Product".Product;
import * as UserProductRelationship from "./model/UserProductRelationship".UserProductRelationship;
import * as db from "./database";
import * as startCron from "./cron";
import { createConnection, Transaction } from "typeorm";

const app = express();
dotenv.config();

const port = 3000;

async function main() {
  const connection = await createConnection({
    entities: [Product],
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASS,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    type: "postgres",
  });

    app.use(bodyParser.json());

  startCron();

  app.get("/", (req, res) => {
    res.send("server running");
  });

  app.post("/createScraper", async (req, res) => {
    const { body } = req;
    const { countryCode, asin, email } = body;
    try {
      const user = new User(email);
      await user.create();
      const newProduce = await connection.getRepository(Product).create({
        asin,
        country_code: countryCode,
      });
      const product = new Product(asin, countryCode);
      await product.create();
      const userProductRelationship = new UserProductRelationship(user.id, product.id);
      await userProductRelationship.create();
      res.send("success");
    } catch (error) {
      res.status(400).send({
        message: error.message,
      });
      console.log(error);
    }
  });

  app.delete("/user/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const deleteUserQuery = `
      DELETE FROM users
      WHERE id = '${id}';
    `;
      const deleteUserResponse = await db.query(deleteUserQuery);
      console.log(deleteUserResponse);
      res.send("success");
    } catch (error) {
      console.log(error, "error");
    }
  });

  app.delete("/userProduct/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {

      connection.query(`
        DELETE FROM user_product_relationship
        WHERE user_id = :userId AND product_id=:productId;
      `, { userId, productId });
      const query = connection.getRepository(UserProductRelationship).createQueryBuilder("relationship")
        .delete()
        .where({ user_id: userId })
        .andWhere({ product_id: productId });
      
      const a = await connection.getRepository(Product).find({
        relations: ["user_product_relationship", "user_product_relationship.user"],
        where: {
          user: {
            id: userId,
          }
        }
      });


      const deleteRelationResponse = await db.query(deleteRelationQuery);
      console.log(deleteRelationResponse);
      res.send("success");
    } catch (error) {
      console.log(error, "error");
    }
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));

}

main();
