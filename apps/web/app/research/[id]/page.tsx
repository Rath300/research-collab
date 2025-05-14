'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getResearchPostById, 
  type ResearchPostWithDetails,
  addLike,
  removeLike,
  addComment,
  type CommentWithProfile
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { getBrowserClient } from '@/lib/supabaseClient';
import { 
  FiLoader, 
  FiAlertCircle, 
  FiUser, 
  FiFileText, 
  FiDownload, 
  FiTag, 
  FiCalendar, 
  FiEye, 
  FiMessageSquare,
  FiHeart,
  FiSend
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { type Database } from '@/lib/database.types';

export default function ResearchPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const { user, isLoading: authLoading } = useAuthStore();
  const [post, setPost] = useState<ResearchPostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);

  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentPending, setIsCommentPending] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    if (!postId) {
      setError('Post ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedPost = await getResearchPostById(postId);
      if (fetchedPost) {
        setPost(fetchedPost);
        setLikesCount(fetchedPost.engagement_count || 0);
        if (user) {
          const supabase = getBrowserClient();
          const { data: likeData, error: likeError } = await supabase
            .from('post_likes')
            .select('user_id')
            .eq('post_id', postId);

          if (likeError) console.error("Error fetching initial likes:", likeError);
          else {
            setLikesCount(likeData?.length || 0);
            if (likeData?.some((like: { user_id: string }) => like.user_id === user.id)) {
              setHasLiked(true);
            }
          }

          const { data: commentsData, error: commentsError } = await supabase
            .from('post_comments')
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles (id, first_name, last_name, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
          
          if (commentsError) console.error("Error fetching initial comments:", commentsError);
          else {
            type CommentWithRawProfile = Database['public']['Tables']['post_comments']['Row'] & {
              profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
            };

            let transformedComments: CommentWithProfile[] = (commentsData as CommentWithRawProfile[] || []).map((c: CommentWithRawProfile) => ({
              id: c.id,
              content: c.content,
              created_at: c.created_at ? new Date(c.created_at) : new Date(),
              user_id: c.user_id,
              profiles: c.profiles ? {
                id: c.profiles.id,
                first_name: c.profiles.first_name,
                last_name: c.profiles.last_name,
                avatar_url: c.profiles.avatar_url,
              } : null
            }));
            setComments(transformedComments);
          }
        }
      } else {
        setError('Research post not found.');
      }
    } catch (err: any) {
      console.error('Error fetching research post:', err);
      setError(err.message || 'Failed to load research post.');
    }
    setLoading(false);
  }, [postId, user]);

  useEffect(() => {
    if (authLoading) return;
    fetchPostDetails();
  }, [postId, authLoading, fetchPostDetails]);

  const handleLikeToggle = async () => {
    if (!user || !post || isLikePending) return;
    setIsLikePending(true);
    try {
      if (hasLiked) {
        await removeLike(post.id);
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await addLike(post.id);
        setHasLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
    setIsLikePending(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !newComment.trim() || isCommentPending) return;
    setIsCommentPending(true);
    try {
      const addedComment = await addComment(post.id, newComment.trim());
      if (addedComment) {
        setComments(prevComments => [...prevComments, addedComment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
    setIsCommentPending(false);
  };

  const handleFileDownload = (filePath: string, fileName: string) => {
    const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseStorageUrl && post?.project_files) {
        const fileDetail = post.project_files.find(f => f.file_path === filePath);
        if (fileDetail) {
            const publicUrl = `${supabaseStorageUrl}/storage/v1/object/public/project_files/${filePath}`;
            const link = document.createElement('a');
            link.href = publicUrl;
            link.setAttribute('download', fileName || 'download');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
  };

  if (loading || authLoading) {
    return (
      <PageContainer title="Loading Post..." className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-accent-purple text-6xl mb-4" />
          <p className="text-xl text-gray-300">Loading research post...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center max-w-md bg-neutral-900/70 backdrop-blur-md border border-neutral-700">
          <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => router.push('/discover')}
            className="bg-accent-purple hover:bg-accent-purple-hover text-white"
          >
            Back to Discover
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!post) {
    return (
      <PageContainer title="Post Not Found" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center bg-neutral-900/70 backdrop-blur-md border border-neutral-700">
          <FiAlertCircle className="mx-auto text-neutral-500 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-white">Post Not Found</h2>
          <p className="text-gray-300 mb-6">The research post you are looking for does not exist or could not be loaded.</p>
          <Button variant="primary" onClick={() => router.push('/discover')} className="bg-accent-purple hover:bg-accent-purple-hover text-white">
            Back to Discover
          </Button>
        </div>
      </PageContainer>
    );
  }

  const author = post.profiles;
  const postDate = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';

  return (
    <PageContainer title={post.title || "Research Post"} className="bg-black min-h-screen text-white">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:py-20">
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl mb-8 overflow-hidden">
          <CardHeader className="pt-8 pb-6 text-center border-b border-neutral-700">
            <FiFileText className="text-5xl text-accent-purple mx-auto mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 tracking-tight">
              {post.title}
            </CardTitle>
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-neutral-400">
              <div className="flex items-center">
                <FiCalendar className="mr-1.5" /> Published {postDate}
              </div>
              {post.visibility && (
                <div className="flex items-center capitalize">
                  <FiEye className="mr-1.5" /> {post.visibility}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
              <CardContent className="p-6 md:p-8 prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 !leading-relaxed font-sans">
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                <CardContent className="p-4 md:p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={handleLikeToggle}
                            disabled={isLikePending || !user}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                                hasLiked ? 'text-pink-500 hover:bg-pink-500/10' : 'text-neutral-400 hover:text-pink-500 hover:bg-pink-500/10'
                            }`}
                        >
                            <FiHeart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
                            <span className="font-medium text-sm">{likesCount}</span>
                        </Button>
                        <div className="flex items-center space-x-2 text-neutral-400">
                            <FiMessageSquare className="h-5 w-5" />
                            <span className="font-medium text-sm">{comments.length}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {user && (
                <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-heading text-white flex items-center">
                            <FiMessageSquare className="mr-2 text-accent-purple"/>Leave a Comment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write your comment..."
                                rows={3}
                                className="bg-neutral-800 border-neutral-700 focus:ring-accent-purple focus:border-accent-purple text-neutral-200"
                                disabled={isCommentPending}
                            />
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="bg-accent-purple hover:bg-accent-purple-hover text-white flex items-center"
                                disabled={isCommentPending || !newComment.trim()}
                            >
                                {isCommentPending ? <FiLoader className="animate-spin mr-2"/> : <FiSend className="mr-2"/>}
                                Submit Comment
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {(comments && comments.length > 0) && (
              <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-white flex items-center"><FiMessageSquare className="mr-2 text-accent-purple"/>Comments ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                      <Avatar 
                        src={comment.profiles?.avatar_url || null} 
                        fallback={`${comment.profiles?.first_name?.[0] || ''}${comment.profiles?.last_name?.[0] || 'U'}`}
                        alt={comment.profiles ? `${comment.profiles.first_name} ${comment.profiles.last_name}` : 'User'}
                        className="w-10 h-10 text-sm mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-semibold text-neutral-200">
                            {comment.profiles ? `${comment.profiles.first_name} ${comment.profiles.last_name}`.trim() : 'Anonymous User'}
                           </span>
                           <span className="text-xs text-neutral-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                           </span>
                        </div>
                        <p className="text-sm text-neutral-300 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {(post.tags && post.tags.length > 0) && (
              <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-white flex items-center"><FiTag className="mr-2 text-accent-purple"/>Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-wrap gap-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="bg-accent-purple/20 text-accent-purple px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm border border-accent-purple/30 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

            {(post.project_files && post.project_files.length > 0) && (
              <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-white flex items-center"><FiDownload className="mr-2 text-accent-purple"/>Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {post.project_files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/60 transition-colors">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-accent-purple mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white">{file.file_name}</p>
                          <p className="text-xs text-neutral-400">{(file.file_size / (1024*1024)).toFixed(2)} MB - {file.file_type}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileDownload(file.file_path, file.file_name)}
                        className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 flex-shrink-0"
                      >
                        <FiDownload className="mr-2 h-4 w-4"/> Download
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-4 space-y-6">
            {author && (
              <Card className="bg-neutral-900 border border-neutral-800 shadow-xl sticky top-24">
                <CardHeader className="items-center text-center border-b border-neutral-700 pb-4">
                    <Avatar 
                        src={author.avatar_url || null} 
                        fallback={`${author.first_name?.[0] || ''}${author.last_name?.[0] || ''}`.toUpperCase() || <FiUser size={30}/>}
                        alt={`${author.first_name} ${author.last_name}`}
                        className="w-24 h-24 text-3xl mb-3 border-2 border-neutral-700 shadow-lg"
                    />
                  <CardTitle className="text-xl font-heading text-white truncate max-w-full">{`${author.first_name || ''} ${author.last_name || ''}`.trim() || "Author"}</CardTitle>
                  {author.institution && <CardDescription className="text-neutral-400 mt-1">{author.institution}</CardDescription>}
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Link href={`/profile/${author.id}`} passHref>
                    <Button variant="primary" className="w-full bg-accent-purple hover:bg-accent-purple-hover text-white">
                      <FiUser className="mr-2"/> View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
    </PageContainer>
  );
} 