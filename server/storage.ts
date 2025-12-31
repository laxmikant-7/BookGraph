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
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Programming",
    keywords: ["clean code", "software engineering", "best practices"],
    description: "A handbook of agile software craftsmanship."
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    genre: "Computer Science",
    keywords: ["algorithms", "data structures", "complexity"],
    description: "A comprehensive guide to algorithms."
  },
  {
    title: "Design Patterns",
    author: "Erich Gamma",
    genre: "Software Engineering",
    keywords: ["design patterns", "oop", "architecture"],
    description: "Reusable solutions to common software design problems."
  },
  {
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    genre: "Career",
    keywords: ["interview", "coding", "DSA"],
    description: "Preparation guide for coding interviews."
  },
  {
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    genre: "Programming",
    keywords: ["javascript", "web development"],
    description: "Deep dive into JavaScript concepts."
  },
  {
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    genre: "Programming",
    keywords: ["javascript", "coding", "logic"],
    description: "A modern introduction to programming."
  },
  {
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    genre: "Computer Science",
    keywords: ["os", "process", "memory"],
    description: "Fundamentals of operating systems."
  },
  {
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    genre: "Computer Science",
    keywords: ["networking", "protocols", "internet"],
    description: "Detailed concepts of computer networking."
  },
  {
    title: "Database System Concepts",
    author: "Henry F. Korth",
    genre: "Computer Science",
    keywords: ["dbms", "sql", "transactions"],
    description: "Core database management concepts."
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    genre: "Programming",
    keywords: ["coding", "career", "best practices"],
    description: "Practical advice for software developers."
  },

  {
    title: "Rework",
    author: "Jason Fried",
    genre: "Business",
    keywords: ["startup", "business", "simplicity"],
    description: "A fresh approach to running a business."
  },
  {
    title: "Hooked",
    author: "Nir Eyal",
    genre: "Product Design",
    keywords: ["psychology", "habits", "products"],
    description: "How habit-forming products are built."
  },
  {
    title: "The Millionaire Fastlane",
    author: "MJ DeMarco",
    genre: "Finance",
    keywords: ["wealth", "entrepreneurship"],
    description: "An alternative approach to wealth creation."
  },
  {
    title: "Can't Hurt Me",
    author: "David Goggins",
    genre: "Motivation",
    keywords: ["discipline", "mental toughness"],
    description: "Master your mind and defy the odds."
  },
  {
    title: "Make Your Bed",
    author: "William H. McRaven",
    genre: "Self-Help",
    keywords: ["discipline", "life lessons"],
    description: "Small habits that change your life."
  },
  {
    title: "Do Epic Shit",
    author: "Ankur Warikoo",
    genre: "Self-Help",
    keywords: ["growth", "mindset", "success"],
    description: "Unfiltered lessons on success and failure."
  },
  {
    title: "Wings of Fire",
    author: "A.P.J. Abdul Kalam",
    genre: "Autobiography",
    keywords: ["inspiration", "science", "india"],
    description: "The life journey of India's Missile Man."
  },
  {
    title: "India 2020",
    author: "A.P.J. Abdul Kalam",
    genre: "Visionary",
    keywords: ["development", "india", "future"],
    description: "A vision for India's future growth."
  },
  {
    title: "The Monk Who Sold His Ferrari",
    author: "Robin Sharma",
    genre: "Spiritual Fiction",
    keywords: ["life balance", "purpose"],
    description: "A fable about fulfilling your dreams."
  },
  {
    title: "Who Moved My Cheese?",
    author: "Spencer Johnson",
    genre: "Motivation",
    keywords: ["change", "adaptability"],
    description: "A simple story about dealing with change."
  },

  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    keywords: ["choices", "life", "regret"],
    description: "Exploring infinite versions of one life."
  },
  {
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    genre: "Magical Realism",
    keywords: ["surreal", "destiny"],
    description: "A mysterious and metaphysical journey."
  },
  {
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    genre: "Romance",
    keywords: ["love", "loss"],
    description: "A nostalgic story of love and memory."
  },
  {
    title: "The Road",
    author: "Cormac McCarthy",
    genre: "Post-Apocalyptic",
    keywords: ["survival", "hope"],
    description: "A father and son journey through ruin."
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Dystopian",
    keywords: ["technology", "control"],
    description: "A futuristic society driven by pleasure."
  },
  {
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    genre: "Dystopian",
    keywords: ["censorship", "books"],
    description: "A world where books are banned."
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    keywords: ["psychology", "mystery"],
    description: "A shocking psychological thriller."
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    genre: "Thriller",
    keywords: ["crime", "marriage"],
    description: "A dark mystery of a missing wife."
  },
  {
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    genre: "Crime",
    keywords: ["investigation", "thriller"],
    description: "A gripping crime investigation."
  },
  {
    title: "The Shining",
    author: "Stephen King",
    genre: "Horror",
    keywords: ["psychological", "isolation"],
    description: "A chilling story of madness and fear."
  },
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    genre: "Fable",
    keywords: ["life", "innocence", "wisdom"],
    description: "A poetic tale about life, love, and human nature."
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Science",
    keywords: ["cosmology", "universe", "physics"],
    description: "An overview of modern cosmology."
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    genre: "Science",
    keywords: ["space", "astronomy", "science"],
    description: "A journey through the universe and science."
  },
  {
    title: "The Theory of Everything",
    author: "Stephen Hawking",
    genre: "Science",
    keywords: ["physics", "time", "universe"],
    description: "Explains the origin and fate of the universe."
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    keywords: ["decision making", "bias", "thinking"],
    description: "How humans think and make decisions."
  },
  {
    title: "Drive",
    author: "Daniel H. Pink",
    genre: "Motivation",
    keywords: ["motivation", "psychology", "work"],
    description: "The science behind motivation."
  },
  {
    title: "Outliers",
    author: "Malcolm Gladwell",
    genre: "Non-Fiction",
    keywords: ["success", "opportunity", "culture"],
    description: "What makes high achievers different."
  },
  {
    title: "Blink",
    author: "Malcolm Gladwell",
    genre: "Psychology",
    keywords: ["intuition", "thinking"],
    description: "The power of thinking without thinking."
  },
  {
    title: "The Tipping Point",
    author: "Malcolm Gladwell",
    genre: "Sociology",
    keywords: ["trends", "society"],
    description: "How ideas spread like epidemics."
  },
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    genre: "Self-Help",
    keywords: ["habits", "behavior"],
    description: "Why habits exist and how to change them."
  },

  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    genre: "Biography",
    keywords: ["innovation", "apple", "leadership"],
    description: "The life of Apple’s co-founder."
  },
  {
    title: "Elon Musk",
    author: "Ashlee Vance",
    genre: "Biography",
    keywords: ["entrepreneurship", "technology"],
    description: "The story of a modern tech visionary."
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    genre: "Autobiography",
    keywords: ["inspiration", "leadership"],
    description: "A deeply personal memoir."
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    keywords: ["education", "resilience"],
    description: "A journey from survival to education."
  },
  {
    title: "Into the Wild",
    author: "Jon Krakauer",
    genre: "Adventure",
    keywords: ["freedom", "nature"],
    description: "A true story of survival and idealism."
  },
  {
    title: "The Call of the Wild",
    author: "Jack London",
    genre: "Adventure",
    keywords: ["nature", "survival"],
    description: "A dog’s journey into the wild."
  },
  {
    title: "Moby-Dick",
    author: "Herman Melville",
    genre: "Classic",
    keywords: ["obsession", "sea"],
    description: "A captain’s obsession with a white whale."
  },
  {
    title: "The Old Man and the Sea",
    author: "Ernest Hemingway",
    genre: "Classic",
    keywords: ["perseverance", "nature"],
    description: "A fisherman’s struggle against fate."
  },
  {
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    genre: "Philosophical Fiction",
    keywords: ["guilt", "morality"],
    description: "A psychological exploration of crime."
  },
  {
    title: "The Brothers Karamazov",
    author: "Fyodor Dostoevsky",
    genre: "Classic",
    keywords: ["faith", "family"],
    description: "A deep philosophical family drama."
  },

  {
    title: "The Stranger",
    author: "Albert Camus",
    genre: "Philosophy",
    keywords: ["absurdism", "existence"],
    description: "A story exploring the absurd nature of life."
  },
  {
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    genre: "Philosophy",
    keywords: ["existence", "values"],
    description: "A philosophical exploration of human values."
  },
  {
    title: "The Republic",
    author: "Plato",
    genre: "Philosophy",
    keywords: ["justice", "state"],
    description: "A foundational work of political philosophy."
  },
  {
    title: "Letters from a Stoic",
    author: "Seneca",
    genre: "Philosophy",
    keywords: ["stoicism", "life"],
    description: "Wisdom on living a virtuous life."
  },
  {
    title: "Siddhartha",
    author: "Hermann Hesse",
    genre: "Spiritual Fiction",
    keywords: ["enlightenment", "journey"],
    description: "A man’s search for spiritual fulfillment."
  },
  {
    title: "The Ramayana",
    author: "Valmiki",
    genre: "Epic",
    keywords: ["dharma", "devotion"],
    description: "An ancient Indian epic."
  },
  {
    title: "The Mahabharata",
    author: "Vyasa",
    genre: "Epic",
    keywords: ["duty", "war"],
    description: "A grand epic of duty and destiny."
  },
  {
    title: "Chanakya Neeti",
    author: "Chanakya",
    genre: "Strategy",
    keywords: ["politics", "wisdom"],
    description: "Ancient Indian political wisdom."
  },
  {
    title: "The Discovery of India",
    author: "Jawaharlal Nehru",
    genre: "History",
    keywords: ["india", "culture"],
    description: "India’s history through a personal lens."
  },
  {
    title: "Ignited Minds",
    author: "A.P.J. Abdul Kalam",
    genre: "Inspiration",
    keywords: ["youth", "dreams"],
    description: "Inspiring thoughts for young minds."
  },

  {
    title: "The Martian",
    author: "Andy Weir",
    genre: "Science Fiction",
    keywords: ["space", "survival"],
    description: "An astronaut stranded on Mars."
  },
  {
    title: "Ready Player One",
    author: "Ernest Cline",
    genre: "Sci-Fi",
    keywords: ["virtual reality", "gaming"],
    description: "A futuristic virtual adventure."
  },
  {
    title: "Foundation",
    author: "Isaac Asimov",
    genre: "Science Fiction",
    keywords: ["future", "civilization"],
    description: "The fall and rise of civilizations."
  },
  {
    title: "I, Robot",
    author: "Isaac Asimov",
    genre: "Science Fiction",
    keywords: ["robots", "AI"],
    description: "Stories about robots and ethics."
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    genre: "Cyberpunk",
    keywords: ["hacking", "AI"],
    description: "A foundational cyberpunk novel."
  },
  {
    title: "Snow Crash",
    author: "Neal Stephenson",
    genre: "Cyberpunk",
    keywords: ["metaverse", "technology"],
    description: "A fast-paced futuristic thriller."
  },
  {
    title: "The Hitchhiker’s Guide to the Galaxy",
    author: "Douglas Adams",
    genre: "Sci-Fi Comedy",
    keywords: ["humor", "space"],
    description: "A hilarious journey through space."
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "Fantasy",
    keywords: ["magic", "hero"],
    description: "The tale of a gifted young magician."
  },
  {
    title: "Mistborn",
    author: "Brandon Sanderson",
    genre: "Fantasy",
    keywords: ["magic system", "rebellion"],
    description: "A unique magic-driven fantasy world."
  },
  {
    title: "The Wheel of Time",
    author: "Robert Jordan",
    genre: "Fantasy",
    keywords: ["epic", "destiny"],
    description: "A massive epic fantasy saga."
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
