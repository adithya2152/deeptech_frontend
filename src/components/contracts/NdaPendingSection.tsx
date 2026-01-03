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
import { FileSignature, CheckCircle2, Loader2, ShieldCheck, Pencil, Eye, Send, Clock } from 'lucide-react';

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
  contractId?: string; // Optional if not used
}

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
  buyerName = "[Buyer Name]",
  expertName = "[Expert Name]"
}: NdaPendingSectionProps) {
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Template derived from "Startrit Infratech NDA Arush.pdf"
  const DEFAULT_NDA_TEMPLATE = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (hereinafter "Agreement") is entered into as of ${currentDate} (the "Effective Date") between:

${buyerName} (hereinafter collectively or individually referred to as the "Disclosing Party");

AND

${expertName} (hereinafter collectively or individually referred to as the "Receiving Party" or "Recipient").

(Collectively referred to as the "Parties").

In consideration of the mutual promises and agreements contained in this Agreement, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

1. DEFINITIONS
1.1 Intellectual Property "IP" shall mean any and all (i) inventions; patents; patent applications, whether published or unpublished; copyrightable works; copyrights; copyright applications; copyright registrations; and trade secrets, including technical and non-technical information, and (ii) rights in, under, or to any and all of the foregoing.
1.2 "Confidential Information" of the Disclosing Party shall mean information whether intangible or embodied in tangible form that is not publicly available and the unauthorized publication of which reasonably would be considered prejudicial to Disclosing Party's interests. By way of example and not limitation, Confidential Information may include information derived from or pertaining to any and all techniques; sketches; drawings; models; know-how; processes; apparatus; equipment; algorithms; software programs; software source documents; formulae; information concerning research, experimental work, synthesis, formulation composition, manufacturing methods, design details, structures; and specifications; engineering information; financial information; procurement requirements; good manufacturing practice; purchasing; manufacturing; customer lists; business forecasts; sales and merchandising; marketing plans; business strategies; Derivative Inventions; and any Intellectual property.

2. CONFIDENTIALITY
Recipient shall hold in trust and shall not use, disseminate, copy, reverse engineer or in any manner disclose any Confidential Information in any manner whatsoever to any natural person or legal entity, except as provided herein, and shall hold and maintain the Confidential Information in strictest confidence. Recipient hereby agrees to indemnify Disclosing Party against any and all losses, damages, claims, expenses, and attorneys' fees (including consequential and indirect losses) incurred or suffered by Disclosing Party as a result of a breach of this Agreement by Recipient or its Representatives.

3. PURPOSE
The Receiving Party may use the Confidential Information solely for the purpose of the Project/Engagement ("Purpose") intended along with the disclosing party only.

4. OBLIGATIONS OF THE RECEIVING PARTY
The Receiving Party shall disclose Confidential Information only to its Representatives who (i) have a need to access such Confidential Information solely for the Purpose, and (ii) have been advised of the obligations of confidentiality. The Receiving Party shall protect the Confidential Information by using the same degree of care, but no less than a reasonable degree of care, as the Receiving Party uses to protect its own confidential information. Further, the Receiving Party shall not reverse engineer, decompile, disassemble modify or copy any Confidential Information disclosed.

5. EXCLUSIONS
This Agreement imposes no obligation upon the Receiving Party with respect to Confidential Information which: (i) is a part of or enters into the public domain other than as a result of a disclosure by the Receiving Party; (ii) was already in the Receiving Party's possession prior to the date of disclosure; (iii) is rightfully received by the Receiving Party on a non-confidential basis from a third party; (iv) is independently developed by the Receiving Party without use of the Confidential Information.

6. REQUEST OR REQUIREMENT TO DISCLOSE
In the event that any Receiving Party is requested or required by legal process to disclose any Confidential Information, the Receiving Party shall provide the Disclosing Party with prompt written notice so that the Disclosing Party may seek a protective order or waive compliance.

7. USE NO RIGHTS
7.1 Recipient shall use the Confidential Information solely for the Purpose and shall not in any way use it to the detriment of Disclosing Party.
7.2 No explicit or implicit rights in the Confidential Information are assigned or licensed to Recipient. Any Derivative Invention conceived by Recipient based on the Confidential Information shall be exclusively owned by Disclosing Party.

8. WARRANTY
All Confidential Information is provided "AS IS" without any warranty regarding its accuracy or performance. Recipient agrees that Disclosing Party shall have no liability relating to or resulting from the use of any Confidential Information.

9. TERM AND TERMINATION
This Agreement shall be valid from the Effective Date. Each Party's obligations with respect to the Confidential Information hereunder shall survive termination for a period of five years. Upon termination, Receiving Party shall return or destroy all Confidential Information.

10. PROPRIETARY RIGHTS
Disclosing Party shall retain all right, title and interest to its own Confidential Information. No license under any trademark, patent, or copyright is granted or implied by the disclosure of Confidential Information.

11. INJUNCTIVE RELIEF
The Recipient acknowledges that a breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. The Disclosing Party shall be entitled to seek injunctive relief to restrain such breach.

12. INDEPENDENT DEVELOPMENT
Nothing in this Agreement shall be construed to preclude Receiving party from developing, using, marketing, licensing, and/or selling any product or service that is developed without use of the Confidential Information of the Disclosing Party.

13. GENERAL
a) This Agreement sets forth the entire agreement with respect to the Confidential Information.
b) This Agreement may be executed in counterparts.
c) This Agreement shall be governed by the laws of the jurisdiction of the Disclosing Party.

IN WITNESS WHEREOF, the Parties have duly executed this Agreement.`;

  const [ndaContent, setNdaContent] = useState(initialNdaContent || DEFAULT_NDA_TEMPLATE);
  const [isEditing, setIsEditing] = useState(false);

  // Sync content if prop changes
  useEffect(() => {
    if (initialNdaContent) {
      setNdaContent(initialNdaContent);
    }
  }, [initialNdaContent]);

  const handleSaveAndSend = async () => {
    if (onSaveNda) {
      await onSaveNda(ndaContent);
    }
    setIsEditing(false);
    setShowNdaDialog(false);
  };

  // 1. EXPERT VIEW: Waiting for Buyer
  if (isExpert && ndaStatus === 'draft') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
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

  // 2. MAIN VIEW (Buyer Edit or Expert Sign)
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 text-center bg-zinc-50/50 rounded-xl border border-zinc-100 p-8">
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
          
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b bg-white shrink-0">
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>Mutual Non-Disclosure Agreement</span>
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
              <DialogDescription>
                {!isExpert 
                  ? "Customize the terms below. This exact text will be presented to the expert." 
                  : "Please read the agreement carefully before signing."}
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden bg-zinc-100 relative">
              <ScrollArea className="h-full w-full">
                <div className="p-4 sm:p-8 max-w-3xl mx-auto">
                  {!isEditing ? (
                    <div className="prose prose-sm max-w-none font-serif text-zinc-900 whitespace-pre-wrap leading-relaxed p-8 bg-white border shadow-sm min-h-[600px]">
                      {ndaContent}
                    </div>
                  ) : (
                    <Textarea
                      value={ndaContent}
                      onChange={(e) => setNdaContent(e.target.value)}
                      className="min-h-[600px] font-mono text-sm leading-relaxed p-6 resize-none focus-visible:ring-0 border-zinc-300 bg-white shadow-sm"
                      placeholder="Enter NDA terms here..."
                    />
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="p-6 border-t bg-white z-10 shrink-0">
              {!isExpert ? (
                // BUYER FOOTER
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setShowNdaDialog(false)}>Cancel</Button>
                  <Button onClick={handleSaveAndSend} className="bg-zinc-900 text-white hover:bg-zinc-800">
                    <Send className="h-4 w-4 mr-2" />
                    Send to Expert
                  </Button>
                </DialogFooter>
              ) : (
                // EXPERT FOOTER
                <div className="space-y-4">
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="signature" className="font-semibold text-zinc-900">Digital Signature</Label>
                      <p className="text-xs text-zinc-500">
                        By typing your full legal name, you agree to be bound by the terms above.
                      </p>
                    </div>
                    <Input
                      id="signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Type your full legal name"
                      className="bg-white border-zinc-300 focus-visible:ring-blue-500 font-mono"
                    />
                    <div className="flex items-start space-x-3 pt-1">
                      <Checkbox id="confirm" className="mt-1 border-zinc-400 data-[state=checked]:bg-blue-600" />
                      <Label htmlFor="confirm" className="text-xs text-zinc-600 font-normal cursor-pointer leading-tight">
                        I confirm I have read the NDA and agree to its terms. I understand this action constitutes a legal signature binding me to this agreement.
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowNdaDialog(false)}>Cancel</Button>
                    <Button
                      onClick={onSignNda}
                      disabled={!signature || signing}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
                    >
                      {signing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing...</>
                      ) : (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Sign & Activate</>
                      )}
                    </Button>
                  </DialogFooter>
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