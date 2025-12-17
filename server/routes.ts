/**
 * API Routes for Library Book Recommendation System
 * 
 * Endpoints:
 * - GET /api/books - List all books
 * - GET /api/books/:id - Get a specific book
 * - POST /api/books - Create a new book
 * - DELETE /api/books/:id - Delete a book
 * - GET /api/books/:id/recommendations - Get recommendations for a book
 * - GET /api/search?q=query - Search books
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  /**
   * GET /api/books
   * Returns all books in the library
   */
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  /**
   * GET /api/books/:id
   * Returns a specific book by ID
   */
  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  /**
   * POST /api/books
   * Create a new book
   * Validates request body using Zod schema
   */
  app.post("/api/books", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating book:", error);
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  /**
   * DELETE /api/books/:id
   * Delete a book by ID
   * Also removes the book from the recommendation graph
   */
  app.delete("/api/books/:id", async (req, res) => {
    try {
      const success = await storage.deleteBook(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  /**
   * GET /api/books/:id/recommendations
   * Get book recommendations using BFS traversal and Priority Queue ranking
   * 
   * Algorithm:
   * 1. Find the book in the graph
   * 2. Perform BFS with depth limit of 2
   * 3. Score related books based on relationships
   * 4. Return top 5 ranked by Priority Queue
   */
  app.get("/api/books/:id/recommendations", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      const limit = parseInt(req.query.limit as string) || 5;
      const recommendations = await storage.getRecommendations(req.params.id, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  /**
   * GET /api/search
   * Search books by title, author, genre, or keywords
   */
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const results = await storage.searchBooks(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json({ error: "Failed to search books" });
    }
  });

  return httpServer;
}
