import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building, Link as LinkIcon, Save, Loader2, Globe, MapPin, FileText, Building2, Calendar, ShieldCheck, Eye, Settings } from 'lucide-react';
import { authApi, projectsApi } from '@/lib/api';
import { useToast } from '../../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileCompletion } from '@/components/profile/ProfileCompletion';
import { useNavigate } from 'react-router-dom'
import { CountryCombobox } from '@/components/shared/CountryCombobox'
import { COUNTRIES } from '@/lib/constants'

export function ClientProfileEditor() {
  const { user, token, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [clientType, setClientType] = useState<'individual' | 'organisation'>(user?.client_type || 'individual');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    avatar_url: user?.avatar_url || '',
    banner_url: user?.banner_url || '',
    timezone: user?.timezone || 'UTC',
    social_proof: user?.social_proof || '',
    company_name: user?.company_name || '',
    company_website: user?.company_website || '',
    vat_id: user?.vat_id || '',
    industry: user?.industry || '',
    company_size: user?.company_size || '',
    company_description: user?.company_description || '',
    billing_country: user?.billing_country || '',
    preferred_engagement_model: user?.preferred_engagement_model || 'fixed'
  });

  useEffect(() => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      avatar_url: user?.avatar_url || '',
      banner_url: user?.banner_url || '',
      timezone: user?.timezone || 'UTC',
      social_proof: user?.social_proof || '',
      company_name: user?.company_name || '',
      company_website: user?.company_website || '',
      vat_id: user?.vat_id || '',
      industry: user?.industry || '',
      company_size: user?.company_size || '',
      company_description: user?.company_description || '',
      billing_country: user?.billing_country || '',
      preferred_engagement_model: user?.preferred_engagement_model || 'fixed'
    });
    setClientType(user?.client_type || 'individual');
  }, [user]);

  const { data: projects } = useQuery({
    queryKey: ['clientProjects', user?.id],
    queryFn: () => projectsApi.getAll(token!, 'active'),
    enabled: !!token,
  });

  const handleSaveAvatar = async (file: File) => {
    if (!token) return;
    try {
      console.log('[ClientProfileEditor] Starting avatar upload...');
      const { url } = await authApi.profile.uploadMedia(token, file, 'avatar');
      console.log('[ClientProfileEditor] Upload returned URL:', url);
      // The backend returns URL with cache-busting timestamp already
      console.log('[ClientProfileEditor] Calling updateProfile...');
      await updateProfile({ avatar_url: url });
      console.log('[ClientProfileEditor] updateProfile completed');
      setFormData(prev => ({ ...prev, avatar_url: url }));
      toast({ title: 'Avatar updated' });
    } catch (err) {
      console.error('[ClientProfileEditor] Avatar upload error:', err);
      toast({ title: 'Failed to update avatar', variant: 'destructive' });
    }
  };

  const handleSaveBanner = async (file: File) => {
    if (!token) return;
    try {
      const { url } = await authApi.profile.uploadMedia(token, file, 'banner');
      // The backend returns URL with cache-busting timestamp already
      await updateProfile({ banner_url: url });
      setFormData(prev => ({ ...prev, banner_url: url }));
      toast({ title: 'Banner updated' });
    } catch {
      toast({ title: 'Failed to update banner', variant: 'destructive' });
    }
  };

  const handleRemoveMedia = async (type: 'avatar' | 'banner') => {
    try {
      const update = type === 'avatar' ? { avatar_url: null } : { banner_url: null };
      await updateProfile(update);
      setFormData(prev => ({ ...prev, [type === 'avatar' ? 'avatar_url' : 'banner_url']: '' }));
      toast({ title: `${type === 'avatar' ? 'Avatar' : 'Banner'} removed` });
    } catch {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

  const handleSaveProfile = async () => {
    if (clientType === 'organisation') {
      if (!formData.company_name) return toast({ title: "Company Name is required", variant: "destructive" });
      if (!formData.industry) return toast({ title: "Industry is required", variant: "destructive" });
    } else {
      if (!formData.social_proof) return toast({ title: "LinkedIn/Portfolio link required", variant: "destructive" });
    }
    if (!formData.billing_country) return toast({ title: "Billing Country is required", variant: "destructive" });

    setIsSaving(true);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        timezone: formData.timezone,
        client_type: clientType,
        billing_country: formData.billing_country,
        preferred_engagement_model: formData.preferred_engagement_model,

        social_proof: clientType === 'individual' ? formData.social_proof : null,

        company_name: clientType === 'organisation' ? formData.company_name : null,
        company_website: clientType === 'organisation' ? formData.company_website : null,
        vat_id: clientType === 'organisation' ? formData.vat_id : null,
        industry: clientType === 'organisation' ? formData.industry : null,
        company_size: clientType === 'organisation' ? formData.company_size : null,
        company_description: clientType === 'organisation' ? formData.company_description : null,
      });

      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      avatar_url: user?.avatar_url || '',
      banner_url: user?.banner_url || '',
      timezone: user?.timezone || 'UTC',
      social_proof: user?.social_proof || '',
      company_name: user?.company_name || '',
      company_website: user?.company_website || '',
      vat_id: user?.vat_id || '',
      industry: user?.industry || '',
      company_size: user?.company_size || '',
      company_description: user?.company_description || '',
      billing_country: user?.billing_country || '',
      preferred_engagement_model: user?.preferred_engagement_model || 'fixed'
    });
    setClientType(user?.client_type || 'individual');
    setIsEditing(false);
  };

  const handleEditSection = (section: string) => {
    setIsEditing(true);
    let elementId = 'profile-header';
    if (section === 'Location' || section === 'Identity Verification' || section === 'Company Details') {
      elementId = 'identity-verification';
    }
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 pt-10">
      <div className="flex-1 space-y-6">
        <div id="profile-header">
          <ProfileHeader
            form_data={formData}
            set_form_data={setFormData}
            is_editing={isEditing}
            set_is_editing={setIsEditing}
            is_buyer={true}
            is_expert={false}
            user_email={user?.email}
            projectsPosted={user?.projects_posted || 0}
            totalSpent={user?.total_spent || 0}
            onSaveAvatar={handleSaveAvatar}
            onSaveBanner={handleSaveBanner}
            onRemoveAvatar={() => handleRemoveMedia('avatar')}
            onRemoveBanner={() => handleRemoveMedia('banner')}
          />
        </div>

        <Card id="identity-verification" className="overflow-hidden border-zinc-200">
          <CardHeader className="border-b bg-zinc-50/50 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {clientType === 'individual' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Client Identity</CardTitle>
                <CardDescription>Tell experts who you are representing.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">

            <div className="space-y-3">
              <Label className="text-base font-medium">I am representing...</Label>
              <RadioGroup
                defaultValue="individual"
                value={clientType}
                onValueChange={(v: 'individual' | 'organisation') => isEditing && setClientType(v)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                disabled={!isEditing}
              >
                <div>
                  <RadioGroupItem value="individual" id="individual" className="peer sr-only" />
                  <Label
                    htmlFor="individual"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 border-zinc-100 bg-white p-4 hover:bg-zinc-50 hover:border-zinc-200 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/30 transition-all ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    <User className={`mb-3 h-6 w-6 ${clientType === 'individual' ? 'text-blue-600' : 'text-zinc-400'}`} />
                    <span className="font-semibold">Individual</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="organisation" id="organisation" className="peer sr-only" />
                  <Label
                    htmlFor="organisation"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 border-zinc-100 bg-white p-4 hover:bg-zinc-50 hover:border-zinc-200 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/30 transition-all ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    <Building className={`mb-3 h-6 w-6 ${clientType === 'organisation' ? 'text-blue-600' : 'text-zinc-400'}`} />
                    <span className="font-semibold">Organisation</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="flex gap-1">Billing Country <span className="text-red-500">*</span></Label>
                <CountryCombobox
                  value={formData.billing_country}
                  onValueChange={(v) => setFormData({ ...formData, billing_country: v })}
                  options={COUNTRIES}
                  placeholder="Select country"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Engagement</Label>
                <Select
                  value={formData.preferred_engagement_model}
                  onValueChange={(v) => setFormData({ ...formData, preferred_engagement_model: v })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="daily">Daily Rate</SelectItem>
                    <SelectItem value="sprint">Sprint Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {clientType === 'individual' && (
              <div className="space-y-4 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="flex gap-1">Social Proof (LinkedIn / GitHub) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="https://linkedin.com/in/..."
                      className="pl-9"
                      value={formData.social_proof}
                      onChange={(e) => setFormData({ ...formData, social_proof: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Link your professional profile to build credibility.</p>
                </div>
              </div>
            )}

            {clientType === 'organisation' && (
              <div className="space-y-6 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex gap-1">Company Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Acme Corp Inc."
                        className="pl-9 font-medium"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="https://acme.com"
                        className="pl-9"
                        value={formData.company_website}
                        onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select
                      value={formData.company_size}
                      onValueChange={(v) => setFormData({ ...formData, company_size: v })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 Employees</SelectItem>
                        <SelectItem value="11-50">11-50 Employees</SelectItem>
                        <SelectItem value="51-200">51-200 Employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 Employees</SelectItem>
                        <SelectItem value="1000+">1000+ Employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex gap-1">Industry <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. Fintech, Healthcare"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>VAT / Tax ID</Label>
                    <Input
                      placeholder="Optional"
                      value={formData.vat_id}
                      onChange={(e) => setFormData({ ...formData, vat_id: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Company Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Textarea
                        placeholder="Briefly describe what your organisation does..."
                        className="pl-9 min-h-[100px] resize-y"
                        value={formData.company_description}
                        onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex items-center justify-end gap-3 p-4 bg-white border border-zinc-200 rounded-xl shadow-lg sticky bottom-6 z-50 animate-in slide-in-from-bottom-2">
            <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Profile
            </Button>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <ProfileCompletion
          formData={{ ...formData, client_type: clientType, profile_completion: user?.profile_completion }}
          isBuyer={true}
          isExpert={false}
          onEditSection={handleEditSection}
        />

        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Account Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 flex gap-2"><User className="h-4 w-4" /> Role</span>
              <span className="capitalize font-medium">Buyer</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 flex gap-2"><Calendar className="h-4 w-4" /> Joined</span>
              <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-2">
          <Button variant="outline" className="w-full justify-start text-zinc-600" onClick={() => window.open(`/clients/${user?.profileId || user?.buyer_profile_id || user?.id}`, '_blank')}><Eye className="h-4 w-4 mr-2" /> View Public Profile</Button>
          <Button variant="outline" className="w-full justify-start text-zinc-600" onClick={() => navigate('/settings')}><Settings className="h-4 w-4 mr-2" /> Account Settings</Button>
        </div>
      </div>
    </div>
  );
}