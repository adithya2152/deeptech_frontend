import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { domainLabels } from '@/data/mockData'
import { Domain } from '@/types'
import { User, Mail, Briefcase, Calendar, Loader2, Edit, Save, Tag } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)

  const [formData, setFormData] = useState({
  first_name: profile?.first_name || '',
  last_name: profile?.last_name || '',
  title: profile?.title || '',
  bio: profile?.bio || '',
  domains: profile?.domains ?? [],
})


  const handleSave = async () => {
    setLoading(true)
    try {
      // Add custom domain if provided
      const domainsToSave = [
        ...formData.domains,
        ...(showOtherInput && customDomain.trim() ? [`custom:${customDomain.trim()}`] : [])
      ]
      
      await updateProfile({ ...formData, domains: domainsToSave })
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = () => {
    const role = user?.role || 'buyer'
    return (
      <Badge variant={role === 'buyer' ? 'default' : 'secondary'} className="text-xs">
        {role === 'buyer' ? '👔 Buyer' : '🎓 Expert'}
      </Badge>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <div className="grid gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Account Information</CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Type */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === 'buyer' ? 'Hiring experts for projects' : 'Providing expert services'}
                    </p>
                  </div>
                </div>
                {getRoleBadge()}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {user?.role === 'buyer' ? 'Job Title' : 'Professional Title'}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!isEditing}
                  placeholder={user?.role === 'buyer' ? 'e.g., CEO, CTO, Product Manager' : 'e.g., PhD in AI, Senior Engineer'}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">
                  {user?.role === 'buyer' ? 'About Your Company' : 'Professional Bio'}
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder={
                    user?.role === 'buyer'
                      ? 'Tell us about your company and what you are looking for...'
                      : 'Share your expertise, experience, and what you can offer...'
                  }
                  rows={4}
                />
              </div>

              {/* Domains - Expert Only */}
              {user?.role === 'expert' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Label>Areas of Expertise</Label>
                  </div>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(domainLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={formData.domains.includes(key as Domain)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  domains: [...formData.domains, key as Domain],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  domains: formData.domains.filter(d => d !== key),
                                })
                              }
                            }}
                          />
                          <label
                            htmlFor={key}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
                      <div className="col-span-2 flex items-center space-x-2">
                        <Checkbox
                          id="domain-other-profile"
                          checked={showOtherInput}
                          onCheckedChange={(checked) => {
                            setShowOtherInput(!!checked)
                            if (!checked) setCustomDomain('')
                          }}
                        />
                        <label
                          htmlFor="domain-other-profile"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Other (specify)
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.domains.length > 0 ? (
                        formData.domains.map((domain) => (
                          <Badge key={domain} variant="secondary">
                            {domain.startsWith('custom:') 
                              ? domain.substring(7) 
                              : domainLabels[domain] || domain}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No domains selected</p>
                      )}
                    </div>
                  )}
                  {isEditing && showOtherInput && (
                    <Input
                      placeholder="Enter your custom domain"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      maxLength={50}
                      className="mt-2"
                    />
                  )}
                </div>
              )}

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setCustomDomain('')
                      setShowOtherInput(false)
                      setFormData({
                        first_name: profile?.first_name || '',
                        last_name: profile?.last_name || '',
                        title: profile?.title || '',
                        bio: profile?.bio || '',
                        domains: profile?.domains || [],
                      })
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Member Since</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                      : 'Recently'}
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Profile Status</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {profile?.is_completed ? 'Complete' : 'Incomplete'}
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {user?.role === 'buyer' ? 'Projects' : 'Contracts'}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">0</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Account ID</p>
                  </div>
                  <p className="text-xs font-mono truncate">
                    {user?.id ? `${user.id.split('-')[0]}...` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {user?.role === 'buyer' && (
            <Card>
              <CardHeader>
                <CardTitle>Buyer Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Post Unlimited Projects</p>
                      <p className="text-muted-foreground">Create and manage multiple deep-tech projects</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Browse Expert Profiles</p>
                      <p className="text-muted-foreground">Search and filter verified deep-tech experts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Direct Communication</p>
                      <p className="text-muted-foreground">Message and negotiate with experts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === 'expert' && (
            <Card>
              <CardHeader>
                <CardTitle>Expert Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Browse Project Opportunities</p>
                      <p className="text-muted-foreground">Find projects matching your expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Submit Proposals</p>
                      <p className="text-muted-foreground">Express interest and negotiate terms</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Track Your Contracts</p>
                      <p className="text-muted-foreground">Manage active engagements and deliverables</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
