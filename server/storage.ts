/**
 * Storage Layer - In-Memory Storage with Graph Integration
 * 
 * Implements the IStorage interface for book CRUD operations
 * while maintaining the recommendation graph structure.
 * 
 * DATA STRUCTURES USED:
 * - HashMap (Map): O(1) book lookup by ID
 * - Graph: Adjacency list for book relationships
 * - Priority Queue: Used in recommendation engine
 */

import { Book, InsertBook, Recommendation } from "@shared/schema";
import { randomUUID } from "crypto";
import { BookGraph } from "./datastructures/Graph";
import { RecommendationEngine } from "./services/RecommendationEngine";

export interface IStorage {
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  deleteBook(id: string): Promise<boolean>;
  searchBooks(query: string): Promise<Book[]>;
  
  // Recommendation operations
  getRecommendations(bookId: string, limit?: number): Promise<Recommendation[]>;
}

/**
 * Initial sample books for the library
 * Preloaded to demonstrate the recommendation system immediately
 */
const INITIAL_BOOKS: InsertBook[] = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    keywords: ["american dream", "wealth", "love", "tragedy", "1920s"],
    description: "A story of decadence and excess, exploring the American Dream in the Jazz Age."
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    keywords: ["justice", "racism", "childhood", "morality", "southern"],
    description: "A profound exploration of racial injustice and moral growth in the American South."
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Science Fiction",
    keywords: ["dystopia", "surveillance", "totalitarianism", "freedom", "control"],
    description: "A dystopian masterpiece about a totalitarian regime that controls every aspect of life."
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Science Fiction",
    keywords: ["dystopia", "technology", "control", "freedom", "society"],
    description: "A vision of a future where humanity has engineered the perfect society."
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    keywords: ["adventure", "dragon", "treasure", "journey", "magic"],
    description: "A hobbit's unexpected journey through Middle-earth with a company of dwarves."
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    keywords: ["adventure", "quest", "magic", "friendship", "evil"],
    description: "An epic tale of the struggle against the Dark Lord Sauron."
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    keywords: ["love", "society", "class", "marriage", "family"],
    description: "A witty exploration of love, reputation, and class in Regency England."
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Bronte",
    genre: "Romance",
    keywords: ["love", "independence", "morality", "class", "gothic"],
    description: "The story of a strong-willed orphan who becomes a governess."
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    genre: "Thriller",
    keywords: ["mystery", "conspiracy", "religion", "art", "history"],
    description: "A thriller involving a murder in the Louvre and secret societies."
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    genre: "Thriller",
    keywords: ["mystery", "marriage", "deception", "psychological", "suspense"],
    description: "A psychological thriller about a marriage gone terribly wrong."
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    keywords: ["history", "humanity", "evolution", "society", "science"],
    description: "A brief history of humankind from the Stone Age to the present."
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Non-Fiction",
    keywords: ["science", "physics", "universe", "cosmology", "time"],
    description: "An exploration of the nature of time, black holes, and the universe."
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    keywords: ["adolescence", "identity", "alienation", "rebellion", "innocence"],
    description: "The story of a teenager's disillusionment with the adult world."
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    keywords: ["politics", "religion", "ecology", "power", "prophecy"],
    description: "An epic saga of politics, religion, and ecology on a desert planet."
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "Fantasy",
    keywords: ["magic", "music", "adventure", "legend", "mystery"],
    description: "The tale of a legendary figure recounting his extraordinary life."
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    keywords: ["justice", "racism", "morality", "law", "society"],
    description: "A powerful tale of racial injustice in the American South."
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    keywords: ["totalitarianism", "surveillance", "freedom", "control"],
    description: "A chilling vision of a controlled and monitored future."
  },
  {
    title: "Animal Farm",
    author: "George Orwell",
    genre: "Political Satire",
    keywords: ["power", "corruption", "revolution", "allegory"],
    description: "An allegory about power and political manipulation."
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    keywords: ["love", "class", "marriage", "society"],
    description: "A romantic novel centered on manners and marriage."
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    keywords: ["teenage angst", "identity", "alienation"],
    description: "A rebellious teen’s view of society and adulthood."
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    keywords: ["adventure", "dragons", "quest", "middle earth"],
    description: "A fantasy adventure leading to unexpected heroism."
  },
  {
    title: "Harry Potter and the Sorcerer’s Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    keywords: ["magic", "friendship", "school", "wizard"],
    description: "A young boy discovers he belongs to the magical world."
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    keywords: ["epic", "good vs evil", "ring", "quest"],
    description: "An epic battle between good and evil in Middle-earth."
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Philosophical Fiction",
    keywords: ["dreams", "destiny", "journey", "spirituality"],
    description: "A journey about following your dreams."
  },

  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    genre: "Self-Help",
    keywords: ["success", "mindset", "wealth", "motivation"],
    description: "Principles for achieving financial and personal success."
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    genre: "Finance",
    keywords: ["money", "investing", "assets", "education"],
    description: "A comparison of two views on money and wealth."
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    keywords: ["habits", "discipline", "productivity"],
    description: "Small habits that lead to big changes."
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Productivity",
    keywords: ["focus", "work", "concentration"],
    description: "Strategies for focused success in a distracted world."
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    genre: "Spirituality",
    keywords: ["mindfulness", "present", "peace"],
    description: "A guide to living in the present moment."
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Finance",
    keywords: ["behavior", "money", "wealth"],
    description: "How psychology influences financial decisions."
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    genre: "Business",
    keywords: ["startup", "innovation", "entrepreneurship"],
    description: "Notes on building unique and valuable startups."
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    genre: "Business",
    keywords: ["startup", "iteration", "growth"],
    description: "How modern startups can grow efficiently."
  },
  {
    title: "Ikigai",
    author: "Héctor García",
    genre: "Self-Help",
    keywords: ["purpose", "life", "happiness"],
    description: "Finding meaning and purpose in life."
  },
  {
    title: "Start With Why",
    author: "Simon Sinek",
    genre: "Leadership",
    keywords: ["leadership", "motivation", "vision"],
    description: "Understanding the importance of purpose."
  },

  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "History",
    keywords: ["human evolution", "civilization", "culture"],
    description: "A brief history of humankind."
  },
  {
    title: "Homo Deus",
    author: "Yuval Noah Harari",
    genre: "Future Studies",
    keywords: ["future", "technology", "AI"],
    description: "Speculation about humanity’s future."
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    genre: "History",
    keywords: ["civilization", "geography", "power"],
    description: "Factors behind global inequality."
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    genre: "Strategy",
    keywords: ["war", "strategy", "leadership"],
    description: "Ancient strategies for conflict and leadership."
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    genre: "Philosophy",
    keywords: ["stoicism", "self-control", "wisdom"],
    description: "Personal reflections on discipline and virtue."
  },
  {
    title: "Man’s Search for Meaning",
    author: "Viktor Frankl",
    genre: "Psychology",
    keywords: ["purpose", "suffering", "hope"],
    description: "Finding meaning even in suffering."
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    genre: "Self-Help",
    keywords: ["life", "values", "mindset"],
    description: "A counterintuitive approach to living well."
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    genre: "Self-Help",
    keywords: ["habits", "success", "leadership"],
    description: "Timeless principles for effectiveness."
  },
  {
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    genre: "Communication",
    keywords: ["relationships", "communication", "influence"],
    description: "Classic advice on human relations."
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    genre: "Drama",
    keywords: ["friendship", "guilt", "redemption"],
    description: "A story of friendship and redemption."
  },

  {
    title: "The Book Thief",
    author: "Markus Zusak",
    genre: "Historical Fiction",
    keywords: ["war", "books", "humanity"],
    description: "A girl finds solace in books during WWII."
  },
  {
    title: "Life of Pi",
    author: "Yann Martel",
    genre: "Adventure",
    keywords: ["faith", "survival", "sea"],
    description: "A boy survives at sea with a tiger."
  },
  {
    title: "The Fault in Our Stars",
    author: "John Green",
    genre: "Romance",
    keywords: ["love", "illness", "youth"],
    description: "A love story of two teenagers with cancer."
  },
  {
    title: "The Hunger Games",
    author: "Suzanne Collins",
    genre: "Dystopian",
    keywords: ["survival", "rebellion", "power"],
    description: "A deadly competition in a dystopian world."
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    keywords: ["politics", "desert", "power"],
    description: "A sci-fi epic of politics and prophecy."
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    genre: "Thriller",
    keywords: ["mystery", "symbols", "religion"],
    description: "A fast-paced mystery involving secret societies."
  },
  {
    title: "Sherlock Holmes: A Study in Scarlet",
    author: "Arthur Conan Doyle",
    genre: "Mystery",
    keywords: ["detective", "logic", "crime"],
    description: "The first appearance of Sherlock Holmes."
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    genre: "Horror",
    keywords: ["vampire", "fear", "gothic"],
    description: "A classic gothic vampire novel."
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    genre: "Horror",
    keywords: ["science", "creation", "ethics"],
    description: "A scientist creates a monstrous life."
  },
  {
    title: "The Odyssey",
    author: "Homer",
    genre: "Epic",
    keywords: ["journey", "hero", "mythology"],
    description: "An epic journey back home."
  }
];

export class MemStorage implements IStorage {
  private books: Map<string, Book>; // HashMap for O(1) lookup
  private graph: BookGraph;
  private recommendationEngine: RecommendationEngine;

  constructor() {
    this.books = new Map();
    this.graph = new BookGraph();
    this.recommendationEngine = new RecommendationEngine(this.graph, this.books);
    
    // Initialize with sample books
    this.initializeBooks();
  }

  /**
   * Load initial books and build the recommendation graph
   */
  private async initializeBooks(): Promise<void> {
    // First, create all books
    const createdBooks: Book[] = [];
    for (const bookData of INITIAL_BOOKS) {
      const id = randomUUID();
      const book: Book = { ...bookData, id };
      this.books.set(id, book);
      this.graph.addNode(id);
      createdBooks.push(book);
    }

    // Then, build connections between all books
    for (const book of createdBooks) {
      const otherBooks = createdBooks.filter(b => b.id !== book.id);
      this.recommendationEngine.connectBook(book, otherBooks);
    }

    console.log(`Initialized library with ${this.books.size} books`);
    console.log(`Graph has ${this.graph.getNodeCount()} nodes and ${this.graph.getEdgeCount()} edges`);
  }

  /**
   * Get all books in the library
   * Time: O(n)
   */
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  /**
   * Get a book by ID using HashMap
   * Time: O(1)
   */
  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  /**
   * Create a new book and connect it to the graph
   * Time: O(n * k) where n is number of books, k is keywords per book
   */
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = { ...insertBook, id };
    
    // Add to HashMap
    this.books.set(id, book);
    
    // Connect to graph with existing books
    const existingBooks = Array.from(this.books.values()).filter(b => b.id !== id);
    this.recommendationEngine.connectBook(book, existingBooks);
    
    console.log(`Added book: ${book.title} (${book.id})`);
    console.log(`Graph now has ${this.graph.getNodeCount()} nodes and ${this.graph.getEdgeCount()} edges`);
    
    return book;
  }

  /**
   * Delete a book and remove from graph
   * Time: O(V + E)
   */
  async deleteBook(id: string): Promise<boolean> {
    const book = this.books.get(id);
    if (!book) {
      return false;
    }
    
    // Remove from HashMap
    this.books.delete(id);
    
    // Remove from graph (cleans up all edges)
    this.graph.removeNode(id);
    
    console.log(`Deleted book: ${book.title} (${id})`);
    console.log(`Graph now has ${this.graph.getNodeCount()} nodes and ${this.graph.getEdgeCount()} edges`);
    
    return true;
  }

  /**
   * Search books by title, author, genre, or keywords
   * Time: O(n * k) where n is books, k is keywords
   */
  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.books.values()).filter(book => 
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.genre.toLowerCase().includes(lowerQuery) ||
      book.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get recommendations for a book using BFS + Priority Queue
   * Time: O(V + E + K log V)
   */
  async getRecommendations(bookId: string, limit: number = 5): Promise<Recommendation[]> {
    return this.recommendationEngine.getRecommendations(bookId, limit);
  }
}

export const storage = new MemStorage();
