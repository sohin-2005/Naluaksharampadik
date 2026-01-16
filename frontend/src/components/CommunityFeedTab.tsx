
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Clock, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Post {
    id: string;
    user_id: string;
    user_name: string;
    subject: string;
    topic: string;
    description: string;
    resources: string;
    duration_minutes: number;
    likes_count: number;
    comments_count: number;
    created_at: string;
    liked_by_user?: boolean;
}

export function CommunityFeedTab() {
    const { userProfile } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState({
        subject: '',
        topic: '',
        description: '',
        resources: '',
        duration_minutes: 0
    });

    useEffect(() => {
        fetchPosts();

        // Subscribe to real-time changes on community_posts
        try {
            const subscription = supabase
                .channel('community_posts_channel')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'community_posts'
                    },
                    (payload) => {
                        console.log('🔄 Real-time update:', payload);
                        fetchPosts();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        } catch (error) {
            console.error('❌ Real-time subscription error:', error);
        }
    }, [userProfile?.id]);

    const fetchPosts = async () => {
        try {
            console.log('📥 Fetching community posts...');
            const { data, error } = await supabase
                .from('community_posts')
                .select(`
                    *,
                    user:user_id (full_name),
                    post_likes!left (user_id)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching posts:', error);
                throw error;
            }

            console.log('✅ Raw posts from Supabase:', data);
            console.log(`📊 Found ${data?.length || 0} posts`);

            const transformedPosts: Post[] = (data || []).map((post: any) => ({
                id: post.id,
                user_id: post.user_id,
                user_name: post.user?.full_name || 'Anonymous',
                subject: post.subject || '',
                topic: post.topic || '',
                description: post.description || '',
                resources: post.resources || '',
                duration_minutes: post.duration_minutes || 0,
                likes_count: post.likes_count || 0,
                comments_count: post.comments_count || 0,
                created_at: post.created_at,
                liked_by_user: post.post_likes?.some((like: any) => like.user_id === userProfile?.id)
            }));

            console.log('🎯 Transformed posts:', transformedPosts);
            setPosts(transformedPosts);
        } catch (error) {
            console.error('💥 Error fetching posts:', error);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('📝 Creating new post:', newPost);
            console.log('👤 User ID:', userProfile?.id);
            
            const { data, error } = await supabase
                .from('community_posts')
                .insert({
                    user_id: userProfile?.id,
                    content: `${newPost.subject} - ${newPost.topic}`,
                    subject: newPost.subject,
                    topic: newPost.topic,
                    description: newPost.description,
                    resources: newPost.resources,
                    duration_minutes: newPost.duration_minutes
                })
                .select();

            if (error) {
                console.error('❌ Supabase Error Code:', error.code);
                console.error('❌ Supabase Error Message:', error.message);
                console.error('❌ Full Error:', error);
                throw error;
            }

            console.log('✅ Post created successfully:', data);
            alert('✅ Post created! It will appear in the feed.');
            setNewPost({ subject: '', topic: '', description: '', resources: '', duration_minutes: 0 });
            setIsPosting(false);
            await fetchPosts();
        } catch (error) {
            console.error('💥 Error creating post:', error);
            console.error('💥 Error Details:', (error as any)?.message || error);
            alert('❌ Failed to create post. Check console for details.');
        }
    };

    const handleLike = async (postId: string, currentlyLiked: boolean) => {
        try {
            if (currentlyLiked) {
                // Unlike
                await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userProfile?.id);

                await supabase.rpc('decrement_post_likes', { post_id: postId });
            } else {
                // Like
                await supabase
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: userProfile?.id });

                await supabase.rpc('increment_post_likes', { post_id: postId });
            }

            fetchPosts();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Community Feed</h2>
                    <p className="text-gray-400">Share what you're learning and stay inspired</p>
                </div>
                {!isPosting && (
                    <Button
                        onClick={() => setIsPosting(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Create Post
                    </Button>
                )}
            </div>

            {isPosting && (
                <Card className="bg-neutral-900 border border-neutral-800">
                    <CardHeader>
                        <h3 className="font-semibold text-white">Share Your Learning</h3>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Subject (e.g., Data Structures)"
                                    value={newPost.subject}
                                    onChange={(e) => setNewPost({ ...newPost, subject: e.target.value })}
                                    required
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <div>
                                <Input
                                    placeholder="Topic (e.g., Binary Trees)"
                                    value={newPost.topic}
                                    onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                                    required
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <div>
                                <Textarea
                                    placeholder="What did you learn? What helped you?"
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                    required
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Input
                                    placeholder="Helpful resources (links, books, etc.)"
                                    value={newPost.resources}
                                    onChange={(e) => setNewPost({ ...newPost, resources: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    placeholder="Study duration (minutes)"
                                    value={newPost.duration_minutes || ''}
                                    onChange={(e) => setNewPost({ ...newPost, duration_minutes: parseInt(e.target.value) || 0 })}
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                                    Post
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsPosting(false);
                                        setNewPost({ subject: '', topic: '', description: '', resources: '', duration_minutes: 0 });
                                    }}
                                    className="border-neutral-700 text-gray-300"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {posts.length === 0 && !isPosting ? (
                <Card className="bg-neutral-900 border border-neutral-800">
                    <CardContent className="text-center py-12">
                        <p className="text-gray-400">Community is quiet right now. Be the first to post!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {posts.map(post => (
                        <Card key={post.id} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar>
                                    <AvatarFallback className="bg-indigo-600 text-white">
                                        {post.user_name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm text-white">{post.user_name}</span>
                                    <span className="text-xs text-gray-400">{getTimeAgo(post.created_at)}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-white">{post.topic}</h3>
                                        {post.duration_minutes > 0 && (
                                            <Badge variant="secondary" className="flex gap-1 items-center bg-neutral-800 text-gray-300">
                                                <Clock className="w-3 h-3" /> {post.duration_minutes}m
                                            </Badge>
                                        )}
                                    </div>
                                    {post.subject && (
                                        <p className="text-sm text-gray-400 bg-neutral-800 p-2 rounded-md">
                                            Subject: {post.subject}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-300">{post.description}</p>
                                {post.resources && (
                                    <div className="text-sm text-gray-400 bg-neutral-800/50 p-2 rounded">
                                        <strong>Resources:</strong> {post.resources}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-2 border-t border-neutral-800 mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-2 ${post.liked_by_user ? 'text-indigo-400' : 'text-gray-400'}`}
                                        onClick={() => handleLike(post.id, post.liked_by_user || false)}
                                    >
                                        <ThumbsUp className="w-4 h-4" /> {post.likes_count}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="gap-2 text-gray-400">
                                        <MessageSquare className="w-4 h-4" /> {post.comments_count}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
