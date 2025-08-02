'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiLoader, FiAlertCircle, FiUser, FiFileText, FiDownload, FiTag, FiCalendar, FiEye, FiArrowLeft } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function ResearchPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const { user, isLoading: authLoading } = useAuthStore();
  const { data: post, isLoading: loading, error: queryError } = api.project.getById.useQuery(
    { id: postId },
    { enabled: !authLoading && !!postId }
  );

  const error = queryError?.message || null;

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
      <PageContainer title="Loading Post..." className="bg-bg-primary min-h-screen text-text-primary flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-accent-purple text-6xl mb-4" />
          <p className="text-xl text-neutral-400">Loading research post...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-bg-primary min-h-screen text-text-primary flex items-center justify-center p-6">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl text-center max-w-md">
          <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-heading text-neutral-100 mb-2">Oops! Something went wrong.</h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/discover')}
          >
            Back to Discover
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!post) {
    return (
      <PageContainer title="Post Not Found" className="bg-bg-primary min-h-screen text-text-primary flex items-center justify-center p-6">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl text-center">
          <FiAlertCircle className="mx-auto text-neutral-500 text-5xl mb-4" />
          <h2 className="text-2xl font-heading text-neutral-100">Post Not Found</h2>
          <p className="text-neutral-400 mb-6">The research post you are looking for does not exist or could not be loaded.</p>
          <Button variant="secondary" onClick={() => router.push('/discover')}>
            Back to Discover
          </Button>
        </div>
      </PageContainer>
    );
  }

  const author = post.profiles;
  const postDate = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';

  return (
    <PageContainer title={post.title || "Research Post"} className="bg-bg-primary min-h-screen text-text-primary">
      <div className="absolute top-20 left-6 z-10"> {/* Adjusted top to avoid header overlap, may need tweaking */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-400 hover:text-accent-purple hover:bg-neutral-800 p-2 rounded-full">
          <FiArrowLeft size={24} />
        </Button>
      </div>
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:py-20">
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl mb-8 overflow-hidden">
          <CardHeader className="pt-8 pb-6 text-center border-b border-neutral-700">
            <FiFileText className="text-5xl text-accent-purple mx-auto mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-heading text-neutral-100 tracking-tight">
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
              <CardContent className="p-6 md:p-8 prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 !leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
              </CardContent>
            </Card>

            {(post.tags && post.tags.length > 0) && (
              <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-neutral-100 flex items-center"><FiTag className="mr-2 text-accent-purple"/>Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-wrap gap-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="bg-accent-purple/20 text-accent-purple px-3 py-1.5 rounded-full text-xs sm:text-sm font-sans shadow-sm">
                      {tag}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

            {(post.project_files && post.project_files.length > 0) && (
              <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-neutral-100 flex items-center"><FiDownload className="mr-2 text-accent-purple"/>Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {post.project_files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-700/70 transition-colors">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-accent-purple mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-100">{file.file_name}</p>
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
                        fallback={`${author.first_name?.[0] || ''}${author.last_name?.[0] || ''}`}
                        alt={`${author.first_name} ${author.last_name}`}
                        className="w-24 h-24 text-3xl mb-3 border-2 border-neutral-700 shadow-lg"
                    />
                  <CardTitle className="text-xl font-heading text-neutral-100 truncate max-w-full">{`${author.first_name || ''} ${author.last_name || ''}`.trim() || "Author"}</CardTitle>
                  {author.institution && <CardDescription className="text-neutral-400 mt-1">{author.institution}</CardDescription>}
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Link href={`/profile/${author.id}`} passHref>
                    <Button variant="primary" className="w-full">
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