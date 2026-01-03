import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, Rocket, Target, Star } from 'lucide-react';

interface ServiceRatesProps {
  form_data: any;
  set_form_data: (data: any) => void;
  is_editing: boolean;
}

export function ServiceRates({ form_data, set_form_data, is_editing }: ServiceRatesProps) {
  return (
    <Card className="border-zinc-200 shadow-sm mt-6">
       <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <DollarSign className="h-4 w-4 text-zinc-400" /> Engagement Rates (Average)
             </div>
             {is_editing && (
                 <div className="w-48">
                    <Select 
                        value={form_data.preferred_engagement_mode} 
                        onValueChange={(val) => set_form_data({...form_data, preferred_engagement_mode: val})}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Preferred Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Prefers Daily Rate</SelectItem>
                            <SelectItem value="sprint">Prefers Sprint</SelectItem>
                            <SelectItem value="fixed">Prefers Fixed</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                  <Label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Daily Rate
                  </Label>
                  <Input 
                      type="number"
                      value={form_data.avg_daily_rate}
                      onChange={(e) => set_form_data({...form_data, avg_daily_rate: Number(e.target.value)})}
                      disabled={!is_editing}
                      className="border-zinc-200 bg-white"
                  />
                  <p className="text-[10px] text-zinc-400 text-right">Per day</p>
              </div>
              <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                  <Label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                      <Rocket className="h-3 w-3" /> Sprint Rate
                  </Label>
                  <Input 
                      type="number"
                      value={form_data.avg_sprint_rate}
                      onChange={(e) => set_form_data({...form_data, avg_sprint_rate: Number(e.target.value)})}
                      disabled={!is_editing}
                      className="border-zinc-200 bg-white"
                  />
                  <p className="text-[10px] text-zinc-400 text-right">Per 2-week sprint</p>
              </div>
              <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                  <Label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Fixed Project
                  </Label>
                  <Input 
                      type="number"
                      value={form_data.avg_fixed_rate}
                      onChange={(e) => set_form_data({...form_data, avg_fixed_rate: Number(e.target.value)})}
                      disabled={!is_editing}
                      className="border-zinc-200 bg-white"
                  />
                  <p className="text-[10px] text-zinc-400 text-right">Minimum Start</p>
              </div>
          </div>
       </CardContent>
    </Card>
  );
}