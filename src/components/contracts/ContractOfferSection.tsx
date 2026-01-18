import { Contract } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ContractOfferSectionProps {
    contract: Contract;
    onAccept: () => void;
    onDecline: () => void;
    isProcessing: boolean;
}

export function ContractOfferSection({ contract, onAccept, onDecline, isProcessing }: ContractOfferSectionProps) {
    const getRateDisplay = () => {
        const terms = (contract.payment_terms as any) || {};
        switch (contract.engagement_model) {
            case 'hourly':
                return { rate: `$${terms.hourly_rate || 0}`, unit: '/hr', detail: `${terms.estimated_hours || 0} est. hours` };
            case 'daily':
                return { rate: `$${terms.daily_rate || 0}`, unit: '/day', detail: `${terms.total_days || 0} days` };
            case 'sprint':
                return { rate: `$${terms.sprint_rate || 0}`, unit: '/sprint', detail: `${terms.total_sprints || 0} sprints` };
            case 'fixed':
                return { rate: `$${(terms.total_amount || 0).toLocaleString()}`, unit: ' total', detail: 'Fixed Price' };
            default:
                return { rate: 'N/A', unit: '', detail: '' };
        }
    };

    const { rate, unit, detail } = getRateDisplay();

    return (
        <Card className="border-purple-500/20 shadow-md">
            <CardHeader className="bg-purple-500/5 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl text-purple-700 dark:text-purple-400">Contract Offer Review</CardTitle>
                        <CardDescription>Please review the terms below. Accepting this offer will proceed to the NDA stage.</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize border-purple-200 text-purple-700 bg-purple-50">
                        {contract.engagement_model}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
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
                </div>

                <div className="space-y-4">
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
                    <div className="bg-muted/30 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Note:</p>
                        <p className="text-muted-foreground">
                            By accepting this offer, you agree to the platform's Terms of Service.
                            Next steps involves signing the NDA (if required) and Account Activation.
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-muted/20 py-4 border-t">
                <Button variant="outline" onClick={onDecline} disabled={isProcessing} className="border-red-200 hover:bg-red-50 hover:text-red-700">
                    <X className="w-4 h-4 mr-2" /> Decline Offer
                </Button>
                <Button onClick={onAccept} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Check className="w-4 h-4 mr-2" /> Accept Offer
                </Button>
            </CardFooter>
        </Card>
    );
}
