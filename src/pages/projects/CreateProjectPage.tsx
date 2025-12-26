import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Rocket, 
  ShieldAlert, 
  Target, 
  Check, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';


// UI Components Mocks (Tailwind-based)
const Button = ({ children, variant = 'default', className = '', ...props }: any) => {
  const variants: any = {
    default: 'bg-zinc-900 text-white hover:bg-zinc-800',
    outline: 'border border-zinc-200 bg-transparent hover:bg-zinc-100',
    ghost: 'hover:bg-zinc-100 text-zinc-600',
  };
  return (
    <button className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 ${className}`} {...props} />
);

const Textarea = ({ className = '', ...props }: any) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 ${className}`} {...props} />
);

const Label = ({ children, className = '' }: any) => (
  <label className={`text-sm font-medium leading-none ${className}`}>{children}</label>
);

const Card = ({ children, className = '' }: any) => <div className={`rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }: any) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }: any) => <p className="text-sm text-zinc-500">{children}</p>;
const CardContent = ({ children, className = '' }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Checkbox = ({ checked, ...props }: any) => (
  <div className={`h-4 w-4 rounded border border-zinc-300 flex items-center justify-center ${checked ? 'bg-zinc-900 border-zinc-900' : 'bg-white'}`} {...props}>
    {checked && <Check className="h-3 w-3 text-white" />}
  </div>
);

// Form Select Mock
const Select = ({ children, value, onValueChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full">
      <div onClick={() => setIsOpen(!isOpen)} className="flex h-12 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm cursor-pointer">
        <span>{value || "Select option"}</span>
        <ChevronRight className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white p-1 shadow-md">
          {React.Children.map(children, child => 
            React.cloneElement(child, { onClick: (val: any) => { onValueChange(val); setIsOpen(false); } })
          )}
        </div>
      )}
    </div>
  );
};
const SelectTrigger = ({ children }: any) => children;
const SelectValue = ({ placeholder, value }: any) => <span>{value || placeholder}</span>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ children, value, onClick }: any) => (
  <div onClick={() => onClick(value)} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-zinc-100">
    {children}
  </div>
);

// Constants
const domainLabels: Record<string, string> = {
  biotech: 'Biotechnology',
  energy: 'Energy Systems',
  quantum: 'Quantum Computing',
  materials: 'Advanced Materials',
  aerospace: 'Aerospace Engineering'
};

const trlDescriptions: Record<number, string> = {
  1: 'Basic principles observed',
  2: 'Technology concept formulated',
  3: 'Experimental proof of concept',
  4: 'Technology validated in lab',
  5: 'Technology validated in relevant environment',
  6: 'Technology demonstrated in relevant environment',
  7: 'System prototype demonstration in operational environment',
  8: 'System complete and qualified',
  9: 'Actual system proven in operational environment'
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Local implementation of hooks for preview stability
  const user = { role: 'buyer' };
  const createProject = {
    mutateAsync: async (data: any) => {
      console.log('Project Data:', data);
      return new Promise(resolve => setTimeout(resolve, 1500));
    },
    isPending: false
  };

  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    description: '',
    trl_level: 4,
    risk_categories: [] as string[],
    expected_outcome: '',
    budget_min: '',
    budget_max: '',
  });

  const handleSubmit = async () => {
    try {
      await createProject.mutateAsync({
        ...formData,
        budget_min: Number(formData.budget_min) || 0,
        budget_max: Number(formData.budget_max) || 0,
        status: 'draft',
      });
      alert('Draft Saved Successfully!');
      navigate('/projects');
    } catch (error: any) {
      const isDuplicate = error.message?.includes('unique') || error.message?.includes('already exists');
      alert(isDuplicate ? 'Duplicate Title Error' : 'Submission Failed');
    }
  };

  const toggleRisk = (risk: string) => {
    setFormData(prev => ({
      ...prev,
      risk_categories: prev.risk_categories.includes(risk)
        ? prev.risk_categories.filter(r => r !== risk)
        : [...prev.risk_categories, risk],
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Button 
          variant="ghost" 
          onClick={() => {}} 
          className="mb-8 text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Step Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 space-y-2">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${s <= step ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
              <p className={`text-[10px] uppercase font-bold tracking-wider ${s === step ? 'text-zinc-900' : 'text-zinc-400'}`}>
                Step 0{s}
              </p>
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="h-12 w-12 rounded-xl bg-zinc-900/10 flex items-center justify-center mb-2">
                <Rocket className="h-6 w-6 text-zinc-900" />
              </div>
              <CardTitle className="text-2xl font-bold">Define the Mission</CardTitle>
              <CardDescription>Establish the core objectives and technical domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Project Title</Label>
                <Input 
                  placeholder="e.g., Quantum-Safe Encryption" 
                  value={formData.title} 
                  onChange={(e: any) => setFormData(p => ({ ...p, title: e.target.value }))} 
                  className="h-12 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Scientific Domain</Label>
                <Select 
                  value={formData.domain ? domainLabels[formData.domain] : ''} 
                  onValueChange={(v: string) => setFormData(p => ({ ...p, domain: v }))}
                >
                  <SelectContent>
                    {Object.entries(domainLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Technical Challenge</Label>
                <Textarea 
                  placeholder="Describe the problem you are solving..." 
                  rows={6} 
                  value={formData.description} 
                  onChange={(e: any) => setFormData(p => ({ ...p, description: e.target.value }))} 
                  className="bg-white resize-none"
                />
              </div>
              <Button 
                className="w-full h-12 text-md font-bold" 
                onClick={() => setStep(2)} 
                disabled={!formData.title || !formData.domain || !formData.description}
              >
                Next Configuration <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                <ShieldAlert className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Technical Maturity & Risks</CardTitle>
              <CardDescription>Quantify the current stage and potential bottlenecks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Current TRL Level</Label>
                <Select 
                  value={`TRL ${formData.trl_level}: ${trlDescriptions[formData.trl_level]}`} 
                  onValueChange={(v: string) => setFormData(p => ({ ...p, trl_level: Number(v) }))}
                >
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9].map(l => (
                      <SelectItem key={l} value={String(l)}>
                        TRL {l}: {trlDescriptions[l]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Anticipated Risk Profiles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['technical', 'regulatory', 'scale', 'market'].map(risk => (
                    <div 
                      key={risk} 
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.risk_categories.includes(risk) 
                          ? 'border-zinc-900 bg-zinc-50' 
                          : 'border-transparent bg-zinc-100 hover:bg-zinc-200'
                      }`}
                      onClick={() => toggleRisk(risk)}
                    >
                      <Checkbox checked={formData.risk_categories.includes(risk)} />
                      <span className="text-sm font-semibold capitalize">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 font-bold">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-12 font-bold">Finalize <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Target & Budget</CardTitle>
              <CardDescription>Define success and allocate resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Expected Outcome</Label>
                <Textarea 
                  placeholder="Define what success looks like for this project..." 
                  rows={4} 
                  value={formData.expected_outcome} 
                  onChange={(e: any) => setFormData(p => ({ ...p, expected_outcome: e.target.value }))} 
                  className="bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-zinc-400">Min Budget ($)</Label>
                  <Input type="number" value={formData.budget_min} onChange={(e: any) => setFormData(p => ({ ...p, budget_min: e.target.value }))} className="h-12 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-zinc-400">Max Budget ($)</Label>
                  <Input type="number" value={formData.budget_max} onChange={(e: any) => setFormData(p => ({ ...p, budget_max: e.target.value }))} className="h-12 bg-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 font-bold">Back</Button>
                <Button onClick={handleSubmit} className="flex-1 h-12 font-bold bg-zinc-900 text-white">
                  {createProject.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Project Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}