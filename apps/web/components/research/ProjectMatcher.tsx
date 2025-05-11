'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Database } from '@/lib/database.types'

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Extend ResearchPost to include the joined profiles data
interface ProjectWithProfile extends ResearchPost {
  profiles?: Partial<Profile> | null; // Profiles from the join
}

export function ProjectMatcher() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentProject, setCurrentProject] = useState<ProjectWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadNextProject = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { data: project, error: projectError } = await supabase
        .from('research_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url,
            title,
            institution
          )
        `)
        .neq('user_id', user.id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (projectError) {
        console.error('Error loading project:', projectError)
        setError('Failed to load next project')
        return
      }

      setCurrentProject(project)
    } catch (err) {
      console.error('Error in loadNextProject:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const handleMatch = async () => {
    if (!user || !currentProject) return

    try {
      const { error: matchError } = await supabase
        .from('profile_matches')
        .insert({
          matcher_user_id: user.id,
          matchee_user_id: currentProject.user_id,
          status: 'matched'
        })

      if (matchError) {
        console.error('Error creating match:', matchError)
        setError('Failed to create match')
        return
      }

      // Load next project after successful match
      await loadNextProject()
    } catch (err) {
      console.error('Error in handleMatch:', err)
      setError('Failed to create match')
    }
  }

  const handleSkip = async () => {
    await loadNextProject()
  }

  useEffect(() => {
    loadNextProject()
  }, [loadNextProject])

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadNextProject}>Try Again</Button>
        </div>
      </Card>
    )
  }

  if (isLoading || !currentProject) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{currentProject.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{currentProject.content}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <p className="font-medium">
              {currentProject.profiles?.first_name} {currentProject.profiles?.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {currentProject.profiles?.title} at {currentProject.profiles?.institution}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleMatch}>
            Connect
          </Button>
        </div>
      </div>
    </Card>
  )
} 