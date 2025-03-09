'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostWithAuthor } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from '../components/error-boundary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function PostCard({ post }: { post: PostWithAuthor }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <Avatar className="cursor-pointer ring-2 ring-indigo-500 ring-offset-2">
            <AvatarImage src={post.author_avatar || ''} />
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              {(post.author_email || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl text-indigo-600 hover:text-purple-600 transition-colors">
              {post.title}
            </CardTitle>
            <div className="flex justify-between text-sm text-gray-500">
              <span>By {post.author_username || post.author_email || 'Unknown User'}</span>
              <time dateTime={post.created_at} className="text-gray-400">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </time>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {post.image_url && (
          <div className="space-y-2">
            <div 
              className={`relative w-full rounded-lg overflow-hidden bg-gray-100 transition-all duration-200 ${
                isExpanded ? "aspect-auto h-[600px]" : "aspect-video"
              }`}
            >
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                priority
                className="object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2 bg-white/80 hover:bg-white shadow-lg"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Shrink" : "Expand"}
              </Button>
            </div>
          </div>
        )}
        <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
          {post.content}
        </p>
      </CardContent>
    </Card>
  );
}

function PostsList() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const supabase = createClientComponentClient<Database>();

  // Fetch posts and authors
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.rpc('get_posts_with_authors');
        if (error) throw error;
        setPosts(data as PostWithAuthor[]);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [supabase]);

  // Filter posts based on search terms
  const filteredPosts = posts.filter(post => {
    const matchesContentSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAuthorSearch = authorSearch === '' || 
      (post.author_username?.toLowerCase().includes(authorSearch.toLowerCase()) ?? false) ||
      post.author_email.toLowerCase().includes(authorSearch.toLowerCase());

    return matchesContentSearch && matchesAuthorSearch;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading posts...
        </CardContent>
      </Card>
    );
  }

  if (!posts?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No blog posts yet. Be the first to share your thoughts!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Recent Blog Posts</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover interesting stories and share your thoughts with the community.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search post content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-purple-500"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Search by author..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-purple-500"
                />
              </div>
              {(searchTerm || authorSearch) && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchTerm('');
                    setAuthorSearch('');
                  }}
                  className="hover:bg-indigo-50 text-indigo-600"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card className="bg-white shadow-lg">
              <CardContent className="py-12 text-center text-gray-500">
                No posts found matching your filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Recent Blog Posts</h1>
      <ErrorBoundary fallback={
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Error loading blog posts. Please try again later.
          </CardContent>
        </Card>
      }>
        <Suspense fallback={
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading posts...
            </CardContent>
          </Card>
        }>
          <PostsList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}