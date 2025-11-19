
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // ==============================
    //  GET → Fetch all products
    // ==============================
    if (req.method === "GET") {
      const { rows } = await sql`
        SELECT * FROM products ORDER BY id DESC;
      `;
      return res.status(200).json(rows);
    }

    // ==============================
    //  POST → Add new product
    // ==============================
    else if (req.method === "POST") {
      const { name, price, image, category } = req.body;

      if (!name || !price || !image || !category) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const result = await sql`
        INSERT INTO products (name, price, image, category)
        VALUES (${name}, ${price}, ${image}, ${category})
        RETURNING *;
      `;

      return res.status(201).json({
        message: "Product added successfully",
        product: result.rows[0],
      });
    }

    // ==============================
    //  DELETE → Remove product
    // ==============================
    else if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required." });
      }

      const result = await sql`
        DELETE FROM products WHERE id = ${id};
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Product not found." });
      }

      return res.status(200).json({
        message: `Product ID ${id} deleted successfully.`,
      });
    }

    // ==============================
    //  METHOD NOT ALLOWED
    // ==============================
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
