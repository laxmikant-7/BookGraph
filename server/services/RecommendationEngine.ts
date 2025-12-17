/**
 * Recommendation Engine - BFS + Priority Queue Scoring
 * 
 * PURPOSE: Generate personalized book recommendations using graph traversal
 * and heap-based ranking.
 * 
 * ALGORITHM OVERVIEW:
 * 1. Start from the source book (user's selected book)
 * 2. Perform BFS with depth limit of 2
 *    - Depth 1: Direct connections (same author/genre)
 *    - Depth 2: Secondary connections (friend of friend)
 * 3. Score each discovered book based on:
 *    - Same Genre: +3 points
 *    - Same Author: +5 points
 *    - Shared Keywords: +1 point per keyword
 *    - Edge weight from graph
 *    - Depth penalty: Deeper = lower score
 * 4. Use Max Heap (Priority Queue) to rank and extract Top 5
 * 
 * TIME COMPLEXITY: O(V + E + K log V)
 * - BFS traversal: O(V + E)
 * - Heap operations for top K: O(K log V)
 * 
 * SPACE COMPLEXITY: O(V)
 * - Visited set, queue, and heap
 */

import { Book, Recommendation, Edge } from "@shared/schema";
import { BookGraph } from "../datastructures/Graph";
import { MaxHeap } from "../datastructures/PriorityQueue";

// Scoring constants
const SAME_GENRE_SCORE = 3;
const SAME_AUTHOR_SCORE = 5;
const KEYWORD_MATCH_SCORE = 1;
const BORROWED_TOGETHER_SCORE = 2;
const DEPTH_PENALTY_FACTOR = 0.5; // Depth 2 books get 50% of their score

// Maximum possible score for percentage calculation
// Genre(3) + Author(5) + Keywords(5*1) + BorrowedTogether(2) + EdgeWeight(~10 max)
export const MAX_POSSIBLE_SCORE = 25;

export class RecommendationEngine {
  private graph: BookGraph;
  private bookMap: Map<string, Book>; // HashMap for O(1) book lookup

  constructor(graph: BookGraph, bookMap: Map<string, Book>) {
    this.graph = graph;
    this.bookMap = bookMap;
  }

  /**
   * Calculate relationship score between two books
   * Time: O(K) where K is number of keywords
   */
  private calculateScore(
    sourceBook: Book, 
    targetBook: Book, 
    edgeWeight: number,
    relationshipTypes: Edge["relationshipTypes"]
  ): { score: number; reasons: string[] } {
    let score = edgeWeight; // Start with edge weight from graph
    const reasons: string[] = [];

    // Same genre bonus
    if (sourceBook.genre === targetBook.genre) {
      score += SAME_GENRE_SCORE;
      if (!reasons.includes("same_genre")) {
        reasons.push("same_genre");
      }
    }

    // Same author bonus
    if (sourceBook.author.toLowerCase() === targetBook.author.toLowerCase()) {
      score += SAME_AUTHOR_SCORE;
      if (!reasons.includes("same_author")) {
        reasons.push("same_author");
      }
    }

    // Keyword matching
    const sourceKeywords = new Set(sourceBook.keywords.map(k => k.toLowerCase()));
    let keywordMatches = 0;
    for (const keyword of targetBook.keywords) {
      if (sourceKeywords.has(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }
    if (keywordMatches > 0) {
      score += keywordMatches * KEYWORD_MATCH_SCORE;
      if (!reasons.includes("similar_keywords")) {
        reasons.push("similar_keywords");
      }
    }

    // Add existing relationship types from edge
    for (const type of relationshipTypes) {
      if (!reasons.includes(type)) {
        reasons.push(type);
      }
    }

    return { score, reasons };
  }

  /**
   * BFS Traversal with Depth Limit
   * 
   * Algorithm:
   * 1. Initialize queue with source book at depth 0
   * 2. Process nodes level by level up to MAX_DEPTH
   * 3. Track visited nodes to avoid cycles
   * 4. Score each discovered node and add to heap
   * 
   * Time: O(V + E) for traversal
   */
  getRecommendations(sourceBookId: string, limit: number = 5): Recommendation[] {
    const sourceBook = this.bookMap.get(sourceBookId);
    if (!sourceBook) {
      return [];
    }

    const MAX_DEPTH = 2;
    const visited = new Set<string>([sourceBookId]);
    const heap = new MaxHeap<{ book: Book; reasons: string[]; depth: number }>();

    // BFS Queue: [bookId, depth]
    const queue: [string, number][] = [];
    
    // Initialize with source book's neighbors
    const sourceEdges = this.graph.getNeighbors(sourceBookId);
    for (const edge of sourceEdges) {
      if (!visited.has(edge.targetBookId)) {
        queue.push([edge.targetBookId, 1]);
        visited.add(edge.targetBookId);
      }
    }

    // BFS traversal
    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!;
      
      const currentBook = this.bookMap.get(currentId);
      if (!currentBook) continue;

      // Find the edge from source to current (or through path)
      const directEdge = sourceEdges.find(e => e.targetBookId === currentId);
      const edgeWeight = directEdge?.weight || 1;
      const edgeTypes = directEdge?.relationshipTypes || [];

      // Calculate score
      const { score, reasons } = this.calculateScore(
        sourceBook,
        currentBook,
        edgeWeight,
        edgeTypes
      );

      // Apply depth penalty for secondary connections
      const finalScore = depth === 1 ? score : score * DEPTH_PENALTY_FACTOR;

      // Add to priority queue
      heap.push(finalScore, {
        book: currentBook,
        reasons,
        depth
      });

      // Continue BFS if within depth limit
      if (depth < MAX_DEPTH) {
        const neighbors = this.graph.getNeighbors(currentId);
        for (const edge of neighbors) {
          if (!visited.has(edge.targetBookId)) {
            visited.add(edge.targetBookId);
            queue.push([edge.targetBookId, depth + 1]);
          }
        }
      }
    }

    // Extract top K recommendations from heap
    const topItems = heap.extractTopK(limit);

    return topItems.map(item => ({
      book: item.data.book,
      score: item.score,
      relationshipTypes: item.data.reasons,
      depth: item.data.depth
    }));
  }

  /**
   * Build edges between a new book and existing books
   * Called when a book is added to the library
   * Time: O(N * K) where N is number of books, K is keywords per book
   */
  connectBook(newBook: Book, existingBooks: Book[]): void {
    this.graph.addNode(newBook.id);

    for (const existingBook of existingBooks) {
      if (existingBook.id === newBook.id) continue;

      let weight = 0;
      const relationshipTypes: Edge["relationshipTypes"] = [];

      // Same genre connection
      if (newBook.genre === existingBook.genre) {
        weight += SAME_GENRE_SCORE;
        relationshipTypes.push("same_genre");
      }

      // Same author connection
      if (newBook.author.toLowerCase() === existingBook.author.toLowerCase()) {
        weight += SAME_AUTHOR_SCORE;
        relationshipTypes.push("same_author");
      }

      // Keyword overlap
      const newKeywords = new Set(newBook.keywords.map(k => k.toLowerCase()));
      let keywordMatches = 0;
      for (const keyword of existingBook.keywords) {
        if (newKeywords.has(keyword.toLowerCase())) {
          keywordMatches++;
        }
      }
      if (keywordMatches > 0) {
        weight += keywordMatches * KEYWORD_MATCH_SCORE;
        relationshipTypes.push("similar_keywords");
      }

      // Simulate "borrowed together" for some connections (random for demo)
      if (weight > 0 && Math.random() > 0.7) {
        weight += BORROWED_TOGETHER_SCORE;
        relationshipTypes.push("borrowed_together");
      }

      // Only create edge if there's some relationship
      if (weight > 0) {
        this.graph.addEdge(newBook.id, existingBook.id, weight, relationshipTypes);
      }
    }
  }
}
