import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { useProject, useUpdateProjectStatus, useDeleteProject } from '@/hooks/useProjects'
import { domainLabels, trlDescriptions } from '@/data/mockData'
import { 
  ArrowLeft, 
  Edit, 
  PlayCircle, 
  CheckCircle, 
  Archive, 
  Trash2,
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const { data: project, isLoading } = useProject(id!)
  const updateStatus = useUpdateProjectStatus()
  const deleteProject = useDeleteProject()
  
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const riskLabels = {
    technical: 'Technical',
    regulatory: 'Regulatory',
    scale: 'Scale',
    market: 'Market',
  }

  const handleActivate = async () => {
    try {
      await updateStatus.mutateAsync({ id: id!, status: 'active' })
      toast({ title: 'Project Activated', description: 'Your project is now active and visible to experts.' })
      setShowActivateDialog(false)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to activate project', variant: 'destructive' })
    }
  }

  const handleComplete = async () => {
    try {
      await updateStatus.mutateAsync({ id: id!, status: 'completed' })
      toast({ title: 'Project Completed', description: 'Congratulations on completing your project!' })
      setShowCompleteDialog(false)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to complete project', variant: 'destructive' })
    }
  }

  const handleArchive = async () => {
    try {
      await updateStatus.mutateAsync({ id: id!, status: 'archived' })
      toast({ title: 'Project Archived', description: 'Project has been archived successfully.' })
      setShowArchiveDialog(false)
      navigate('/projects')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to archive project', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(id!)
      toast({ title: 'Project Deleted', description: 'Project has been permanently deleted.' })
      setShowDeleteDialog(false)
      navigate('/projects')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold">{project.title}</h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {project.createdAt.toLocaleDateString()}
                </div>
                <Badge variant="outline">{domainLabels[project.domain]}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {project.status === 'draft' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/projects/${id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => setShowActivateDialog(true)}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                </>
              )}

              {project.status === 'active' && (
                <Button onClick={() => setShowCompleteDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}

              {project.status !== 'archived' && (
                <Button
                  variant="outline"
                  onClick={() => setShowArchiveDialog(true)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}

              {project.status === 'draft' && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {project.problemDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expected Outcome</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {project.expectedOutcome}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>TRL Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">TRL {project.trlLevel}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((project.trlLevel / 9) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${(project.trlLevel / 9) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {trlDescriptions[project.trlLevel]}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {project.riskCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No risks identified</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {project.riskCategories.map(risk => (
                      <Badge key={risk} variant="secondary" className="justify-start gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        {riskLabels[risk]}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Project</AlertDialogTitle>
            <AlertDialogDescription>
              Activating this project will make it visible to experts and allow them to express interest. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>
              Activate Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Project as Complete</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the project as completed. You can still view the project details but won't be able to make changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Project</AlertDialogTitle>
            <AlertDialogDescription>
              Archived projects are hidden from the main view but can still be accessed later. You can unarchive them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
