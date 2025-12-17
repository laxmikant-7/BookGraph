import { Book } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Trash2, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface BookCardProps {
  book: Book;
  onDelete?: (id: string) => void;
  index?: number;
}

export function BookCard({ book, onDelete, index = 0 }: BookCardProps) {
  const genreColors: Record<string, string> = {
    Fiction: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Science Fiction": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Fantasy: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    Mystery: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Romance: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    Thriller: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    "Non-Fiction": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Biography: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    History: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Philosophy: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  };

  const genreColor = genreColors[book.genre] || "bg-muted text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover-elevate group" data-testid={`card-book-${book.id}`}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg leading-tight truncate" data-testid={`text-title-${book.id}`}>
                  {book.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate" data-testid={`text-author-${book.id}`}>{book.author}</span>
                </div>
              </div>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(book.id)}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid={`button-delete-${book.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={genreColor} data-testid={`badge-genre-${book.id}`}>
              {book.genre}
            </Badge>
          </div>
          
          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-auto">
            {book.keywords.slice(0, 3).map((keyword) => (
              <Badge 
                key={keyword} 
                variant="outline" 
                className="text-xs"
              >
                {keyword}
              </Badge>
            ))}
            {book.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{book.keywords.length - 3}
              </Badge>
            )}
          </div>
          
          <Link href={`/search?bookId=${book.id}`}>
            <Button variant="default" className="w-full gap-2" data-testid={`button-recommend-${book.id}`}>
              <Sparkles className="h-4 w-4" />
              Get Recommendations
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
