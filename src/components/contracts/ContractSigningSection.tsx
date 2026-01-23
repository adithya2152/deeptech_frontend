import { useState } from 'react';
import { Contract } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/useCurrency';
import { Check, X, Calendar, DollarSign, PenTool } from 'lucide-react';
import { format } from 'date-fns';

interface ContractSigningSectionProps {
    contract: Contract;
    isBuyer: boolean;
    onSign: (signature: string) => void;
    onDecline: () => void;
    isProcessing: boolean;
}

export function ContractSigningSection({ contract, isBuyer, onSign, onDecline, isProcessing }: ContractSigningSectionProps) {
    const [signature, setSignature] = useState('');
    const [error, setError] = useState('');
    const { convertAndFormat } = useCurrency();

    const getRateDisplay = () => {
        const terms = (contract.payment_terms as any) || {};
        const currency = contract.currency || 'INR';
        switch (contract.engagement_model) {
            case 'hourly':
                return { rate: convertAndFormat(terms.hourly_rate || 0, currency), unit: '/hr', detail: `${terms.estimated_hours || 0} est. hours` };
            case 'daily':
                return { rate: convertAndFormat(terms.daily_rate || 0, currency), unit: '/day', detail: `${terms.total_days || 0} days` };
            case 'sprint':
                return { rate: convertAndFormat(terms.sprint_rate || 0, currency), unit: '/sprint', detail: `${terms.total_sprints || 0} sprints` };
            case 'fixed':
                return { rate: convertAndFormat(terms.total_amount || 0, currency), unit: ' total', detail: 'Fixed Price' };
            default:
                return { rate: 'N/A', unit: '', detail: '' };
        }
    };

    const { rate, unit, detail } = getRateDisplay();

    const handleSign = () => {
        if (signature.trim().length < 3) {
            setError("Please enter your full name as signature");
            return;
        }
        onSign(signature);
    };

    return (
        <Card className="border-purple-500/20 shadow-md">
            <CardHeader className="bg-purple-500/5 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl text-purple-700 dark:text-purple-400">
                            {isBuyer ? "Sign Service Agreement" : "Review & Sign Agreement"}
                        </CardTitle>
                        <CardDescription>
                            Both parties must sign this agreement to activate the contract.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize border-purple-200 text-purple-700 bg-purple-50">
                        {contract.engagement_model}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                {/* Terms Section */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Project</h4>
                        <p className="font-semibold text-lg">{contract.project_title || 'Untitled Project'}</p>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                            <p>{contract.start_date ? format(new Date(contract.start_date), 'PPP') : 'Not specified'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Compensation</h4>
                            <p className="font-semibold text-lg">
                                {rate}<span className="text-sm font-normal text-muted-foreground">{unit}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">{detail}</p>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="col-span-full space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                        <span className="text-muted-foreground">Terms & Conditions</span>
                    </h4>
                    <div className="h-48 overflow-y-auto border rounded-md p-4 bg-muted/5 text-sm text-muted-foreground space-y-3">
                        <p><strong>1. Scope of Services.</strong> The Expert agrees to perform the services described in the Project Details in a professional and timely manner. The specific deliverables and milestones are outlined in the project description.</p>
                        <p><strong>2. Compensation.</strong> The Buyer agrees to pay the Expert the compensation set forth in the agreement. Payments will be processed through the platform's escrow system to ensure security for both parties.</p>
                        <p><strong>3. Intellectual Property.</strong> Unless otherwise specified, all work product created by the Expert for the Buyer under this agreement shall be considered "work made for hire" and shall be the sole property of the Buyer upon full payment.</p>
                        <p><strong>4. Confidentiality.</strong> Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this engagement. If a separate NDA is signed, its terms shall prevail regarding confidentiality.</p>
                        <p><strong>5. Termination.</strong> This agreement may be terminated by either party in accordance with the platform's dispute resolution and cancellation policies. Fees for work completed prior to termination shall be paid.</p>
                        <p><strong>6. Governing Law.</strong> This agreement shall be governed by the terms of service of the platform and applicable laws.</p>
                        <p className="italic text-xs mt-4">By signing below, you acknowledge that you have read and agree to these terms.</p>
                    </div>
                </div>

                {/* Signature Section - Moved to full width or kept in grid? Kept in grid but let's make it full width if terms are full width */}
                <div className="col-span-full space-y-6 bg-muted/10 p-4 rounded-lg border border-dashed">
                    <h4 className="font-semibold flex items-center gap-2">
                        <PenTool className="w-4 h-4" /> Digital Signature
                    </h4>
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                            I, the undersigned, agree to the terms and conditions set forth in this agreement.
                        </label>
                        <Input
                            placeholder="Type your full legal name"
                            value={signature}
                            onChange={(e) => { setSignature(e.target.value); setError(''); }}
                            className={error ? "border-red-500" : ""}
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground">
                        By clicking "Sign Agreement", you legally bind yourself to this contract. IP Address recorded.
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-muted/20 py-4 border-t">
                <Button variant="outline" onClick={onDecline} disabled={isProcessing} className="border-red-200 hover:bg-red-50 hover:text-red-700">
                    <X className="w-4 h-4 mr-2" /> Decline
                </Button>
                <Button onClick={handleSign} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Check className="w-4 h-4 mr-2" /> Sign Agreement
                </Button>
            </CardFooter>
        </Card>
    );
}
