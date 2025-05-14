'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getResearchPostById, type ResearchPostWithDetails, 
  getPostEngagement, type PostEngagementData, 
  addPostLike, removePostLike, 
  getPostComments, type PostCommentWithAuthor, addPostComment 
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar'; // Assuming Avatar component exists and handles null src
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiLoader, FiAlertCircle, FiUser, FiFileText, FiDownload, FiTag, FiCalendar, FiEye, FiMessageSquare, FiThumbsUp, FiHeart } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function ResearchPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const { user, isLoading: authLoading } = useAuthStore();
  const [post, setPost] = useState<ResearchPostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engagement, setEngagement] = useState<PostEngagementData | null>(null);
  const [comments, setComments] = useState<PostCommentWithAuthor[]>([]);
  const [interactionError, setInteractionError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (postId) {
      const fetchPageData = async () => {
        setLoading(true);
        setError(null);
        setInteractionError(null);
        try {
          const fetchedPost = await getResearchPostById(postId);
          if (fetchedPost) {
            setPost(fetchedPost);
            // Fetch engagement data and comments after post is fetched
            const engData = await getPostEngagement(postId, user?.id);
            setEngagement(engData);
            const fetchedComments = await getPostComments(postId);
            setComments(fetchedComments);
          } else {
            setError('Research post not found.');
          }
        } catch (err: any) {
          console.error('Error fetching research post page data:', err);
          setError(err.message || 'Failed to load research post.');
        }
        setLoading(false);
      };
      fetchPageData();
    } else {
      setError('Post ID is missing.');
      setLoading(false);
    }
  }, [postId, user?.id, authLoading]); // Added user.id to dependency array for engagement

  const handleFileDownload = (filePath: string, fileName: string) => {
    // This would typically involve getting a signed URL from Supabase storage
    // For simplicity, assuming filePath is a direct public URL or a path that can be constructed into one.
    // Example: supabase.storage.from('project_files').getPublicUrl(filePath)
    // Or if files are served via an API endpoint: router.push(`/api/download?path=${filePath}&name=${fileName}`);
    const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseStorageUrl && post?.project_files) {
        const fileDetail = post.project_files.find(f => f.file_path === filePath);
        if (fileDetail) {
            // Construct the public URL. Bucket name is 'project_files'
            // This is a common pattern but verify your bucket's public access and URL structure.
            const publicUrl = `${supabaseStorageUrl}/storage/v1/object/public/project_files/${filePath}`;
            
            // Create a temporary anchor element to trigger download
            const link = document.createElement('a');
            link.href = publicUrl;
            link.setAttribute('download', fileName || 'download'); // Or projectFile.file_name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
  };

  const handleLikeToggle = async () => {
    if (!user || !post || !engagement) {
      setInteractionError("Please log in to like posts.");
      return;
    }
    setInteractionError(null);
    try {
      if (engagement.currentUserHasLiked) {
        await removePostLike(post.id, user.id);
        setEngagement(prev => ({ 
          ...(prev!),
          likeCount: prev!.likeCount - 1, 
          currentUserHasLiked: false 
        }));
      } else {
        await addPostLike(post.id, user.id);
        setEngagement(prev => ({ 
          ...(prev!),
          likeCount: prev!.likeCount + 1, 
          currentUserHasLiked: true 
        }));
      }
    } catch (err: any) {
      console.error("Error toggling like:", err);
      setInteractionError(err.message || "Failed to update like.");
      // Optionally revert UI changes here if API call failed hard
    }
  };

  const handleAddComment = async (content: string) => {
    if (!user || !post) {
      setInteractionError("Please log in to comment.");
      return false;
    }
    if (!content.trim()) {
      setInteractionError("Comment cannot be empty.");
      return false;
    }
    setInteractionError(null);
    try {
      const newComment = await addPostComment(post.id, user.id, content);
      if (newComment) {
        setComments(prevComments => [...prevComments, newComment]);
        setEngagement(prev => ({...(prev!), commentCount: prev!.commentCount + 1 }));
        return true; // Indicate success
      }
      return false;
    } catch (err: any) {
      console.error("Error adding comment:", err);
      setInteractionError(err.message || "Failed to add comment.");
      return false;
    }
  };

  if (loading || authLoading) {
    return (
      <PageContainer title="Loading Post..." className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-researchbee-yellow text-6xl mb-4" />
          <p className="text-xl text-gray-300">Loading research post...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center max-w-md">
          <FiAlertCircle className="mx-auto text-red-400 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => router.push('/discover')} // Navigate to discover or try again
            className="bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black"
          >
            Back to Discover
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!post) {
    // This case should ideally be covered by the error state if post is not found
    // but as a fallback:
    return (
      <PageContainer title="Post Not Found" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center">
          <FiAlertCircle className="mx-auto text-gray-500 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-white">Post Not Found</h2>
          <p className="text-gray-300 mb-6">The research post you are looking for does not exist or could not be loaded.</p>
          <Button variant="primary" onClick={() => router.push('/discover')} className="bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black">
            Back to Discover
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Post found, render details
  const author = post.profiles;
  const postDate = post.created_at && !isNaN(new Date(post.created_at).getTime()) 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) 
    : 'some time ago';

  return (
    <PageContainer title={post.title || "Research Post"} className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:py-20">
        {/* Header Card for Title & Basic Meta */} 
        <Card className="glass-card shadow-xl mb-8 overflow-hidden">
          <CardHeader className="pt-8 pb-6 text-center border-b border-white/10">
            <FiFileText className="text-5xl text-researchbee-yellow mx-auto mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 tracking-tight">
              {post.title}
            </CardTitle>
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <FiCalendar className="mr-1.5" /> Published {postDate}
              </div>
              {post.visibility && (
                <div className="flex items-center capitalize">
                  <FiEye className="mr-1.5" /> {post.visibility}
                </div>
              )}
              {/* Display Like and Comment Counts */}
              {engagement && (
                <>
                  <div className="flex items-center">
                    <FiThumbsUp className="mr-1.5" /> {engagement.likeCount} Likes
                  </div>
                  <div className="flex items-center">
                    <FiMessageSquare className="mr-1.5" /> {engagement.commentCount} Comments
                  </div>
                </>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Content Area */} 
          <div className="md:col-span-8 space-y-6">
            <Card className="glass-card shadow-xl">
              <CardContent className="p-6 md:p-8 prose prose-invert prose-sm sm:prose-base max-w-none text-gray-200 !leading-relaxed">
                {/* Using prose classes for rich text styling if content is markdown/html, otherwise adjust */} 
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
              </CardContent>
            </Card>

            {/* Interaction Error Display */}
            {interactionError && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm">
                <p>{interactionError}</p>
              </div>
            )}

            {/* Like Button Placeholder */}
            {user && engagement && (
              <Card className="glass-card shadow-xl">
                <CardContent className="p-6">
                  <Button 
                    onClick={handleLikeToggle} 
                    variant={engagement.currentUserHasLiked ? 'primary' : 'outline'}
                    className={`w-full ${engagement.currentUserHasLiked ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'border-pink-500 text-pink-500 hover:bg-pink-500/10'}`}
                  >
                    <FiHeart className={`mr-2 ${engagement.currentUserHasLiked ? 'fill-current' : ''}`} />
                    {engagement.currentUserHasLiked ? 'Liked' : 'Like'} ({engagement.likeCount})
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comment Form Placeholder */}
            {user && (
              <Card className="glass-card shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Leave a Comment</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CommentFormComponent postId={post.id} onCommentAdded={handleAddComment} />
                </CardContent>
              </Card>
            )}

            {/* Comments List Placeholder */}
            <Card className="glass-card shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Comments ({engagement?.commentCount || 0})</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <CommentItemComponent key={comment.id} comment={comment} />
                  ))
                ) : (
                  <p className="text-neutral-400">No comments yet. Be the first to comment!</p>
                )}
              </CardContent>
            </Card>

            {/* Tags Section */} 
            {(post.tags && post.tags.length > 0) && (
              <Card className="glass-card shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white flex items-center"><FiTag className="mr-2 text-researchbee-yellow"/>Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-wrap gap-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="bg-researchbee-yellow/20 text-researchbee-yellow px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm border border-researchbee-yellow/30 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Files Section */} 
            {(post.project_files && post.project_files.length > 0) && (
              <Card className="glass-card shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white flex items-center"><FiDownload className="mr-2 text-researchbee-yellow"/>Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {post.project_files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-researchbee-yellow mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white">{file.file_name}</p>
                          <p className="text-xs text-gray-400">{(file.file_size / (1024*1024)).toFixed(2)} MB - {file.file_type}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileDownload(file.file_path, file.file_name)}
                        className="border-researchbee-yellow text-researchbee-yellow hover:bg-researchbee-yellow/10 flex-shrink-0"
                      >
                        <FiDownload className="mr-2 h-4 w-4"/> Download
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Author Sidebar */} 
          <div className="md:col-span-4 space-y-6">
            {author && (
              <Card className="glass-card shadow-xl sticky top-24">
                <CardHeader className="items-center text-center border-b border-white/10 pb-4">
                    <Avatar 
                        src={author.avatar_url || null} 
                        fallback={`${author.first_name?.[0] || ''}${author.last_name?.[0] || ''}`}
                        alt={`${author.first_name} ${author.last_name}`}
                        className="w-24 h-24 text-3xl mb-3 border-2 border-white/20 shadow-lg"
                    />
                  <CardTitle className="text-xl font-semibold text-white truncate max-w-full">{`${author.first_name || ''} ${author.last_name || ''}`.trim() || "Author"}</CardTitle>
                  {author.institution && <CardDescription className="text-gray-300 mt-1">{author.institution}</CardDescription>}
                </CardHeader>
                <CardContent className="p-6 text-center">
                  {/* Add link to profile page if it exists */} 
                  <Link href={`/profile/${author.id}`} passHref>
                    <Button variant="primary" className="w-full bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black">
                      <FiUser className="mr-2"/> View Profile
                    </Button>
                  </Link>
                  {/* Placeholder for future actions like 'Message Author' */}
                  {/* <Button variant="outline" className="w-full mt-3 border-researchbee-yellow text-researchbee-yellow hover:bg-researchbee-yellow/10">
                    <FiMessageSquare className="mr-2"/> Message Author
                  </Button> */}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
    </PageContainer>
  );