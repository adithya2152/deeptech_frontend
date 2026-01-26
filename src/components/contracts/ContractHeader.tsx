import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

const statusColors: any = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-200',
  active: 'bg-green-500/10 text-green-500 border-green-200',
  paused: 'bg-gray-500/10 text-gray-500 border-gray-200',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-200',
  disputed: 'bg-red-500/10 text-red-500 border-red-200'
};

interface ContractHeaderProps {
  contract: any;
  isNdaSigned: boolean;
  isBuyerSigned: boolean;
  isExpertSigned: boolean;
  onBack: () => void;
}

export function ContractHeader({ contract, isNdaSigned, isBuyerSigned, isExpertSigned, onBack }: ContractHeaderProps) {
  const status = contract.status as string;
  const isContractFullySigned = isBuyerSigned && isExpertSigned;
  // Only show NDA badge if NDA is actually required for this contract
  const hasNda = contract.nda_required === true;

  const renderContractSigningBadge = () => {
    if (status === 'declined') {
      return (
        <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs">
          <Clock className="h-3 w-3 mr-1" /> Contract Declined
        </span>
      );
    }

    if (isContractFullySigned) {
      return (
        <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Contract Signed
        </span>
      );
    }

    return (
      <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
        <Clock className="h-3 w-3 mr-1" /> Awaiting Contract Signature
      </span>
    );
  };

  const renderNdaBadge = () => {
    if (!hasNda) return null;

    if (isNdaSigned) {
      return (
        <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" /> NDA Signed
        </span>
      );
    }

    return (
      <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
        <Clock className="h-3 w-3 mr-1" /> Awaiting NDA Signature
      </span>
    );
  };

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            {contract.project_title || 'Contract Details'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge
              variant="secondary"
              className="uppercase text-[10px] tracking-wider"
            >
              {contract.engagement_model} Model
            </Badge>

            {renderContractSigningBadge()}
            {renderNdaBadge()}
          </div>
        </div>

        <Badge
          variant="outline"
          className={`${statusColors[contract.status]} capitalize px-3 py-1`}
        >
          {contract.status}
        </Badge>
      </div>
    </div>
  );
}
