import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
class Product {
  @PrimaryGeneratedColumn("uuid")
  public id?: string;

  @Column("text")
  public asin?: string;

  @Column("text")
  public country_code?: string;

  @Column("numeric")
  public price?: number;

  @CreateDateColumn()
  created_at?: Date;

  // async create() {
  //   try {
  //     const productId = await Product.getByAsinAndCountryCode(this.asin, this.countryCode);
  //     if (productId) {
  //       this.id = productId;
  //       return;
  //     }
  //     const query = `
  //       INSERT INTO products (asin, country_code) VALUES
  //       ('${this.asin}', '${this.countryCode}')
  //       RETURNING id;
  //     `;
  //     const response = await db.query(query);
  //     this.id = response.rows[0].id;
  //   } catch(error) {
  //     console.log(error, "error");

  //   }
  // }

  // static async getByAsinAndCountryCode(asin, countryCode) {
  //   const query = `
  //             SELECT id FROM products WHERE asin='${asin}' AND country_code='${countryCode}';
  //           `;

  //   try {
  //     const response = await db.query(query);
  //     const responseRow = response.rows[0];
  //     if (!responseRow) {
  //       return;
  //     }
  //     return responseRow.id;
  //   } catch(error) {
  //     throw error;
  //   }
  // }

  // static async findAll() {
  //   const query = `
  //     SELECT asin, country_code, price FROM products;
  //   `;

  //   try {
  //     const response = await db.query(query);
  //     return response.rows;
  //   } catch(error) {
  //     throw error;
  //   }
  // }

  // static async setPrice(price) {
  //   try {
  //     const query = `
  //            INSERT INTO products (price) VALUES
  //            ('${price}');
  //          `;
  //     const response = await db.query(query);
  //     this.id = response.rows[0].id;
  //   } catch(error) {
  //     throw error;
  //   }
  // }

  // static async updatePriceById(id, price) {
  //   try {
  //     console.log("ID", id);
  //     console.log("PRICE PIR DWPI CEPI CEPICE PRICE", price);
  //     const query = `
  //                UPDATE products
  //                SET price = ${price}
  //                WHERE
  //                   id='${id}';
  //              `;
  //     await db.query(query);
  //   } catch(error) {
  //     throw error;
  //   }
  // }
}

module.exports.Product = Product;
