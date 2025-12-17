/**
 * Priority Queue - Max Heap Implementation
 * 
 * PURPOSE: Rank book recommendations by score, returning top N books efficiently.
 * Used after BFS traversal to select the best recommendations.
 * 
 * WHY MAX HEAP?
 * - Efficiently maintains ordering of recommendations by score
 * - O(log n) insertion maintains sorted property
 * - O(1) access to highest score element
 * - Perfect for "Top K" problems like "Top 5 Recommendations"
 * 
 * TIME COMPLEXITY:
 * - insert (push): O(log n) - bubble up
 * - extractMax (pop): O(log n) - bubble down
 * - peek: O(1)
 * - size: O(1)
 * 
 * SPACE COMPLEXITY: O(n)
 * 
 * HEAP PROPERTY: Parent score >= Child scores (Max Heap)
 */

export interface HeapItem<T> {
  score: number;
  data: T;
}

export class MaxHeap<T> {
  private heap: HeapItem<T>[];

  constructor() {
    this.heap = [];
  }

  /**
   * Get parent index for a given index
   */
  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  /**
   * Get left child index
   */
  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  /**
   * Get right child index
   */
  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  /**
   * Swap two elements in the heap
   */
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * Bubble up element to maintain heap property
   * Time: O(log n)
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
      if (this.heap[parentIndex].score >= this.heap[index].score) {
        break;
      }
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  /**
   * Bubble down element to maintain heap property
   * Time: O(log n)
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length;
    
    while (true) {
      const leftIndex = this.getLeftChildIndex(index);
      const rightIndex = this.getRightChildIndex(index);
      let largest = index;

      if (leftIndex < length && this.heap[leftIndex].score > this.heap[largest].score) {
        largest = leftIndex;
      }

      if (rightIndex < length && this.heap[rightIndex].score > this.heap[largest].score) {
        largest = rightIndex;
      }

      if (largest === index) {
        break;
      }

      this.swap(index, largest);
      index = largest;
    }
  }

  /**
   * Insert a new item into the heap
   * Time: O(log n)
   */
  push(score: number, data: T): void {
    this.heap.push({ score, data });
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Extract and return the maximum element
   * Time: O(log n)
   */
  pop(): HeapItem<T> | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return max;
  }

  /**
   * Peek at the maximum element without removing
   * Time: O(1)
   */
  peek(): HeapItem<T> | undefined {
    return this.heap[0];
  }

  /**
   * Get current size of the heap
   * Time: O(1)
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Check if heap is empty
   * Time: O(1)
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Extract top K elements from the heap
   * Time: O(K log n)
   */
  extractTopK(k: number): HeapItem<T>[] {
    const result: HeapItem<T>[] = [];
    const count = Math.min(k, this.heap.length);
    
    for (let i = 0; i < count; i++) {
      const item = this.pop();
      if (item) {
        result.push(item);
      }
    }
    
    return result;
  }

  /**
   * Clear the heap
   */
  clear(): void {
    this.heap = [];
  }
}
