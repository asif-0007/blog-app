"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import { Post, Profile, User } from "@/lib/types";
import { SignOutButton } from "@/components/sign-out-button";
import { NavButtons } from "@/components/nav-buttons";
import { EditPostDialog } from "@/components/edit-post-dialog";

interface CreatePostFormProps {
  onSubmit: (data: { title: string; content: string; imageFile: File | null }) => Promise<void>;
  loading: boolean;
}

function CreatePostForm({ onSubmit, loading }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, content, imageFile });
    setTitle("");
    setContent("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
        <CardDescription>Share your thoughts with the world</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none text-gray-300">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              required
              className="bg-black/50 border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium leading-none text-gray-300">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="min-h-[200px] bg-black/50 border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium leading-none text-gray-300">
              Image (optional)
            </label>
            <div className="space-y-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-black/50 border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 file:bg-indigo-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-indigo-600 transition-all"
              />
              {imagePreview && (
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white transition-all duration-200" 
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch user profile data including avatar
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProfile();
  }, [session, supabase]);

  // Check session and fetch posts
  useEffect(() => {
    const checkSessionAndFetchPosts = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          window.location.href = '/login';
          return;
        }

        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("author_id", currentSession.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    checkSessionAndFetchPosts();
  }, [supabase, toast]);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Refetch posts after deletion
      const { data: newPosts, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(newPosts || []);

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditPost = async (postId: number, data: { title: string; content: string; imageFile: File | null }) => {
    try {
      let imageUrl = null;
      if (data.imageFile) {
        imageUrl = await uploadImage(data.imageFile, 'post-images');
      }

      const { error } = await supabase
        .from("posts")
        .update({
          title: data.title,
          content: data.content,
          ...(imageUrl && { image_url: imageUrl }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) throw error;

      // Refetch posts to update the list
      const { data: newPosts, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(newPosts || []);

      toast({
        title: "Success",
        description: "Post updated successfully!",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${session?.user.id}-${Date.now()}.${fileExt}`;
    
    console.log('Uploading image:', { fileName, bucket });
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Uploaded image URL:', publicUrl);
    return publicUrl;
  };

  const handleCreatePost = async (data: { title: string; content: string; imageFile: File | null }) => {
    setLoading(true);

    try {
      let imageUrl = null;
      if (data.imageFile) {
        imageUrl = await uploadImage(data.imageFile, 'post-images');
      }

      const { error } = await supabase.from("posts").insert({
        title: data.title,
        content: data.content,
        author_id: session?.user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your post has been published!",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      
      let newAvatarUrl = null;
      if (avatarFile) {
        newAvatarUrl = await uploadImage(avatarFile, 'avatars');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session?.user.id,
          avatar_url: newAvatarUrl,
          username: session?.user.email?.split('@')[0],
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</h1>

      <Card className="border-0 bg-black/40 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-gray-200">Profile Settings</CardTitle>
          <CardDescription className="text-gray-400">Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-black">
                <AvatarImage 
                  src={avatarUrl || session?.user?.user_metadata?.avatar_url || ''} 
                  alt="Profile"
                />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {session?.user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="bg-black/50 border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 file:bg-indigo-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-indigo-600 transition-all"
                />
                <Button 
                  onClick={updateProfile}
                  disabled={!avatarFile || loading}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white transition-all duration-200"
                >
                  Update Profile Picture
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-black/40 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-gray-200">Create New Post</CardTitle>
          <CardDescription className="text-gray-400">Share your thoughts with the world</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePostForm onSubmit={handleCreatePost} loading={loading} />
        </CardContent>
      </Card>

      <Card className="border-0 bg-black/40 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-gray-200">My Posts</CardTitle>
          <CardDescription className="text-gray-400">Manage your published posts</CardDescription>
        </CardHeader>
        <CardContent>
          <MyPosts posts={posts} onDelete={handleDelete} onEdit={handleEditPost} />
        </CardContent>
      </Card>
    </div>
  );
}

interface MyPostsProps {
  posts: Post[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (postId: number, data: { title: string; content: string; imageFile: File | null }) => Promise<void>;
}

function MyPosts({ posts, onDelete, onEdit }: MyPostsProps) {
  if (!posts.length) {
    return (
      <p className="text-center text-gray-400 py-4">
        You haven't published any posts yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="border border-gray-800 bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-gray-200">{post.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <EditPostDialog 
                  post={post} 
                  onSave={onEdit}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm"
                >
                  Delete
                </Button>
              </div>
            </div>
            <time className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at))} ago
            </time>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {post.image_url && (
                <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="line-clamp-3 text-gray-400">
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}