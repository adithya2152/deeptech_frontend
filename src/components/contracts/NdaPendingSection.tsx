import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FileSignature, CheckCircle2, Loader2, ShieldCheck, Pencil, Eye, Send, Clock, Lock, UserCheck } from 'lucide-react';

interface NdaPendingSectionProps {
  isExpert: boolean;
  showNdaDialog: boolean;
  setShowNdaDialog: (open: boolean) => void;
  signature: string;
  setSignature: (value: string) => void;
  onSignNda: () => Promise<void>;
  signing: boolean;
  onDecline?: () => void;
  declining?: boolean;
  onSaveNda?: (content: string) => Promise<void>;
  initialNdaContent?: string;
  ndaStatus?: string;
  buyerName?: string;
  expertName?: string;
}

// --- CONSTANTS ---

const LOCKED_PREAMBLE = (buyer: string, expert: string, date: string) => `DEEPTECH PLATFORM

NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${date}, by and between:

${buyer}
(as identified on the DeepTech platform)
("Disclosing Party")

AND

${expert}
(as identified on the DeepTech platform)
("Receiving Party")

This Agreement is facilitated via DeepTech, an online freelancing marketplace, and governs confidentiality obligations between Buyers and Experts engaging through the platform.`;

const DEFAULT_PART_1 = `1. PURPOSE

The Disclosing Party may disclose certain Confidential Information to the Receiving Party solely for the purpose of evaluating, negotiating, or performing services under a freelance engagement initiated through DeepTech (the "Purpose").


2. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" means all non-public information disclosed by the Disclosing Party, whether before or after acceptance of this Agreement, including but not limited to:

• Business ideas, strategies, internal documents
• Technical information, architectures, system designs
• Source code, models, datasets, algorithms, APIs
• Product roadmaps, specifications, prototypes
• Financial data, pricing, contracts
• Customer, user, or personal data
• Credentials, access tokens, keys, secrets
• Any information reasonably understood to be confidential

Confidential Information includes derivatives, summaries, or analyses created from such information.


3. EXCLUSIONS

Confidential Information does not include information that the Receiving Party can prove:

a) Is publicly available without breach
b) Was lawfully known prior to disclosure
c) Is received from a third party without obligation
d) Is independently developed without use of Confidential Information


4. OBLIGATIONS OF THE RECEIVING PARTY

The Receiving Party agrees to:

a) Use Confidential Information only for the Purpose
b) Maintain confidentiality using industry-standard security practices
c) Not disclose Confidential Information to any third party without written consent
d) Restrict access to personnel strictly necessary for the Purpose
e) Prevent unauthorized copying, storage, or transmission


5. PROHIBITED ACTIONS

The Receiving Party shall not:

• Use Confidential Information for competitive or personal benefit
• Share information outside the DeepTech engagement
• Reverse engineer, decompile, or exploit Confidential Information
• Train AI/ML models on Confidential Information without written approval


6. INTELLECTUAL PROPERTY

All Confidential Information and related intellectual property remain the exclusive property of the Disclosing Party.
No rights or licenses are granted except as required for the Purpose.


7. DATA PROTECTION & SECURITY

Where Confidential Information includes personal or regulated data, the Receiving Party agrees to:

• Comply with all applicable data protection laws
• Process data only as instructed by the Disclosing Party
• Immediately notify of any data breach or unauthorized access


8. RETURN OR DESTRUCTION

Upon request or termination of the engagement, the Receiving Party shall promptly:

• Return or destroy all Confidential Information
• Permanently delete electronic copies
• Confirm destruction if requested


9. TERM

This Agreement remains effective:

• For [X] years after the last disclosure, and
• Indefinitely for trade secrets, source code, models, and sensitive technical data


10. REMEDIES

The Receiving Party acknowledges that breach may cause irreparable harm.
The Disclosing Party is entitled to injunctive relief, damages, and any remedies available under law.`;

const LOCKED_SECTION_11 = `11. PLATFORM ROLE (DEEPTECH)

DeepTech:

• Acts solely as a technology platform and facilitator
• Is not a party to this Agreement
• Bears no liability for breaches between Buyers and Experts
• May enforce compliance through platform actions (suspension, termination)`;

const DEFAULT_PART_2 = `12. GOVERNING LAW

This Agreement shall be governed by the laws of [Jurisdiction selected by Buyer or platform default], without regard to conflict of law principles.


13. ASSIGNMENT

The Receiving Party may not assign this Agreement without prior written consent of the Disclosing Party.


14. ENTIRE AGREEMENT

This Agreement constitutes the entire confidentiality agreement between the Parties for engagements on DeepTech and supersedes all prior confidentiality understandings.


15. ELECTRONIC ACCEPTANCE

Acceptance of this Agreement via the DeepTech platform (including click-through acceptance) constitutes a legally binding electronic signature.`;

const LOCKED_FOOTER = `ACCEPTED AND AGREED

Buyer (Disclosing Party)
Accepted electronically via DeepTech

Expert / Developer (Receiving Party)
Accepted electronically via DeepTech`;

// Helper to check if a line is a section header (e.g. "1. PURPOSE")
const isSectionHeader = (line: string) => /^\d+\.\s+[A-Z\s\W]+$/.test(line.trim());
const isListItem = (line: string) => /^[•\-]/.test(line.trim()) || /^[a-z]\)/.test(line.trim());

export function NdaPendingSection({
  isExpert,
  showNdaDialog,
  setShowNdaDialog,
  signature,
  setSignature,
  onSignNda,
  signing,
  onDecline,
  declining,
  onSaveNda,
  initialNdaContent,
  ndaStatus = 'draft',
  buyerName = "[Buyer Full Name]",
  expertName = "[Expert Full Name]"
}: NdaPendingSectionProps) {
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [fullContent, setFullContent] = useState<string>('');
  const [part1, setPart1] = useState(DEFAULT_PART_1);
  const [part2, setPart2] = useState(DEFAULT_PART_2);
  const [isEditing, setIsEditing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [savingAndSending, setSavingAndSending] = useState(false);

  // Initialize and Parse Content
  useEffect(() => {
    const preamble = LOCKED_PREAMBLE(buyerName, expertName, currentDate);
    
    if (initialNdaContent && initialNdaContent.length > 50) {
      setFullContent(initialNdaContent);

      const splitBySec11 = initialNdaContent.split(LOCKED_SECTION_11);
      
      if (splitBySec11.length === 2) {
        let pre11 = splitBySec11[0];
        let post11 = splitBySec11[1];

        if (pre11.includes('1. PURPOSE')) {
           const parts = pre11.split('1. PURPOSE');
           if (parts.length > 1) {
             setPart1('1. PURPOSE' + parts.slice(1).join('1. PURPOSE'));
           } else {
             setPart1(pre11);
           }
        }

        if (post11.includes('ACCEPTED AND AGREED')) {
           const parts = post11.split('ACCEPTED AND AGREED');
           setPart2(parts[0]);
        } else {
           setPart2(post11);
        }
      }
    } else {
      const combined = `${preamble}\n\n${DEFAULT_PART_1}\n\n${LOCKED_SECTION_11}\n\n${DEFAULT_PART_2}\n\n${LOCKED_FOOTER}`;
      setFullContent(combined);
      setPart1(DEFAULT_PART_1);
      setPart2(DEFAULT_PART_2);
    }
  }, [initialNdaContent, buyerName, expertName, currentDate]);

  const handleSaveAndSend = async () => {
    if (savingAndSending) return;
    const preamble = LOCKED_PREAMBLE(buyerName, expertName, currentDate);
    const finalContent = `${preamble.trim()}\n\n${part1.trim()}\n\n${LOCKED_SECTION_11}\n\n${part2.trim()}\n\n${LOCKED_FOOTER}`;

    try {
      setSavingAndSending(true);
      if (onSaveNda) {
        await onSaveNda(finalContent);
      }
      setFullContent(finalContent);
      setIsEditing(false);
      setShowNdaDialog(false);
    } finally {
      setSavingAndSending(false);
    }
  };

  // --- RENDERER ---
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;
      
      if (trimmed === 'NON-DISCLOSURE AGREEMENT') return <h1 key={i} className="text-xl font-bold text-center mt-6 mb-4 tracking-wide uppercase">{line}</h1>;
      if (trimmed === 'DEEPTECH PLATFORM') return <h2 key={i} className="text-xs text-center text-zinc-400 font-semibold tracking-[0.2em] mb-8">{line}</h2>;

      if (isSectionHeader(trimmed) || trimmed === 'ACCEPTED AND AGREED') return <h3 key={i} className="text-sm font-bold text-left mt-8 mb-3 uppercase tracking-wide">{line}</h3>;

      if (trimmed.includes('Accepted electronically via DeepTech')) return <div key={i} className="text-left text-xs text-zinc-500 italic mt-0">{line}</div>;
      if (trimmed.startsWith('Buyer (') || trimmed.startsWith('Expert / Developer (')) return <div key={i} className="text-left font-bold mt-6">{line}</div>;

      if (isListItem(trimmed)) return <div key={i} className="pl-8 pr-4 py-0.5 text-justify indent-[-1em]">{line}</div>;
      return <div key={i} className="text-justify leading-relaxed mb-2">{line}</div>;
    });
  };

  // 1. EXPERT VIEW: Waiting for Buyer
  if (isExpert && ndaStatus === 'draft') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 bg-zinc-50 rounded-xl border border-zinc-100">
        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-zinc-100">
           <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
        </div>
        <div>
           <h2 className="text-xl font-bold text-zinc-900">Waiting for Buyer</h2>
           <p className="text-zinc-500 mt-2 max-w-md mx-auto">
             The buyer is currently reviewing and customizing the Non-Disclosure Agreement. 
             You will be notified once the NDA is ready for your signature.
           </p>
        </div>
      </div>
    );
  }

  // 2. BUYER VIEW: Waiting for Expert (Sent)
  if (!isExpert && ndaStatus === 'sent') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
           <Send className="h-8 w-8 text-blue-600" />
        </div>
        <div>
           <h2 className="text-xl font-bold text-zinc-900">NDA Sent to Expert</h2>
           <p className="text-zinc-500 mt-2 max-w-md mx-auto">
             The agreement has been sent to <strong>{expertName}</strong>. You will be notified once they review and sign the document.
           </p>
        </div>
        <div className="pt-4">
             <Button variant="outline" size="sm" className="text-xs" disabled>
                Locked until Signed
             </Button>
        </div>
      </div>
    );
  }

  // 3. MAIN VIEW
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 text-center bg-zinc-50 rounded-xl border border-zinc-100 p-8">
      <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <ShieldCheck className="h-8 w-8 text-blue-600" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900">
          Action Required: Contract Activation
        </h2>
        <p className="text-zinc-500 max-w-lg mx-auto">
          To protect intellectual property, a Mutual Non-Disclosure Agreement (NDA) must be signed. 
          {!isExpert 
            ? " Review and customize the agreement below before sending it to the expert." 
            : " Please review the agreement below to proceed."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Dialog open={showNdaDialog} onOpenChange={setShowNdaDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="min-w-[200px] bg-blue-600 hover:bg-blue-700">
              {!isExpert ? (
                <>
                   <Pencil className="h-4 w-4 mr-2" />
                   Review & Send NDA
                </>
              ) : (
                <>
                   <FileSignature className="h-4 w-4 mr-2" />
                   Review & Sign NDA
                </>
              )}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-100">
            <DialogHeader className="p-4 border-b bg-white shrink-0 shadow-sm z-10">
              <DialogTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Mutual Non-Disclosure Agreement
                </span>
                {!isExpert && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Preview Mode' : 'Edit Mode'}
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden relative">
              <ScrollArea className="h-full w-full">
                <div className="py-8 px-4 flex justify-center min-h-full">
                  {!isEditing ? (
                    // --- PREVIEW / READ ONLY MODE ---
                    <div className="w-full max-w-[816px] bg-white shadow-lg border border-zinc-200 min-h-[1056px] mx-auto relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none">
                         <ShieldCheck className="w-32 h-32 text-zinc-900" />
                      </div>
                      <div className="p-[80px] font-serif text-zinc-900 text-[11pt] leading-[1.6]">
                        {renderText(fullContent)}
                      </div>
                      <div className="absolute bottom-4 w-full text-center text-[10px] text-zinc-400 font-sans">
                        Page 1 of 1 • DeepTech Secured Contract
                      </div>
                    </div>
                  ) : (
                    // --- EDIT MODE (UNIFIED PAPER UI) ---
                    <div className="w-full max-w-[816px] bg-white shadow-lg border border-zinc-200 min-h-[1056px] mx-auto relative flex flex-col">
                        <div className="p-[80px] pb-10 font-serif text-zinc-900 text-[11pt] leading-[1.6]">
                            
                            {/* LOCKED PREAMBLE */}
                            <div className="relative group cursor-not-allowed">
                                {renderText(LOCKED_PREAMBLE(buyerName, expertName, currentDate))}
                                <div className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Lock className="w-4 h-4 text-zinc-300" />
                                </div>
                            </div>

                            {/* EDITABLE PART 1 */}
                            <div className="mt-4 relative group">
                                <Label className="absolute -top-3 left-0 bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-sans">
                                    <Pencil className="w-3 h-3" /> Editable Area
                                </Label>
                                <Textarea 
                                    value={part1} 
                                    onChange={(e) => setPart1(e.target.value)}
                                    className="w-full min-h-[500px] font-serif text-[11pt] leading-[1.6] resize-y border-0 border-b border-dashed border-zinc-200 focus-visible:ring-0 focus-visible:border-blue-300 rounded-none px-0 py-2 -ml-0.5 placeholder:text-zinc-300"
                                    placeholder="Enter contract terms here..."
                                />
                            </div>

                            {/* LOCKED SECTION 11 */}
                            <div className="mt-4 relative group cursor-not-allowed select-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.01)_10px,rgba(0,0,0,0.01)_20px)]">
                                {renderText(LOCKED_SECTION_11)}
                                <div className="absolute -left-6 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Lock className="w-4 h-4 text-zinc-300" />
                                </div>
                            </div>

                            {/* EDITABLE PART 2 */}
                            <div className="mt-4 relative group">
                                <Label className="absolute -top-3 left-0 bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-sans">
                                    <Pencil className="w-3 h-3" /> Editable Area
                                </Label>
                                <Textarea 
                                    value={part2} 
                                    onChange={(e) => setPart2(e.target.value)}
                                    className="w-full min-h-[200px] font-serif text-[11pt] leading-[1.6] resize-y border-0 border-b border-dashed border-zinc-200 focus-visible:ring-0 focus-visible:border-blue-300 rounded-none px-0 py-2 -ml-0.5 placeholder:text-zinc-300"
                                    placeholder="Enter additional terms here..."
                                />
                            </div>

                            {/* LOCKED FOOTER */}
                            <div className="mt-8 relative group cursor-not-allowed">
                                {renderText(LOCKED_FOOTER)}
                                <div className="absolute -left-6 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Lock className="w-4 h-4 text-zinc-300" />
                                </div>
                            </div>

                        </div>
                        
                        <div className="absolute bottom-4 w-full text-center text-[10px] text-zinc-400 font-sans">
                            Page 1 of 1 • DeepTech Secured Contract • Edits Automatically Saved
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 border-t bg-white z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {!isExpert ? (
                // BUYER FOOTER
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setShowNdaDialog(false)} disabled={savingAndSending}>Cancel</Button>
                  <Button onClick={handleSaveAndSend} disabled={savingAndSending} className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-md transition-all">
                    {savingAndSending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Save & Send to Expert</>
                    )}
                  </Button>
                </DialogFooter>
              ) : (
                // EXPERT FOOTER - REDESIGNED
                <div className="w-full space-y-4">
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 space-y-5 shadow-sm">
                    {/* 1. Signature Field */}
                    <div>
                      <Label htmlFor="signature" className="text-sm font-bold text-zinc-900 mb-2 block uppercase tracking-wide">
                        Digital Signature
                      </Label>
                      <Input
                        id="signature"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Type your full legal name"
                        className="bg-white h-11 text-lg font-serif italic border-blue-200 focus-visible:ring-blue-500 shadow-sm placeholder:font-sans placeholder:not-italic placeholder:text-zinc-400 placeholder:text-sm"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5 ml-1">
                        By typing your name, you are executing this agreement electronically.
                      </p>
                    </div>

                    {/* 2. Checkbox (Distinct Row) */}
                    <div className="flex items-start gap-3 pt-2 border-t border-blue-100/50">
                      <Checkbox 
                        id="confirm" 
                        checked={termsAccepted}
                        onCheckedChange={(c) => setTermsAccepted(!!c)}
                        className="mt-0.5 border-zinc-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                      />
                      <Label htmlFor="confirm" className="text-sm text-zinc-700 font-normal leading-relaxed cursor-pointer select-none">
                        I confirm that I have read the Non-Disclosure Agreement in its entirety, understood its terms, and agree to be bound by them.
                      </Label>
                    </div>
                  </div>
                   
                  {/* 3. Actions */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
                    <Button variant="outline" onClick={() => setShowNdaDialog(false)} className="h-11">Cancel</Button>
                    <Button 
                      onClick={onSignNda} 
                      disabled={!signature || !termsAccepted || signing}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all min-w-[180px] h-11 font-medium text-base"
                    >
                      {signing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing...</>
                      ) : (
                        <><CheckCircle2 className="mr-2 h-5 w-5" /> Sign Agreement</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {onDecline && (
          <Button
            size="lg"
            variant="outline"
            className="min-w-[200px] border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={onDecline}
            disabled={!!declining}
          >
            {declining ? 'Processing...' : 'Decline Contract'}
          </Button>
        )}
      </div>
    </div>
  );
}