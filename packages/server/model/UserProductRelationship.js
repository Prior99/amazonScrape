const db = require("../database");

class UserProductRelationship {
  constructor(userId, productId) {
    this.userId = userId;
    this.productId = productId;
    Object.freeze(this);
  }

  async create() {
    const query = `
        INSERT INTO user_product_relationship (user_id, product_id) VALUES
        ('${this.userId}', '${this.productId}');
        `;

    try {
      await db.query(query);
    } catch(error) {
      if (error.constraint === "user_product_relationship_pkey") {
        throw new Error("Entry already exists");
      } else {
        throw error;
      }
    }
  }

  static async findAllUserIdsByProductId(productId) {
    const query = `
          SELECT user_id FROM user_product_relationship WHERE product_id=${productId}
        `;

    try {
      const response = await db.query(query);
      return response.rows;
    } catch(error) {
      throw error;
    }
  }
}

module.exports.UserProductRelationship = UserProductRelationship;