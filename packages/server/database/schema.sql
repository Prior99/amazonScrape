DROP TABLE IF EXISTS user_product_relationship;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS delete_product_not_in_user_product_relationship;


CREATE TABLE IF NOT EXISTS users (
  id SERIAL,
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL,
  asin TEXT NOT NULL,
  country_code TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT unique_product UNIQUE(asin,country_code)
);

CREATE TABLE IF NOT EXISTS user_product_relationship (
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE FUNCTION delete_product_not_in_user_product_relationship() RETURNS trigger AS $delete_product_not_in_user_product_relationship$
BEGIN
    DELETE FROM products WHERE id NOT IN (SELECT product_id FROM user_product_relationship);
    RETURN OLD;
END;
$delete_product_not_in_user_product_relationship$ LANGUAGE plpgsql;

CREATE TRIGGER delete_product_not_in_user_product_relationship AFTER DELETE OR UPDATE ON user_product_relationship
FOR EACH ROW EXECUTE PROCEDURE delete_product_not_in_user_product_relationship();

--https://stackoverflow.com/questions/4069718/postgres-insert-if-does-not-exist-already
--https://stackoverflow.com/questions/35371286/many-to-many-relation-automatically-delete-orphans