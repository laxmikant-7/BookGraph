import { Recommendation } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Link as LinkIcon, Star, User, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
  rank: number;
}

const relationshipLabels: Record<string, { label: string; icon: typeof Star }> = {
  same_genre: { label: "Same Genre", icon: BookOpen },
  same_author: { label: "Same Author", icon: User },
  similar_keywords: { label: "Similar Topics", icon: LinkIcon },
  borrowed_together: { label: "Often Read Together", icon: Zap },
};

// Maximum possible score matches server-side calculation
// Genre(3) + Author(5) + Keywords(5*1) + BorrowedTogether(2) + EdgeWeight(~10 max)
const MAX_POSSIBLE_SCORE = 25;

export function RecommendationCard({ recommendation, index = 0, rank }: RecommendationCardProps) {
  const { book, score, relationshipTypes, depth } = recommendation;
  
  const scorePercentage = Math.min(Math.round((score / MAX_POSSIBLE_SCORE) * 100), 100);
  
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="hover-elevate overflow-visible" data-testid={`card-recommendation-${book.id}`}>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg">
                #{rank}
              </div>
              {depth === 1 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-chart-2 text-white">
                  <Star className="h-3 w-3" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg leading-tight" data-testid={`text-rec-title-${book.id}`}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span data-testid={`text-rec-author-${book.id}`}>{book.author}</span>
                  </p>
                </div>
                <Badge className={genreColor}>
                  {book.genre}
                </Badge>
              </div>
              
              {book.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {book.description}
                </p>
              )}
              
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Match Score</span>
                  <span className="font-medium">{scorePercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercentage}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Why recommended:
                </span>
                {relationshipTypes.map((type) => {
                  const info = relationshipLabels[type];
                  if (!info) return null;
                  const Icon = info.icon;
                  return (
                    <Badge key={type} variant="outline" className="gap-1 text-xs">
                      <Icon className="h-3 w-3" />
                      {info.label}
                    </Badge>
                  );
                })}
                {depth === 2 && (
                  <Badge variant="secondary" className="text-xs">
                    Secondary Connection
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
