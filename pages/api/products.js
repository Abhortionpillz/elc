// pages/api/products.js (NEW FILE)
// Handles GET (Read), POST (Create), and DELETE (Delete) for product metadata

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 1. READ: Fetch all products
    try {
      const { rows } = await sql`SELECT * FROM products ORDER BY id DESC;`;
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products." });
    }
  } 
  
  else if (req.method === 'POST') {
    // 2. CREATE: Save new product metadata
    try {
      const { name, price, image, category } = req.body;
      
      if (!name || !price || !image || !category) {
        return res.status(400).json({ error: "Missing product details." });
      }
      
      await sql`
        INSERT INTO products (name, price, image_url, category)
        VALUES (${name}, ${price}, ${image}, ${category});
      `;
      
      return res.status(200).json({ message: "Product saved successfully!" });
    } catch (error) {
      console.error("Error saving product:", error);
      return res.status(500).json({ error: "Failed to save product metadata." });
    }
  }

  else if (req.method === 'DELETE') {
    // 3. DELETE: Remove a product
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: "Missing product ID for deletion." });
      }
      
      await sql`DELETE FROM products WHERE id = ${id};`;
      
      return res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ error: "Failed to delete product." });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}