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
        <button
          onClick={() => toast.info('בקרוב - תשלום דרך Bit')}
          className="group relative h-12 w-20 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
        >
          <img 
            src="/lovable-uploads/07a1d83a-7044-4aa8-9501-18010ad22ff6.png" 
            alt="Bit" 
            className="h-full w-full object-contain transition-transform group-hover:scale-110"
          />
        </button>
        <button
          onClick={() => toast.info('בקרוב - תשלום דרך Paybox')}
          className="group relative h-12 w-20 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
        >
          <img 
            src="/lovable-uploads/1dc47ba7-26f0-461e-9822-5e477bd5ed31.png" 
            alt="Paybox" 
            className="h-full w-full object-contain transition-transform group-hover:scale-110"
          />
        </button>
      </div>
    </div>
  );
};

export default PaymentButtons;