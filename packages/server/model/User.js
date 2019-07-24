const db = require("../database");

class User {
  constructor(email) {
    this.email = email;
    this.id = undefined;
  }

  async create() {
    try {
      const userId = await this.getByEmail(this.email);
      if (userId) {
        this.id = userId;
        return;
      }
      const query = `
        INSERT INTO users (email) VALUES
        ('${this.email}')
        RETURNING id;
      `;
      const response = await db.query(query);
      this.id = response.rows[0].id;
    } catch(error) {
      console.log(error, "error");

    }
  }

  async getByEmail(email) {
    const query = `
      SELECT id FROM users WHERE email='${email}';
    `;

    try {
      const response = await db.query(query);
      const responseRow = response.rows[0];
      if (!responseRow) {
        return;
      }
      return responseRow.id;
    } catch(error) {
      throw error;
    }
  }

  static async getEmailById(id) {
    const query = `
        SELECT email FROM users WHERE id='${id}';
      `;

    try {
      const response = await db.query(query);
      const responseRow = response.rows[0];
      console.log(id, "ID");
      console.log(responseRow, "response row");
      if (!responseRow) {
        return;
      }
      return responseRow.email;
    } catch(error) {
      throw error;
    }
  }
}

module.exports.User = User;