// api/products.js

// Import the Vercel Postgres client
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // NOTE: This code requires you to have a Vercel Postgres database linked
  // and a 'products' table created with columns: id (SERIAL PRIMARY KEY),
  // name (VARCHAR), price (NUMERIC), image (VARCHAR), category (VARCHAR).

  try {
    // --- GET Method: Fetch All Products ---
    if (req.method === 'GET') {
      // **Uncomment the line below when your database is set up:**
      /*
      const { rows: products } = await sql`SELECT * FROM products ORDER BY id DESC;`;
      return res.status(200).json(products);
      */

      // --- Temporary Mock Data (Remove after DB setup) ---
      const mockProducts = [
        {
          id: 101, // Unique ID is crucial for deletion
          name: "Example Designer Bag",
          price: 150000.00,
          image: "https://via.placeholder.com/200?text=Placeholder",
          category: "Fashion"
        }
      ];
      return res.status(200).json(mockProducts);
    }

    // --- POST Method: Handle Adding New Product (from admin panel) ---
    else if (req.method === 'POST') {
      const { name, price, image, category } = req.body;

      if (!name || !price || !image || !category) {
        return res.status(400).json({ error: "Missing required product fields." });
      }

      // **Uncomment the lines below when your database is set up:**
      /*
      const result = await sql`
        INSERT INTO products (name, price, image, category)
        VALUES (${name}, ${price}, ${image}, ${category})
        RETURNING *; // Return the new product details
      `;
      return res.status(201).json({ message: "Product added successfully", product: result.rows[0] });
      */

      // --- Temporary Success Response (Remove after DB setup) ---
      console.log(`Received new product for database: ${name}`);
      return res.status(201).json({ message: "Product data received (Database placeholder)." });
    }
    
    // --- DELETE Method: Handle Deleting a Product ---
    else if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Missing product ID for deletion." });
        }
        
        // **Uncomment the lines below when your database is set up:**
        /*
        const result = await sql`
            DELETE FROM products WHERE id = ${id};
        `;
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Product not found." });
        }
        return res.status(200).json({ message: "Product deleted successfully." });
        */
        
        // --- Temporary Success Response (Remove after DB setup) ---
        console.log(`Received request to delete product ID: ${id}`);
        return res.status(200).json({ message: `Product ID ${id} deleted (Database placeholder).` });
    }

    // --- Other Methods ---
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
}