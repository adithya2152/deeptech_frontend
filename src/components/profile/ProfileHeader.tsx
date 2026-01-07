import { useEffect, useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Mail, Edit, Globe, Loader2, Link as LinkIcon, Clock, Camera, Image as ImageIcon, Trash2, Edit2, Upload, MapPin, Plus, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

import { domainLabels, TIMEZONES } from '@/lib/constants'
import { ImageCropperModal } from '@/components/shared/ImageCropperModal'

interface ProfileHeaderProps {
  form_data: any
  set_form_data: (data: any) => void
  is_editing: boolean
  set_is_editing: (v: boolean) => void
  is_buyer: boolean
  is_expert: boolean
  user_email: string

  onSaveAvatar: (file: File) => Promise<void>
  onSaveBanner: (file: File) => Promise<void>
  onRemoveAvatar: () => Promise<void>
  onRemoveBanner: () => Promise<void>

  savingAvatar?: boolean
  savingBanner?: boolean
}

export function ProfileHeader({
  form_data,
  set_form_data,
  is_editing,
  set_is_editing,
  is_buyer,
  is_expert,
  user_email,
  onSaveAvatar,
  onSaveBanner,
  onRemoveAvatar,
  onRemoveBanner,
  savingAvatar = false,
  savingBanner = false,
}: ProfileHeaderProps) {
  const [cropOpen, setCropOpen] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropType, setCropType] = useState<'avatar' | 'banner' | null>(null)

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const normalizeTimezone = (tz?: string) => {
    if (!tz) return tz
    if (tz === 'Asia/Calcutta') return 'Asia/Kolkata'
    return tz
  }

  useEffect(() => {
    const detected = normalizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)

    set_form_data((prev: any) => {
      const nextTz = prev.timezone ? normalizeTimezone(prev.timezone) : detected
      if (prev.timezone === nextTz) return prev
      return { ...prev, timezone: nextTz }
    })
  }, [])

  const getAccountDescription = () => {
    if (is_buyer) return 'Hiring Deep Tech Experts'
    if (form_data.domains && form_data.domains.length > 0) {
      const primaryDomain = form_data.domains[0]
      const label = domainLabels[primaryDomain] || primaryDomain
      return `${label} Expert`
    }
    return 'Deep Tech Expert'
  }

  const cropBusy = useMemo(() => {
    if (cropType === 'avatar') return savingAvatar
    if (cropType === 'banner') return savingBanner
    return false
  }, [cropType, savingAvatar, savingBanner])

  const openCropper = (type: 'avatar' | 'banner', file: File) => {
    setCropType(type)
    setCropFile(file)
    setCropOpen(true)
  }

  const closeCropper = () => {
    setCropOpen(false)
    setCropFile(null)
    setCropType(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return
    openCropper(type, file)
    e.target.value = '' 
  }

  const handleAvatarClick = () => {
    if (savingAvatar) return
    setAvatarDialogOpen(true)
  }

  const handleAvatarUpdateClick = () => {
    avatarInputRef.current?.click()
    setAvatarDialogOpen(false)
  }

  const handleAvatarRemoveClick = async () => {
    await onRemoveAvatar()
    setAvatarDialogOpen(false)
  }

  const hasBanner = !!form_data.banner_url
  const hasAvatar = !!form_data.avatar_url

  return (
    <div className="relative group bg-white shadow-md rounded-md">
      <div className="h-48 w-full relative bg-zinc-100 overflow-hidden group/banner rounded-t-md">
        {hasBanner ? (
          <img src={form_data.banner_url} alt="Profile Banner" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          </>
        )}

        <div className="absolute top-4 right-4 z-20">
          {hasBanner ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 bg-white/90 hover:bg-white text-zinc-800 backdrop-blur-md shadow-sm border border-white/20"
                  disabled={savingBanner}
                >
                  {savingBanner ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => bannerInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemoveBanner} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-3 bg-zinc-900/50 hover:bg-zinc-900/70 text-white border-white/10 backdrop-blur-md"
              onClick={() => bannerInputRef.current?.click()}
              disabled={savingBanner}
            >
              {savingBanner ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Add Banner
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 items-start">
          <div className="relative shrink-0 group/avatar">
            <div 
              className={cn(
                "rounded-2xl p-1.5 bg-white shadow-lg relative cursor-pointer transition-transform active:scale-95",
                savingAvatar && "opacity-80 pointer-events-none"
              )}
              onClick={handleAvatarClick}
            >
              <Avatar className="h-32 w-32 rounded-xl">
                <AvatarImage src={form_data.avatar_url} className="object-cover" />
                <AvatarFallback className="rounded-xl text-3xl font-bold text-zinc-300 bg-zinc-100">
                  {form_data.first_name?.[0]}
                  {form_data.last_name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl">
                 <Camera className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              
              {savingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                </div>
              )}
            </div>
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
                  <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                    {form_data.first_name} {form_data.last_name}
                  </h2>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">
                    {getAccountDescription()}
                  </Badge>

                  {is_expert ? (
                    is_editing ? (
                      <Select
                        value={form_data.availability_status}
                        onValueChange={(v) => set_form_data({ ...form_data, availability_status: v })}
                      >
                        <SelectTrigger className="h-7 px-2 text-xs w-[120px]">
                          <SelectValue placeholder="Availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Available</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs ${
                          form_data.availability_status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : form_data.availability_status === 'limited'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            form_data.availability_status === 'open'
                              ? 'bg-emerald-500'
                              : form_data.availability_status === 'limited'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                        />
                        {form_data.availability_status === 'open'
                          ? 'Available'
                          : form_data.availability_status === 'limited'
                            ? 'Limited'
                            : 'Booked'}
                      </Badge>
                    )
                  ) : null}
                </div>
              </div>

              {!is_editing ? (
                <Button
                  onClick={() => set_is_editing(true)}
                  variant="outline"
                  className="hidden md:flex bg-white hover:bg-zinc-300 border-zinc-200 text-zinc-700 shadow-sm"
                >
                  <Edit className="h-3.5 w-3.5 mr-2" /> Edit Profile
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-zinc-100">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email
            </Label>
            <div className="text-sm font-medium text-zinc-700 truncate" title={user_email}>
              {user_email}
            </div>
          </div>

          {is_expert ? (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" /> Timezone
              </Label>

              {is_editing ? (
                <Select value={form_data.timezone} onValueChange={(v) => set_form_data({ ...form_data, timezone: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium text-zinc-700">
                  {TIMEZONES.find((t) => t.value === normalizeTimezone(form_data.timezone))?.label || '—'}
                </div>
              )}
            </div>
          ) : null}

          {is_expert ? (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <LinkIcon className="w-3 h-3" /> Portfolio
              </Label>

              {is_editing ? (
                <Input
                  value={form_data.portfolio_url}
                  onChange={(e) => set_form_data({ ...form_data, portfolio_url: e.target.value })}
                  className="h-8 text-sm"
                  placeholder="https://"
                />
              ) : form_data.portfolio_url ? (
                <a
                  href={form_data.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  Visit Website <Globe className="w-3 h-3" />
                </a>
              ) : (
                <div className="text-sm text-zinc-400">-</div>
              )}
            </div>
          ) : null}

          {is_expert ? (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" /> Experience
              </Label>

              {is_editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={form_data.years_experience}
                    onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                    onChange={(e) =>
                      set_form_data({ ...form_data, years_experience: Number(e.target.value) })
                    }
                    className="h-8 text-sm w-20"
                  />
                  <span className="text-xs text-zinc-500">Years</span>
                </div>
              ) : (
                <div className="text-sm font-medium text-zinc-700">{form_data.years_experience} Years</div>
              )}
            </div>
          ) : null}
        </div>

        {is_editing && is_expert ? (
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
          </div>
        ) : null}

        {!is_editing && is_expert && form_data.bio ? (
          <div className="pt-6 border-t border-zinc-100">
            <Label className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2 block">About</Label>
            <p className="text-sm leading-relaxed text-zinc-600 max-w-4xl whitespace-pre-wrap">{form_data.bio}</p>
          </div>
        ) : null}

        {!is_editing ? (
          <Button variant="outline" onClick={() => set_is_editing(true)} className="w-full mt-6 md:hidden">
            <Edit className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        ) : null}

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'avatar')}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'banner')}
        />

        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-center">Profile Photo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-6 py-4">
              <div className="relative">
                <Avatar className="h-40 w-40 rounded-full border-4 border-zinc-50 shadow-sm">
                  <AvatarImage src={form_data.avatar_url} className="object-cover" />
                  <AvatarFallback className="text-4xl">
                    {form_data.first_name?.[0]}
                    {form_data.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex flex-col w-full gap-2">
                <Button onClick={handleAvatarUpdateClick} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  {hasAvatar ? 'Update Photo' : 'Upload Photo'}
                </Button>
                
                {hasAvatar && (
                  <Button 
                    onClick={handleAvatarRemoveClick} 
                    variant="ghost" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ImageCropperModal
          open={cropOpen}
          onOpenChange={(v: boolean) => {
            if (!v) closeCropper()
            else setCropOpen(true)
          }}
          imageFile={cropFile}
          aspectRatio={cropType === 'avatar' ? 1 : 3 / 1}
          onCropComplete={async (croppedFile: File) => {
            if (!cropType) return
            if (cropBusy) return

            if (cropType === 'avatar') await onSaveAvatar(croppedFile)
            if (cropType === 'banner') await onSaveBanner(croppedFile)

            closeCropper()
          }}
        />
      </div>
    </div>
  )
}