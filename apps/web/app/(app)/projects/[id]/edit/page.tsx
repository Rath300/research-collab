'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/trpc';
import { useRouter, notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FiLoader } from 'react-icons/fi';
import { Textarea } from '@/components/ui/Textarea';

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

const updateProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter();
  const projectId = params.id;

  const { data: project, isLoading: isProjectLoading } = api.project.getById.useQuery({ id: projectId });
  const updateMutation = api.project.update.useMutation({
    onSuccess: () => {
      router.push(`/projects/${projectId}`);
      // Optionally, invalidate queries to refetch data
      // utils.project.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      // TODO: Implement user-friendly error notifications
      console.error('Failed to update project:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (project) {
      // Ensure the user has permission to edit
      if (project.role !== 'owner' && project.role !== 'editor') {
        // Redirect if they don't have access.
        // Or show a "forbidden" message.
        router.replace('/dashboard');
      }
      reset({
        title: project.title,
        content: project.content,
      });
    }
  }, [project, reset, router]);

  const onSubmit = (data: UpdateProjectFormValues) => {
    updateMutation.mutate({ id: projectId, ...data });
  };

  if (isProjectLoading) {
    return (
      <PageContainer title="Loading...">
        <div className="flex justify-center items-center p-8">
          <FiLoader className="animate-spin text-accent-purple text-3xl" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <PageContainer title={`Edit ${project.title}`}>
      <div className="max-w-2xl mx-auto">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Project</CardTitle>
            <CardDescription>Update the details for your research project.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">Title</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => <Input id="title" {...field} className="w-full" />}
                />
                {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-neutral-300 mb-2">Content / Abstract</label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => <Textarea id="content" {...field} rows={8} className="w-full" />}
                />
                {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content.message}</p>}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <FiLoader className="animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 