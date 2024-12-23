import { Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const PaymentButtons = () => {
  return (
    <div className="mt-8 text-center">
      <Button
        variant="default"
        className="mb-4 w-full max-w-xs"
        onClick={() => toast.info('בקרוב - קבלת החזר כספי')}
      >
        לחץ כאן לקבלת החזר כספי
      </Button>
      
      <div className="flex justify-center gap-6">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => toast.info('בקרוב - תשלום דרך Bit')}
        >
          <Smartphone className="w-5 h-5" />
          Bit
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => toast.info('בקרוב - תשלום דרך Paybox')}
        >
          <Smartphone className="w-5 h-5" />
          Paybox
        </Button>
      </div>
    </div>
  );
};

export default PaymentButtons;