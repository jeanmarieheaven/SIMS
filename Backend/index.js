const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const session = require("express-session");
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// MySQL Connection
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "SIMS",
};

let db;

// Initialize database connection and create tables
async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database");

    // Create Users Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS Users (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(100) NOT NULL
        )
    `);

    // Create Spare_Part Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS Spare_Part (
            Name VARCHAR(100) PRIMARY KEY,
            Category VARCHAR(50),
            Quantity INT,
            UnitPrice DECIMAL(10,2)
        )
    `);

    // Create Stock_In Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS Stock_In (
            StockInDate DATE,
            StockInQuantity INT,
            SparePartName VARCHAR(100),
            FOREIGN KEY (SparePartName) REFERENCES Spare_Part(Name)
        )
    `);

    // Create Stock_Out Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS Stock_Out (
            StockOutDate DATE,
            StockOutQuantity INT,
            SparePartName VARCHAR(100),
            FOREIGN KEY (SparePartName) REFERENCES Spare_Part(Name)
        )
    `);

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Initialize database before starting the server
initializeDatabase()
  .then(() => {
    // Middleware to check if user is authenticated
    const isAuthenticated = (req, res, next) => {
      if (req.session.user) {
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    };

    // Login Endpoint
    app.post("/api/login", async (req, res) => {
      const { username, password } = req.body;
      try {
        const [rows] = await db.execute(
          "SELECT * FROM Users WHERE username = ? AND password = ?",
          [username, password]
        );
        if (rows.length > 0) {
          req.session.user = username;
          res.json({ message: "Login successful" });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Logout Endpoint
    app.post("/api/auth/logout", (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });

    // Get All Spare Parts
    app.get("/api/spare-parts", isAuthenticated, async (req, res) => {
      try {
        const [rows] = await db.execute(
          "SELECT Name, Category, Quantity, UnitPrice, (Quantity * UnitPrice) AS TotalPrice FROM Spare_Part"
        );
        res.json(rows);
      } catch (error) {
        console.error("Error fetching spare parts:", error);
        res.status(500).json({ error: "Failed to fetch spare parts" });
      }
    });

    // Add Spare Part
    app.post("/api/spare-parts", isAuthenticated, async (req, res) => {
      const { Name, Category, Quantity, UnitPrice } = req.body;
      try {
        await db.execute(
          "INSERT INTO Spare_Part (Name, Category, Quantity, UnitPrice) VALUES (?, ?, ?, ?)",
          [Name, Category, Quantity, UnitPrice]
        );
        res.json({ message: "Spare part added successfully" });
      } catch (error) {
        console.error("Error adding spare part:", error);
        res.status(500).json({ error: "Failed to add spare part" });
      }
    });

    // Stock In
    app.post("/api/stock-in", isAuthenticated, async (req, res) => {
      const { StockInDate, StockInQuantity, SparePartName } = req.body;

      // Validate input
      if (!StockInDate || !StockInQuantity || !SparePartName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (StockInQuantity <= 0) {
        return res
          .status(400)
          .json({ error: "Quantity must be greater than 0" });
      }

      try {
        // Check if spare part exists
        const [sparePart] = await db.execute(
          "SELECT Name FROM Spare_Part WHERE Name = ?",
          [SparePartName]
        );

        if (sparePart.length === 0) {
          return res.status(404).json({ error: "Spare part not found" });
        }

        // Begin transaction
        await db.beginTransaction();

        try {
          // Insert stock in record
          await db.execute(
            "INSERT INTO Stock_In (StockInDate, StockInQuantity, SparePartName) VALUES (?, ?, ?)",
            [StockInDate, StockInQuantity, SparePartName]
          );

          // Update spare part quantity
          await db.execute(
            "UPDATE Spare_Part SET Quantity = Quantity + ? WHERE Name = ?",
            [StockInQuantity, SparePartName]
          );

          await db.commit();
          res.json({ message: "Stock-in recorded successfully" });
        } catch (error) {
          await db.rollback();
          throw error;
        }
      } catch (error) {
        console.error("Error recording stock-in:", error);
        res.status(500).json({ error: "Failed to record stock-in" });
      }
    });

    // Stock Out
    app.post("/api/stock-out", isAuthenticated, async (req, res) => {
      const { StockOutDate, StockOutQuantity, SparePartName } = req.body;

      // Validate input
      if (!StockOutDate || !StockOutQuantity || !SparePartName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (StockOutQuantity <= 0) {
        return res
          .status(400)
          .json({ error: "Quantity must be greater than 0" });
      }

      try {
        // Check if spare part exists and has enough quantity
        const [sparePart] = await db.execute(
          "SELECT Quantity FROM Spare_Part WHERE Name = ?",
          [SparePartName]
        );

        if (sparePart.length === 0) {
          return res.status(404).json({ error: "Spare part not found" });
        }

        if (sparePart[0].Quantity < StockOutQuantity) {
          return res.status(400).json({
            error: `Insufficient quantity. Current stock: ${sparePart[0].Quantity}`,
          });
        }

        // Begin transaction
        await db.beginTransaction();

        try {
          // Insert stock out record
          await db.execute(
            "INSERT INTO Stock_Out (StockOutDate, StockOutQuantity, SparePartName) VALUES (?, ?, ?)",
            [StockOutDate, StockOutQuantity, SparePartName]
          );

          // Update spare part quantity
          await db.execute(
            "UPDATE Spare_Part SET Quantity = Quantity - ? WHERE Name = ?",
            [StockOutQuantity, SparePartName]
          );

          await db.commit();
          res.json({ message: "Stock-out recorded successfully" });
        } catch (error) {
          await db.rollback();
          throw error;
        }
      } catch (error) {
        console.error("Error recording stock-out:", error);
        res.status(500).json({ error: "Failed to record stock-out" });
      }
    });

    // Update Spare Part
    app.put("/api/spare-parts/:name", isAuthenticated, async (req, res) => {
      const { name } = req.params;
      const { Category, Quantity, UnitPrice } = req.body;
      try {
        await db.execute(
          "UPDATE Spare_Part SET Category = ?, Quantity = ?, UnitPrice = ? WHERE Name = ?",
          [Category, Quantity, UnitPrice, name]
        );
        res.json({ message: "Spare part updated successfully" });
      } catch (error) {
        console.error("Error updating spare part:", error);
        res.status(500).json({ error: "Failed to update spare part" });
      }
    });

    // Delete Spare Part
    app.delete("/api/spare-parts/:name", isAuthenticated, async (req, res) => {
      const { name } = req.params;
      try {
        // First check if there are any stock in/out records
        const [stockRecords] = await db.execute(
          "SELECT COUNT(*) as count FROM (SELECT SparePartName FROM Stock_In WHERE SparePartName = ? UNION SELECT SparePartName FROM Stock_Out WHERE SparePartName = ?) as records",
          [name, name]
        );

        if (stockRecords[0].count > 0) {
          return res.status(400).json({
            error: "Cannot delete spare part with existing stock records",
          });
        }

        await db.execute("DELETE FROM Spare_Part WHERE Name = ?", [name]);
        res.json({ message: "Spare part deleted successfully" });
      } catch (error) {
        console.error("Error deleting spare part:", error);
        res.status(500).json({ error: "Failed to delete spare part" });
      }
    });

    // Start the server
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
