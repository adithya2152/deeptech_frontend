import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Briefcase, Building, Edit, Video } from 'lucide-react';
import { domainLabels } from '@/lib/constants';

interface ProfileHeaderProps {
  form_data: any;
  set_form_data: (data: any) => void;
  is_editing: boolean;
  set_is_editing: (v: boolean) => void;
  is_buyer: boolean;
  is_expert: boolean;
  user_email: string;
}

export function ProfileHeader({ 
    form_data, set_form_data, is_editing, set_is_editing, is_buyer, is_expert, user_email 
}: ProfileHeaderProps) {
  
  const getAccountDescription = () => {
    if (is_buyer) return 'Hiring Deep Tech Experts';
    
    if (form_data.domains && form_data.domains.length > 0) {
      const primaryDomain = form_data.domains[0];
      const label = (domainLabels as any)[primaryDomain] || primaryDomain;
      return `${label} Expert`;
    }
    
    return 'Deep Tech Expert';
  };

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-zinc-50/50 pb-4">
        <CardTitle className="text-lg">Account Information</CardTitle>
        {!is_editing && (
          <Button variant="outline" size="sm" onClick={() => set_is_editing(true)} className="border-zinc-200">
            <Edit className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-6">

        <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Account Type</p>
              <p className="text-xs text-zinc-500">
                {getAccountDescription()}
              </p>
            </div>
          </div>
          <Badge variant={is_buyer ? 'default' : 'secondary'} className="px-3 py-1 uppercase tracking-wider text-[10px]">
            {is_buyer ? 'Buyer' : 'Expert'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">First Name</Label>
            <Input
              value={form_data.first_name}
              onChange={(e) => set_form_data({ ...form_data, first_name: e.target.value })}
              disabled={!is_editing}
              className="border-zinc-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Last Name</Label>
            <Input
              value={form_data.last_name}
              onChange={(e) => set_form_data({ ...form_data, last_name: e.target.value })}
              disabled={!is_editing}
              className="border-zinc-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input value={user_email} disabled className="pl-10 bg-zinc-50 border-zinc-200 cursor-not-allowed text-zinc-500" />
          </div>
        </div>

        {is_buyer && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Organization</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                value={form_data.company}
                onChange={(e) => set_form_data({ ...form_data, company: e.target.value })}
                disabled={!is_editing}
                placeholder="Organization Name"
                className="pl-10 border-zinc-200"
              />
            </div>
          </div>
        )}

        {is_expert && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Professional Summary</Label>
              <Textarea
                value={form_data.bio}
                onChange={(e) => set_form_data({ ...form_data, bio: e.target.value })}
                disabled={!is_editing}
                placeholder="Summarize your experience and deep-tech expertise..."
                rows={5}
                className="resize-none border-zinc-200 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Years of Experience</Label>
                    <Input
                        type="number"
                        value={form_data.years_experience}
                        onChange={(e) => set_form_data({ ...form_data, years_experience: Number(e.target.value) })}
                        disabled={!is_editing}
                        className="border-zinc-200"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                        <Video className="h-3 w-3" /> Profile Video URL
                    </Label>
                    <Input
                        value={form_data.profile_video_url}
                        onChange={(e) => set_form_data({ ...form_data, profile_video_url: e.target.value })}
                        disabled={!is_editing}
                        placeholder="https://youtube.com/..."
                        className="border-zinc-200"
                    />
                </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}