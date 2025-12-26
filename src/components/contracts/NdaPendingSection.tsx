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
import { FileSignature, CheckCircle2, Loader2 } from 'lucide-react';

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
}: NdaPendingSectionProps) {
    return (
        <div className="max-w-3xl mx-auto py-12 space-y-8 text-center">
            <h2 className="text-2xl font-bold">
                Next step: Sign the NDA to activate this contract
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                The contract has been created and is currently pending. Once the expert signs
                the NDA, both parties will see full project details, work logs, and invoicing.
            </p>

            {isExpert ? (
                <>
                    <div className="flex items-center justify-center gap-3">
                        <Dialog open={showNdaDialog} onOpenChange={setShowNdaDialog}>
                            <DialogTrigger asChild>
                                <Button size="lg">
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    Review &amp; Sign NDA
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Non‑Disclosure Agreement</DialogTitle>
                                    <DialogDescription>
                                        Please review the NDA and confirm your electronic signature to
                                        activate this contract. If you do not wish to proceed, you can
                                        decline this contract instead.
                                    </DialogDescription>
                                </DialogHeader>

                                <ScrollArea className="h-64 border rounded-md p-3 text-sm text-left">
                                    {/* Replace with real NDA terms or PDF viewer */}
                                    <p className="mb-2 font-medium">DeepTech Mutual NDA</p>
                                    <p className="text-muted-foreground">
                                        This Non‑Disclosure Agreement governs the confidentiality of
                                        information shared between the buyer and expert under this project.
                                        By signing, you agree not to disclose or use confidential
                                        information except as required to perform the agreed services.
                                    </p>
                                </ScrollArea>

                                <div className="space-y-3 mt-4 text-left">
                                    <Label htmlFor="signature">Type your full legal name</Label>
                                    <Input
                                        id="signature"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        placeholder="Jane Doe"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="confirm" />
                                        <Label
                                            htmlFor="confirm"
                                            className="text-xs text-muted-foreground"
                                        >
                                            I confirm that this typed name is my electronic signature and that
                                            I agree to the NDA terms.
                                        </Label>
                                    </div>
                                </div>

                                <DialogFooter className="mt-4">
                                    <Button
                                        onClick={onSignNda}
                                        disabled={!signature || signing}
                                    >
                                        {signing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Sign NDA &amp; Activate
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {onDecline && (
                            <Button
                                size="lg"
                                variant="destructive"
                                onClick={onDecline}
                                disabled={!!declining}
                            >
                                {declining ? 'Declining...' : 'Decline Contract'}
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Waiting for the expert to sign the NDA. You will be notified once the
                    contract becomes active.
                </p>
            )}
        </div>
    );
}
