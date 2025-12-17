import { useQuery, useMutation } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { BookCard } from "@/components/BookCard";
import { BookCardSkeleton } from "@/components/BookCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { BookOpen, Library, Plus, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Book deleted",
        description: "The book has been removed from the library.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    if (!searchQuery.trim()) return books;
    
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query) ||
        book.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [books, searchQuery]);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70">
                <Library className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">
              Discover Your Next Great Read
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by graph-based algorithms, BookGraph finds personalized book recommendations 
              based on genres, authors, and reading patterns.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, author, genre, or keyword..."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-4 justify-center mb-8 flex-wrap"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>BFS Traversal</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <span>Priority Queue Ranking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 text-chart-3" />
              <span>Graph-Based Recommendations</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="text-2xl font-semibold">Library Collection</h2>
            <Link href="/add">
              <Button className="gap-2" data-testid="button-add-book">
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            searchQuery ? (
              <EmptyState
                icon={BookOpen}
                title="No books found"
                description={`No books match "${searchQuery}". Try a different search term.`}
                action={
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Library}
                title="Your library is empty"
                description="Start building your book collection by adding your first book."
                action={
                  <Link href="/add">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Book
                    </Button>
                  </Link>
                }
              />
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
