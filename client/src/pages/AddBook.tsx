import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertBookSchema, InsertBook } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Check, Plus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";

const genres = [
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Non-Fiction",
  "Biography",
  "History",
  "Philosophy",
];

const suggestedKeywords = [
  "adventure",
  "love",
  "mystery",
  "science",
  "technology",
  "history",
  "philosophy",
  "drama",
  "comedy",
  "thriller",
  "horror",
  "romance",
  "fantasy",
  "dystopia",
  "utopia",
  "war",
  "peace",
  "family",
  "friendship",
  "survival",
];

export default function AddBook() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [keywordInput, setKeywordInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<InsertBook>({
    resolver: zodResolver(insertBookSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      keywords: [],
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBook) => {
      const response = await apiRequest("POST", "/api/books", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      toast({
        title: "Book added successfully",
        description: "The book has been added to the library and connected to the recommendation graph.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBook) => {
    mutation.mutate(data);
  };

  const keywords = form.watch("keywords");

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      form.setValue("keywords", [...keywords, trimmed]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    form.setValue("keywords", keywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">Add New Book</h1>
          <p className="text-muted-foreground">
            Add a book to the library. It will automatically connect to related books in the recommendation graph.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Book Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter book title"
                            {...field}
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter author name"
                            {...field}
                            data-testid="input-author"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-genre">
                              <SelectValue placeholder="Select a genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genres.map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a brief description of the book"
                            className="resize-none"
                            rows={3}
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={() => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormDescription>
                          Add keywords that describe the book's themes and topics. These help create connections in the recommendation graph.
                        </FormDescription>
                        <div className="space-y-3">
                          <div className="flex gap-2 flex-wrap">
                            <Input
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyDown={handleKeywordKeyDown}
                              placeholder="Type a keyword and press Enter"
                              className="flex-1 min-w-[200px]"
                              data-testid="input-keyword"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => addKeyword(keywordInput)}
                              disabled={!keywordInput.trim()}
                              data-testid="button-add-keyword"
                            >
                              Add
                            </Button>
                          </div>
                          
                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {keywords.map((keyword) => (
                                <Badge
                                  key={keyword}
                                  variant="secondary"
                                  className="gap-1 pr-1"
                                >
                                  {keyword}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0"
                                    onClick={() => removeKeyword(keyword)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                              Suggested keywords:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {suggestedKeywords
                                .filter((k) => !keywords.includes(k))
                                .slice(0, 10)
                                .map((keyword) => (
                                  <Badge
                                    key={keyword}
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => addKeyword(keyword)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {keyword}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4 flex-wrap">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="flex-1 min-w-[150px] gap-2"
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : showSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added!
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Book
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="min-w-[100px]"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
