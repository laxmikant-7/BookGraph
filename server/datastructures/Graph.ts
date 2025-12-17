/**
 * Graph Data Structure - Adjacency List Implementation
 * 
 * PURPOSE: Represents books as nodes and their relationships as weighted edges.
 * This is the CORE data structure for the recommendation system.
 * 
 * WHY GRAPH?
 * - Books naturally form a network of relationships
 * - Efficient for discovering related items through traversal
 * - Adjacency list is space-efficient for sparse graphs: O(V + E)
 * - Fast neighbor lookup: O(degree of vertex)
 * 
 * TIME COMPLEXITY:
 * - addNode: O(1)
 * - removeNode: O(V + E) - must clean up all edges
 * - addEdge: O(1) amortized
 * - removeEdge: O(E) in worst case
 * - getNeighbors: O(1)
 * - BFS traversal: O(V + E)
 * 
 * SPACE COMPLEXITY: O(V + E)
 */

import { Edge } from "@shared/schema";

export interface GraphNode {
  id: string;
  edges: Edge[];
}

export class BookGraph {
  private adjacencyList: Map<string, Edge[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  /**
   * Add a book node to the graph
   * Time: O(1)
   */
  addNode(bookId: string): void {
    if (!this.adjacencyList.has(bookId)) {
      this.adjacencyList.set(bookId, []);
    }
  }

  /**
   * Remove a book node and all its edges from the graph
   * Time: O(V + E) - need to remove edges from all connected nodes
   */
  removeNode(bookId: string): void {
    // Remove all edges pointing to this node from other nodes
    this.adjacencyList.forEach((edges, nodeId) => {
      if (nodeId !== bookId) {
        const filteredEdges = edges.filter(e => e.targetBookId !== bookId);
        this.adjacencyList.set(nodeId, filteredEdges);
      }
    });
    
    // Remove the node itself
    this.adjacencyList.delete(bookId);
  }

  /**
   * Add a weighted edge between two books (undirected)
   * Time: O(1) amortized
   */
  addEdge(
    sourceId: string, 
    targetId: string, 
    weight: number, 
    relationshipTypes: Edge["relationshipTypes"]
  ): void {
    // Ensure both nodes exist
    this.addNode(sourceId);
    this.addNode(targetId);

    // Check if edge already exists and update it
    const sourceEdges = this.adjacencyList.get(sourceId)!;
    const existingEdgeIndex = sourceEdges.findIndex(e => e.targetBookId === targetId);
    
    if (existingEdgeIndex >= 0) {
      // Update existing edge - merge relationship types and add weights
      const existing = sourceEdges[existingEdgeIndex];
      const mergedTypes = [...new Set([...existing.relationshipTypes, ...relationshipTypes])] as Edge["relationshipTypes"];
      sourceEdges[existingEdgeIndex] = {
        targetBookId: targetId,
        weight: existing.weight + weight,
        relationshipTypes: mergedTypes
      };
    } else {
      // Add new edge
      sourceEdges.push({
        targetBookId: targetId,
        weight,
        relationshipTypes
      });
    }

    // Add reverse edge for undirected graph
    const targetEdges = this.adjacencyList.get(targetId)!;
    const existingReverseIndex = targetEdges.findIndex(e => e.targetBookId === sourceId);
    
    if (existingReverseIndex >= 0) {
      const existing = targetEdges[existingReverseIndex];
      const mergedTypes = [...new Set([...existing.relationshipTypes, ...relationshipTypes])] as Edge["relationshipTypes"];
      targetEdges[existingReverseIndex] = {
        targetBookId: sourceId,
        weight: existing.weight + weight,
        relationshipTypes: mergedTypes
      };
    } else {
      targetEdges.push({
        targetBookId: sourceId,
        weight,
        relationshipTypes
      });
    }
  }

  /**
   * Get all edges (neighbors) for a book
   * Time: O(1)
   */
  getNeighbors(bookId: string): Edge[] {
    return this.adjacencyList.get(bookId) || [];
  }

  /**
   * Check if a node exists in the graph
   * Time: O(1)
   */
  hasNode(bookId: string): boolean {
    return this.adjacencyList.has(bookId);
  }

  /**
   * Get all node IDs in the graph
   * Time: O(V)
   */
  getAllNodes(): string[] {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Get total number of nodes
   * Time: O(1)
   */
  getNodeCount(): number {
    return this.adjacencyList.size;
  }

  /**
   * Get total number of edges (counting undirected edges once)
   * Time: O(V + E)
   */
  getEdgeCount(): number {
    let count = 0;
    this.adjacencyList.forEach(edges => {
      count += edges.length;
    });
    return count / 2; // Divide by 2 for undirected graph
  }

  /**
   * Debug: Print the graph structure
   */
  printGraph(): void {
    console.log("=== Book Graph ===");
    this.adjacencyList.forEach((edges, nodeId) => {
      const edgeStr = edges.map(e => `${e.targetBookId}(w:${e.weight})`).join(", ");
      console.log(`${nodeId} -> [${edgeStr}]`);
    });
    console.log(`Nodes: ${this.getNodeCount()}, Edges: ${this.getEdgeCount()}`);
  }
}
