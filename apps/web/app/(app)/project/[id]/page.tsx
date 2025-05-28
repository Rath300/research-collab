'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Link component is not used directly in this version, router.push is used.
// import Link from 'next/link'; 
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Beaker,
  Calendar,
  Edit,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Share,
  Video,
  Users,
  ClipboardList,
  BarChart2,
  Activity as ActivityIcon, // Renamed to avoid conflict with React.Activity
  User as FiUser, // Added FiUser here for default avatar fallback
} from 'lucide-react';

// Assuming your custom Tamagui components are correctly exported from here
import { Button, type ButtonProps } from '@/components/ui/Button'; // Corrected casing, imported ButtonProps
import { PageContainer } from '@/components/layout/PageContainer'; 
import { Avatar } from '@/components/ui/Avatar'; // Using custom Avatar, no AvatarImage/Fallback children
// import { Progress } from '@/components/ui/progress'; // Assuming this might not exist or needs specific props
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'; // Corrected casing

import { 
  Heading, 
  Paragraph, 
  XStack, 
  YStack, 
  Tabs, 
  Text, 
  Separator, 
  Popover,
  Spinner,
  Progress, // Using Tamagui's own Progress
  Theme,
  useTheme,
  ScrollView, // Added ScrollView for potentially long content
} from 'tamagui';
// Tabs.Content, Tabs.List, Tabs.Trigger are typically used as properties of Tabs
// e.g. <Tabs.List><Tabs.Trigger /></Tabs.List> <Tabs.Content />

import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { formatDate, getInitials, titleCase } from '@/lib/utils'; // Added titleCase
import { type Profile } from '@research-collab/db'; 
import { type Database } from '@/lib/database.types'; // Import the generated types

type ProjectRow = Database['public']['Tables']['projects']['Row'];

// These types should now work if database.types.ts is correctly updated
type ProjectMemberRow = Database['public']['Tables']['project_members']['Row'];
type ProjectDocumentRow = Database['public']['Tables']['project_documents']['Row'];
type ProjectTimelineMilestoneRow = Database['public']['Tables']['project_timeline_milestones']['Row'];
type ProjectActivityLogRow = Database['public']['Tables']['project_activity_log']['Row'];


// --- Interfaces (derived from Supabase tables + frontend needs) ---
interface ProjectMember extends Profile { 
  role: ProjectMemberRow['role']; 
  project_member_id: ProjectMemberRow['id']; 
}

interface ProjectDocument extends ProjectDocumentRow {
  last_edited_by_profile?: Pick<Profile, 'first_name' | 'last_name' | 'id'> | null;
  uploader_profile?: Pick<Profile, 'first_name' | 'last_name' | 'id'> | null;
}

interface ProjectTimelineMilestone extends ProjectTimelineMilestoneRow {
  // All fields from Row are included
}

interface ProjectActivity extends ProjectActivityLogRow {
  user_profile?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
  description_text: string; 
}

interface FullProjectData extends ProjectRow {
  project_members: ProjectMember[];
  project_documents: ProjectDocument[];
  project_timeline_milestones: ProjectTimelineMilestone[];
  project_activity_log: ProjectActivity[];
  progress_percentage: number; // Ensuring this is always present
}

// --- End Interfaces ---

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = getBrowserClient();
  const { user: authUser } = useAuthStore();
  const theme = useTheme();

  const [project, setProject] = useState<FullProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const projectId = typeof params?.id === 'string' ? params.id : null;

  const generateActivityDescription = useCallback((activity: ProjectActivityLogRow, profile?: Pick<Profile, 'first_name' | 'last_name'> | null): string => {
    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'System Activity';
    // Ensure details is an object before accessing its properties
    const details = typeof activity.details === 'object' && activity.details !== null 
                    ? activity.details as { document_title?: string; member_name?: string; milestone_name?: string; old_status?: string; new_status?: string; task_name?: string; comment_snippet?: string; } 
                    : {};

    switch (activity.action_type) {
      case 'document_created':
        return `${userName} created document: "${details.document_title || 'Untitled Document'}"`;
      case 'document_updated':
        return `${userName} updated document: "${details.document_title || 'Untitled Document'}"`;
      case 'document_deleted':
        return `${userName} deleted document: "${details.document_title || 'Untitled Document'}"`;
      case 'member_added':
        return `${userName} added member: ${details.member_name || 'New Member'}`;
      case 'member_removed':
        return `${userName} removed member: ${details.member_name || 'A Member'}`;
      case 'member_role_changed':
        return `${userName} changed role for ${details.member_name || 'A Member'}`;
      case 'milestone_created':
        return `${userName} created milestone: "${details.milestone_name || 'New Milestone'}"`;
      case 'milestone_completed':
        return `${userName} completed milestone: "${details.milestone_name || 'Unnamed Milestone'}"`;
      case 'milestone_updated':
        return `${userName} updated milestone: "${details.milestone_name || 'Unnamed Milestone'}"`;
      case 'project_status_changed':
        return `${userName} changed project status from ${details.old_status || 'Previous'} to ${details.new_status || 'Current'}`;
      case 'task_assigned':
        return `${userName} assigned task "${details.task_name || 'Unnamed Task'}" to ${details.member_name || 'a member'}`;
      case 'comment_added':
        return `${userName} commented: "${details.comment_snippet || '...'}"`;
      default:
        return `${userName} performed action: ${activity.action_type || 'Unknown Action'}`;
    }
  }, []);
  
  const fetchProjectData = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error('Project not found.');

      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id, 
          role,
          user_id,
          profiles!inner (*)
        `)
        .eq('project_id', id);
      if (membersError) throw membersError;
      
      const project_members: ProjectMember[] = membersData?.map(m => {
        const profileData = m.profiles as Profile; 
        if (!profileData) return null; 
        return {
          ...profileData, 
          role: m.role, 
          project_member_id: m.id,
        };
      }).filter(Boolean) as ProjectMember[] || [];


      const { data: documentsData, error: documentsError } = await supabase
        .from('project_documents')
        .select(`
          *,
          uploader_profile:profiles!project_documents_uploader_user_id_fkey (id, first_name, last_name),
          last_edited_by_profile:profiles!project_documents_last_edited_by_user_id_fkey (id, first_name, last_name)
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (documentsError) throw documentsError;
      const project_documents: ProjectDocument[] = documentsData?.map(d => ({
        ...d,
        last_edited_at: d.last_edited_at || d.updated_at || d.created_at,
      })) || [];


      const { data: timelineData, error: timelineError } = await supabase
        .from('project_timeline_milestones')
        .select('*')
        .eq('project_id', id)
        .order('order_index', { ascending: true, nullsFirst: true })
        .order('due_date', { ascending: true, nullsFirst: false });
      if (timelineError) throw timelineError;
      const project_timeline_milestones: ProjectTimelineMilestone[] = timelineData || [];
      
      const { data: activityLogData, error: activityLogError } = await supabase
        .from('project_activity_log')
        .select(`
          *,
          user_profile:profiles (id, first_name, last_name, avatar_url)
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(10); 
      if (activityLogError) throw activityLogError;
      const project_activity_log: ProjectActivity[] = activityLogData?.map((a): ProjectActivity => ({
        ...a,
        user_profile: a.user_profile as ProjectActivity['user_profile'], 
        description_text: generateActivityDescription(a, a.user_profile as Pick<Profile, 'first_name' | 'last_name'> | null),
      })) || [];

      let calculatedProgress = 0;
      if (project_timeline_milestones.length > 0) {
        const completedMilestones = project_timeline_milestones.filter(m => m.completed !== null && m.completed).length;
        calculatedProgress = Math.round((completedMilestones / project_timeline_milestones.length) * 100);
      }
      
      setProject({
        ...projectData,
        project_members,
        project_documents,
        project_timeline_milestones,
        project_activity_log,
        progress_percentage: calculatedProgress, 
      });

    } catch (e: any) {
      console.error("Failed to fetch project data:", e);
      setError(e.message || "Could not load project details. Some parts may be unavailable due to type errors.");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, generateActivityDescription]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    } else if (!isLoading) { 
      setError("No project ID provided in URL.");
      setIsLoading(false);
    }
  }, [projectId, fetchProjectData, isLoading]);


  const handleCollaborateClick = (documentId?: string) => {
    if (!project) return;
    if (documentId) {
      router.push(`/collaborate?project=${project.id}&document=${documentId}`);
    } else {
      router.push(`/collaborate?project=${project.id}`);
    }
  };
  
  const getStatusColorScheme = (status?: string | null) => {
    if (!status) return { bg: '$gray5', text: '$gray11' }; // Tamagui theme tokens
    const s = status.toLowerCase();
    if (s.includes("progress")) return { bg: '$blue7', text: '$blue11' };
    if (s.includes("planning")) return { bg: '$purple7', text: '$purple11' };
    if (s.includes("data collection")) return { bg: '$yellow7', text: '$yellow11' };
    if (s.includes("completed")) return { bg: '$green7', text: '$green11' };
    return { bg: '$gray7', text: '$gray11' };
  };

  if (isLoading) {
    return (
      <PageContainer title="Loading Project...">
        <YStack flex={1} alignItems="center" justifyContent="center" space="$3">
          <Spinner size="large" color="$blue10" />
          <Paragraph>Loading project details...</Paragraph>
        </YStack>
      </PageContainer>
    );
  }

  if (error || !project) {
    return (
      <PageContainer title="Error">
        <YStack flex={1} alignItems="center" justifyContent="center" space="$3">
          <Heading color="$red10" size="$7">Error</Heading> {/* Use Tamagui Heading size tokens */}
          <Paragraph>{error || "Project could not be loaded."}</Paragraph>
          <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => router.back()} >Go Back</Button>
        </YStack>
      </PageContainer>
    );
  }
  
  const statusColors = getStatusColorScheme(project.status);
  const projectTags = Array.isArray(project.tags) ? project.tags : [];


  return (
    <PageContainer title={project.title || "Project Details"}>
      <ScrollView>
        <YStack space="$4" padding="$4">
          <XStack>
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<ArrowLeft size={16} />} 
              onClick={() => router.push('/dashboard/projects')}
            >
              Back to Projects
            </Button>
          </XStack>

          <XStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" space="$3">
            <YStack space="$2" flex={1} marginRight="$4" minWidth={300}>
              <Heading size="$8" fontWeight="bold">{project.title}</Heading> 
              <XStack alignItems="center" space="$2" flexWrap="wrap">
                <Text 
                  fontSize="$2" 
                  paddingVertical="$1" 
                  paddingHorizontal="$2" 
                  borderRadius="$10" 
                  backgroundColor={statusColors.bg} 
                  color={statusColors.text}
                >
                  {titleCase(project.status) || 'N/A'}
                </Text>
                {projectTags.map((tag: string) => (
                  <Text key={tag} fontSize="$2" paddingVertical="$1" paddingHorizontal="$2" borderRadius="$10" backgroundColor="$backgroundHover" color="$color">
                    {titleCase(tag)}
                  </Text>
                ))}
              </XStack>
            </YStack>

            <XStack space="$2" marginTop="$2">
              <Button variant="outline" size="sm" leftIcon={<Share size={16} />} onClick={() => alert('Share functionality to be implemented')}>Share</Button>
              <Button size="sm" leftIcon={<Edit size={16} />} onClick={() => handleCollaborateClick()}>Collaborate</Button>
            </XStack>
          </XStack>
          
          <Separator />

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} flexDirection="column" width="100%" space="$2">
            <Tabs.List disablePassBorderRadius="bottom">
              <Tabs.Trigger value="overview" flex={1}>
                <XStack alignItems="center" space="$2">
                  <BarChart2 size={16} />
                  <Text>Overview</Text>
                </XStack>
              </Tabs.Trigger>
              <Tabs.Trigger value="documents" flex={1}>
                <XStack alignItems="center" space="$2">
                  <ClipboardList size={16} />
                  <Text>Documents</Text>
                </XStack>
              </Tabs.Trigger>
              <Tabs.Trigger value="team" flex={1}>
                <XStack alignItems="center" space="$2">
                  <Users size={16} />
                  <Text>Team</Text>
                </XStack>
              </Tabs.Trigger>
            </Tabs.List>

            <YStack marginTop="$4">
              <Tabs.Content value="overview">
                <YStack space="$4">
                  <Card>
                    <CardHeader><Heading size="$6">Project Description</Heading></CardHeader>
                    <CardContent><Paragraph>{project.description || "No description provided."}</Paragraph></CardContent>
                  </Card>

                  <Card>
                    <CardHeader><Heading size="$6">Progress</Heading></CardHeader>
                    <CardContent>
                      <YStack space="$3">
                        <XStack justifyContent="space-between">
                          <Paragraph>Overall Progress</Paragraph>
                          <Paragraph fontWeight="bold">{project.progress_percentage || 0}%</Paragraph>
                        </XStack>
                        <Progress value={project.progress_percentage || 0} size="$1.5">
                           <Progress.Indicator animation="quick" />
                        </Progress>
                        
                        <YStack space="$2" marginTop="$3">
                          <Heading size="$5">Timeline</Heading>
                          {project.project_timeline_milestones?.length > 0 ? project.project_timeline_milestones.map((item) => (
                            <XStack key={item.id} alignItems="center" justifyContent="space-between" paddingVertical="$2">
                              <XStack alignItems="center" space="$2">
                                <YStack 
                                  width={16} height={16} borderRadius={8} 
                                  backgroundColor={item.completed ? '$green9' : '$backgroundFocus'}
                                  borderWidth={item.completed ? 0 : 2}
                                  borderColor={item.completed ? "transparent" : "$borderColor"}
                                />
                                <Paragraph textDecorationLine={item.completed ? 'line-through' : 'none'} color={item.completed ? '$colorFocus' : '$color'}>
                                  {item.milestone_name}
                                </Paragraph>
                              </XStack>
                              <Paragraph fontSize="$2" color="$colorFocus">{item.due_date ? formatDate(item.due_date) : 'N/A'}</Paragraph>
                            </XStack>
                          )) : <Paragraph>No timeline milestones yet.</Paragraph>}
                        </YStack>
                      </YStack>
                    </CardContent>
                  </Card>
                  
                  <XStack space="$4" flexWrap="wrap">
                    <YStack flex={1} minWidth={280} space="$4">
                       <Card>
                         <CardHeader><Heading size="$6">Recent Activity</Heading></CardHeader>
                         <CardContent>
                           <YStack space="$3">
                             {project.project_activity_log?.length > 0 ? project.project_activity_log.slice(0, 5).map(activity => (
                               <XStack key={activity.id} space="$3" alignItems="center">
                                  <Avatar 
                                    size="sm" 
                                    src={activity.user_profile?.avatar_url ?? undefined} // Ensure src can be undefined
                                    alt={`${activity.user_profile?.first_name || 'User'} ${activity.user_profile?.last_name || ''}`}
                                    fallback={activity.user_profile 
                                                ? getInitials(activity.user_profile.first_name, activity.user_profile.last_name) 
                                                : <FiUser size={20} />}
                                  />
                                  <YStack flex={1}>
                                    <Paragraph fontSize="$3" flexWrap="wrap">{activity.description_text}</Paragraph>
                                    <Paragraph fontSize="$2" color="$colorFocus">
                                      {activity.created_at ? formatDate(activity.created_at) : 'Date N/A'}
                                    </Paragraph>
                                  </YStack>
                               </XStack>
                             )) : <Paragraph>No recent activity.</Paragraph>}
                           </YStack>
                         </CardContent>
                      </Card>
                    </YStack>

                    <YStack flex={1} minWidth={280} space="$4">
                      <Card>
                        <CardHeader><Heading size="$6">Team Members</Heading></CardHeader>
                        <CardContent>
                          <YStack space="$3">
                            {project.project_members?.length > 0 ? project.project_members.map(member => (
                              <XStack key={member.project_member_id} alignItems="center" justifyContent="space-between">
                                <XStack alignItems="center" space="$3">
                                  <Avatar 
                                    size="sm" 
                                    src={member.avatar_url ?? undefined}
                                    alt={`${member.first_name} ${member.last_name}`}
                                    fallback={getInitials(member.first_name, member.last_name)}
                                  />
                                  <YStack>
                                    <Paragraph fontWeight="bold">{member.first_name} {member.last_name}</Paragraph>
                                    <Paragraph fontSize="$2" color="$colorFocus" textTransform="capitalize">{member.role}</Paragraph>
                                  </YStack>
                                </XStack>
                              </XStack>
                            )) : <Paragraph>No team members yet.</Paragraph>}
                          </YStack>
                        </CardContent>
                         <CardFooter>
                            <Button size="sm" leftIcon={<Plus size={16}/>} onClick={() => alert("TODO: Invite Member clicked")} style={{flexGrow: 1}}>Invite Member</Button>
                         </CardFooter>
                      </Card>
                    </YStack>
                  </XStack>
                </YStack>
              </Tabs.Content>

              <Tabs.Content value="documents">
                <YStack space="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Heading size="$7">Project Documents</Heading>
                    <Popover placement="bottom-end">
                      <Popover.Trigger asChild>
                         <Button size="sm" leftIcon={<Plus size={16}/>}>New Document</Button>
                      </Popover.Trigger>
                      <Popover.Content bordered borderColor="$borderColor" padding="$2" enterStyle={{ y: -10, opacity: 0 }} exitStyle={{ y: -10, opacity: 0 }} animation="quick" elevate>
                         <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
                          <YStack space="$2">
                            <Button variant="ghost" leftIcon={<FileText size={16}/>} onClick={() => handleCollaborateClick()}>Text Document</Button>
                            <Button variant="ghost" leftIcon={<Beaker size={16}/>} onClick={() => handleCollaborateClick()} >Code Notebook</Button>
                          </YStack>
                      </Popover.Content>
                    </Popover>
                  </XStack>

                  <YStack space="$3">
                    {project.project_documents?.length > 0 ? project.project_documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardHeader>
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} marginRight="$2">
                              <Heading size="$6" numberOfLines={1}>{doc.title}</Heading>
                              <Paragraph fontSize="$2" color="$colorFocus">{titleCase(doc.document_type)}</Paragraph>
                            </YStack>
                             <Popover placement="bottom-end">
                              <Popover.Trigger asChild>
                                <Button size="sm" variant="ghost" leftIcon={<MoreHorizontal size={18}/>} />
                              </Popover.Trigger>
                              <Popover.Content bordered borderColor="$borderColor" padding="$2" enterStyle={{ y: -10, opacity: 0 }} exitStyle={{ y: -10, opacity: 0 }} animation="quick" elevate>
                                <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
                                <YStack space="$1">
                                  <Button variant="ghost" leftIcon={<Edit size={14}/>} onClick={() => handleCollaborateClick(doc.id)} >Edit</Button>
                                  <Button variant="ghost" leftIcon={<Share size={14}/>} onClick={() => alert('Share document clicked')}>Share</Button>
                                  <Button variant="ghost" leftIcon={<FileText size={14}/>} onClick={() => alert('Download document clicked')}>Download</Button>
                                </YStack>
                              </Popover.Content>
                            </Popover>
                          </XStack>
                        </CardHeader>
                        <CardContent>
                          <XStack alignItems="center" space="$2" marginBottom="$1">
                             <Calendar size={14} color={theme.gray10.val as string}/> 
                             <Paragraph fontSize="$2" color="$colorFocus">
                               Last edited: {doc.last_edited_at ? formatDate(doc.last_edited_at) : 'N/A'}
                              </Paragraph>
                          </XStack>
                           <XStack alignItems="center" space="$2">
                             <Edit size={14} color={theme.gray10.val as string}/>
                             <Paragraph fontSize="$2" color="$colorFocus">
                               Edited by: {doc.last_edited_by_profile ? `${doc.last_edited_by_profile.first_name} ${doc.last_edited_by_profile.last_name}` : 'N/A'}
                             </Paragraph>
                          </XStack>
                        </CardContent>
                        <CardFooter>
                          <Button size="sm" leftIcon={<Edit size={16}/>} style={{flexGrow: 1}} onClick={() => handleCollaborateClick(doc.id)}>Open</Button>
                        </CardFooter>
                      </Card>
                    )) : <Paragraph>No documents yet. Add one!</Paragraph>}
                  </YStack>
                </YStack>
              </Tabs.Content>

              <Tabs.Content value="team">
                <YStack space="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Heading size="$7">Team Members</Heading>
                    <Button size="sm" leftIcon={<Plus size={16}/>} onClick={() => alert("TODO: Invite Member from Team tab")}>Invite Member</Button>
                  </XStack>

                  <Card>
                    <YStack separator={<Separator />}>
                      {project.project_members?.length > 0 ? project.project_members.map((member) => (
                        <XStack key={member.project_member_id} alignItems="center" justifyContent="space-between" padding="$3" space="$3">
                          <XStack alignItems="center" space="$3">
                             <Avatar 
                               size="md" 
                               src={member.avatar_url ?? undefined}
                               alt={`${member.first_name} ${member.last_name}`}
                               fallback={getInitials(member.first_name, member.last_name)}
                             />
                            <YStack>
                              <Paragraph fontWeight="bold">{member.first_name} {member.last_name}</Paragraph>
                              <Paragraph fontSize="$2" textTransform="capitalize" color="$colorFocus">{member.role}</Paragraph>
                            </YStack>
                          </XStack>
                          <XStack space="$1">
                            <Button size="sm" variant="ghost" leftIcon={<MessageSquare size={18}/>} onClick={() => alert(`Chat with ${member.first_name}`)} />
                            <Button size="sm" variant="ghost" leftIcon={<Video size={18}/>} onClick={() => alert(`Video call ${member.first_name}`)} />
                            <Popover placement="bottom-end">
                              <Popover.Trigger asChild>
                                <Button size="sm" variant="ghost" leftIcon={<MoreHorizontal size={18}/>} />
                              </Popover.Trigger>
                              <Popover.Content bordered borderColor="$borderColor" padding="$2" enterStyle={{ y: -10, opacity: 0 }} exitStyle={{ y: -10, opacity: 0 }} animation="quick" elevate>
                                <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
                                <YStack space="$1">
                                  <Button variant="ghost" onClick={() => router.push(`/profile/${member.id}`)}>View Profile</Button>
                                  <Button variant="ghost" onClick={() => alert('Change role clicked')}>Change Role</Button>
                                  <Button variant="ghost" onClick={() => alert('Remove from project clicked')} color="$red10">Remove from Project</Button> 
                                </YStack>
                              </Popover.Content>
                            </Popover>
                          </XStack>
                        </XStack>
                      )) : <Paragraph padding="$3">No team members assigned yet.</Paragraph>}
                    </YStack>
                  </Card>

                  <Card>
                    <CardHeader><Heading size="$6">Team Communication</Heading></CardHeader>
                    <CardContent>
                      <YStack space="$3">
                        <Button size="sm" leftIcon={<MessageSquare size={16}/>} onClick={() => router.push(`/collaborate?project=${project.id}&tab=chat`)}>Open Team Chat</Button>
                        <Button size="sm" variant="outline" leftIcon={<Video size={16}/>} onClick={() => router.push(`/collaborate?project=${project.id}&tab=video`)}>Start Video Call</Button>
                      </YStack>
                    </CardContent>
                  </Card>
                </YStack>
              </Tabs.Content>
            </YStack>
          </Tabs>
        </YStack>
      </ScrollView>
    </PageContainer>
  );
} 