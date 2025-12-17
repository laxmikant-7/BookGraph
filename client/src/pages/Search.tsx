import { useQuery } from "@tanstack/react-query";
import { Book, Recommendation } from "@shared/schema";
import { SearchBar } from "@/components/SearchBar";
import { BookCard } from "@/components/BookCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { RecommendationCardSkeleton } from "@/components/BookCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  ChevronRight, 
  GitBranch, 
  Search as SearchIcon, 
  Sparkles,
  User 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";

export default function Search() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const bookIdFromUrl = urlParams.get("bookId");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookIdFromUrl);

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Recommendation[]>({
    queryKey: ["/api/books", selectedBookId, "recommendations"],
    enabled: !!selectedBookId,
  });

  useEffect(() => {
    if (bookIdFromUrl) {
      setSelectedBookId(bookIdFromUrl);
    }
  }, [bookIdFromUrl]);

  const selectedBook = books?.find((b) => b.id === selectedBookId);

  const searchResults = books?.filter((book) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );
  });

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">Find Recommendations</h1>
          <p className="text-muted-foreground">
            Search for a book to discover related reads using our graph-based algorithm
          </p>
        </motion.div>

        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for a book to get recommendations..."
            autoFocus
          />
          
          <AnimatePresence>
            {searchQuery && searchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 max-w-2xl mx-auto"
              >
                <Card>
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {searchResults.slice(0, 5).map((book) => (
                        <Button
                          key={book.id}
                          variant="ghost"
                          className="w-full justify-start gap-3 h-auto py-3"
                          onClick={() => handleSelectBook(book.id)}
                          data-testid={`button-select-${book.id}`}
                        >
                          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium truncate">{book.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {book.author}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {book.genre}
                          </Badge>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {selectedBook ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Selected Book</h2>
                </div>
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold mb-1" data-testid="text-selected-title">
                          {selectedBook.title}
                        </h3>
                        <p className="text-muted-foreground flex items-center gap-1 mb-3">
                          <User className="h-4 w-4" />
                          {selectedBook.author}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{selectedBook.genre}</Badge>
                          {selectedBook.keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedBookId(null)}
                        data-testid="button-change-book"
                      >
                        Change Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-chart-2" />
                  <h2 className="text-xl font-semibold">Top 5 Recommendations</h2>
                  <Badge variant="secondary" className="gap-1">
                    <GitBranch className="h-3 w-3" />
                    BFS Depth: 2
                  </Badge>
                </div>

                {isLoadingRecommendations ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <RecommendationCardSkeleton key={i} />
                    ))}
                  </div>
                ) : recommendations && recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <RecommendationCard
                        key={rec.book.id}
                        recommendation={rec}
                        index={index}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Sparkles}
                    title="No recommendations found"
                    description="This book doesn't have enough connections in the graph yet. Try adding more books with similar genres or authors."
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={SearchIcon}
                title="Search for a book"
                description="Enter a book title, author, or genre above to discover personalized recommendations powered by graph traversal algorithms."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
