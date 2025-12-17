/**
 * Library Book Recommendation System - Data Schema
 * 
 * This file defines the core data models for the graph-based
 * book recommendation system using adjacency list representation.
 * 
 * Data Structure Choice: Graph (Adjacency List)
 * - Books are represented as nodes
 * - Relationships between books are edges with weights
 * - Enables efficient BFS traversal for recommendations
 * - Time Complexity: O(V + E) for traversal where V = vertices, E = edges
 */

import { z } from "zod";

/**
 * Book Schema - Represents a node in the recommendation graph
 * Each book has attributes used for edge weight calculation
 */
export const bookSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().min(1, "Genre is required"),
  keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  description: z.string().optional(),
});

export const insertBookSchema = bookSchema.omit({ id: true });

export type Book = z.infer<typeof bookSchema>;
export type InsertBook = z.infer<typeof insertBookSchema>;

/**
 * Edge Schema - Represents a weighted relationship between two books
 * Used in the adjacency list to store connection information
 * 
 * Edge weights are calculated based on:
 * - Same Genre: +3 points
 * - Same Author: +5 points  
 * - Shared Keywords: +1 point per shared keyword
 * - Borrowed Together: +2 points (simulated)
 */
export const edgeSchema = z.object({
  targetBookId: z.string(),
  weight: z.number(),
  relationshipTypes: z.array(z.enum([
    "same_genre",
    "same_author", 
    "similar_keywords",
    "borrowed_together"
  ])),
});

export type Edge = z.infer<typeof edgeSchema>;

/**
 * Recommendation Result - Output from the BFS traversal + Priority Queue ranking
 * Includes the book, its recommendation score, and why it was recommended
 */
export const recommendationSchema = z.object({
  book: bookSchema,
  score: z.number(),
  relationshipTypes: z.array(z.string()),
  depth: z.number(), // BFS depth level (1 = direct connection, 2 = secondary)
});

export type Recommendation = z.infer<typeof recommendationSchema>;

/**
 * API Response schemas for type-safe API contracts
 */
export const booksResponseSchema = z.array(bookSchema);
export const recommendationsResponseSchema = z.array(recommendationSchema);

export type BooksResponse = z.infer<typeof booksResponseSchema>;
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  query: z.string().min(1),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
