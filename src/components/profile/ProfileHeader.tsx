import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Briefcase, Building, Edit, Globe, Loader2, MapPin, Link as LinkIcon, Clock, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { domainLabels } from '@/lib/constants';

interface ProfileHeaderProps {
  form_data: any;
  set_form_data: (data: any) => void;
  is_editing: boolean;
  set_is_editing: (v: boolean) => void;
  is_buyer: boolean;
  is_expert: boolean;
  user_email: string;
  onAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingAvatar?: boolean;
}

export function ProfileHeader({ 
  form_data, set_form_data, is_editing, set_is_editing, is_buyer, is_expert, user_email, onAvatarUpload, uploadingAvatar
}: ProfileHeaderProps) {
  
  const getAccountDescription = () => {
    if (is_buyer) return 'Hiring Deep Tech Experts';
    if (form_data.headline) return form_data.headline;
    if (form_data.domains && form_data.domains.length > 0) {
      const primaryDomain = form_data.domains[0];
      const label = domainLabels[primaryDomain] || primaryDomain;
      return `${label} Expert`;
    }
    return 'Deep Tech Expert';
  };

  return (
    <div className="relative group bg-white ">
      <div className="h-48 w-full relative bg-zinc-100 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-t-md"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>
      
      <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 items-start">
          
          <div className="relative shrink-0">
              <div className="rounded-2xl p-1.5 bg-white shadow-lg">
                <Avatar className="h-32 w-32 rounded-xl">
                    <AvatarImage src={form_data.avatar_url} className="object-cover" /> 
                    <AvatarFallback className="rounded-xl text-3xl font-bold text-zinc-300 bg-zinc-100">
                        {form_data.first_name?.[0]}{form_data.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>
              </div>
              
              {is_editing && (
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl cursor-pointer opacity-0 hover:opacity-100 transition-opacity backdrop-blur-[2px] m-1.5 z-10">
                      <div className="text-white flex flex-col items-center gap-1">
                          {uploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                          <span className="text-[10px] font-medium uppercase tracking-wide">Change</span>
                      </div>
                      <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={onAvatarUpload}
                          disabled={uploadingAvatar}
                      />
                  </label>
              )}
          </div>
          
          <div className="flex-1 min-w-0 pt-16 md:pt-20 space-y-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="space-y-1.5 w-full">
                  {is_editing ? (
                    <div className="flex gap-2 max-w-md">
                        <Input 
                          value={form_data.first_name} 
                          onChange={(e) => set_form_data({ ...form_data, first_name: e.target.value })}
                          placeholder="First Name" 
                          className="h-10 text-lg font-semibold"
                        />
                        <Input 
                          value={form_data.last_name} 
                          onChange={(e) => set_form_data({ ...form_data, last_name: e.target.value })}
                          placeholder="Last Name" 
                          className="h-10 text-lg font-semibold"
                        />
                    </div>
                  ) : (
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">{form_data.first_name} {form_data.last_name}</h2>
                  )}
                  
                  {!is_editing && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200/60 rounded-md font-medium">
                            {getAccountDescription()}
                        </Badge>
                        {is_expert && form_data.availability_status && (
                           <Badge variant="outline" className={`border-0 bg-opacity-10 ${
                             form_data.availability_status === 'open' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 
                             form_data.availability_status === 'limited' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 
                             'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                           }`}>
                              <div className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                 form_data.availability_status === 'open' ? 'bg-emerald-500' : 
                                 form_data.availability_status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              {form_data.availability_status === 'open' ? 'Available' : form_data.availability_status?.replace('_', ' ')}
                           </Badge>
                        )}
                      </div>
                  )}
               </div>

               {!is_editing && (
                   <Button 
                    onClick={() => set_is_editing(true)} 
                    variant="outline" 
                    className="hidden md:flex bg-white hover:bg-zinc-500 border-zinc-200 text-zinc-700 shadow-sm"
                   >
                       <Edit className="h-3.5 w-3.5 mr-2" /> Edit Profile
                   </Button>
               )}
            </div>

            {is_editing && is_expert && (
                <div className="pt-3 max-w-xl">
                    <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1.5 block">Professional Headline</Label>
                    <Input 
                        value={form_data.headline} 
                        onChange={(e) => set_form_data({ ...form_data, headline: e.target.value })}
                        placeholder="e.g. Senior Robotics Engineer" 
                        className="bg-white"
                    />
                </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-zinc-100">
           
           <div className="space-y-1">
              <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                 <Mail className="w-3 h-3" /> Email
              </Label>
              <div className="text-sm font-medium text-zinc-700 truncate" title={user_email}>{user_email}</div>
           </div>
           
           <div className="space-y-1">
              <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                 <MapPin className="w-3 h-3" /> Location
              </Label>
              {is_editing ? (
                  <Input 
                    value={form_data.location} 
                    onChange={(e) => set_form_data({ ...form_data, location: e.target.value })}
                    placeholder="City, Country"
                    className="h-8 text-sm"
                  />
              ) : (
                  <div className="text-sm font-medium text-zinc-700">{form_data.location || 'Remote'}</div>
              )}
           </div>

           {(is_expert || is_buyer) && (
              <div className="space-y-1">
                 <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                    {is_buyer ? <Building className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />} 
                    {is_buyer ? 'Company' : 'Portfolio'}
                 </Label>
                 {is_buyer ? (
                    is_editing ? (
                       <Input value={form_data.company} onChange={e => set_form_data({...form_data, company: e.target.value})} className="h-8 text-sm" />
                    ) : (
                       <div className="text-sm font-medium text-zinc-700">{form_data.company || '-'}</div>
                    )
                 ) : (
                    is_editing ? (
                       <Input value={form_data.portfolio_url} onChange={e => set_form_data({...form_data, portfolio_url: e.target.value})} className="h-8 text-sm" placeholder="https://" />
                    ) : (
                       form_data.portfolio_url ? (
                          <a href={form_data.portfolio_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                             Visit Website <Globe className="w-3 h-3" />
                          </a>
                       ) : <div className="text-sm text-zinc-400">-</div>
                    )
                 )}
              </div>
           )}

           {is_expert && (
              <div className="space-y-1">
                 <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Experience
                 </Label>
                 {is_editing ? (
                    <div className="flex items-center gap-2">
                       <Input type="number" value={form_data.years_experience} onChange={e => set_form_data({...form_data, years_experience: Number(e.target.value)})} className="h-8 text-sm w-20" />
                       <span className="text-xs text-zinc-500">Years</span>
                    </div>
                 ) : (
                    <div className="text-sm font-medium text-zinc-700">{form_data.years_experience} Years</div>
                 )}
              </div>
           )}
        </div>

        {is_editing && is_expert && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3 md:col-span-2">
                 <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Professional Bio</Label>
                 <Textarea
                    value={form_data.bio}
                    onChange={(e) => set_form_data({ ...form_data, bio: e.target.value })}
                    placeholder="Share your expertise, key achievements, and what you are looking for..."
                    className="min-h-[120px] bg-zinc-50/50 resize-y"
                 />
              </div>

              <div className="space-y-3">
                  <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Availability Status</Label>
                  <select 
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                      value={form_data.availability_status}
                      onChange={(e) => set_form_data({ ...form_data, availability_status: e.target.value })}
                  >
                      <option value="open">Open to Opportunities</option>
                      <option value="limited">Limited Availability</option>
                      <option value="booked">Currently Booked</option>
                  </select>
              </div>

              <div className="space-y-3">
                  <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Timezone</Label>
                  <Input 
                      value={form_data.timezone} 
                      onChange={(e) => set_form_data({ ...form_data, timezone: e.target.value })}
                      placeholder="e.g. UTC-5, EST, GMT+1"
                  />
              </div>
           </div>
        )}

        {!is_editing && is_expert && form_data.bio && (
           <div className="pt-6 border-t border-zinc-100">
              <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2 block">About</Label>
              <p className="text-sm leading-relaxed text-zinc-600 max-w-4xl whitespace-pre-wrap">{form_data.bio}</p>
           </div>
        )}

        {!is_editing && (
            <Button variant="outline" onClick={() => set_is_editing(true)} className="w-full mt-6 md:hidden">
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
        )}

      </div>
    </div>
  );
}