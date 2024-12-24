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
            src="/lovable-uploads/a7f676f4-a172-4122-9bca-dc35a811739a.png" 
            alt="Bit" 
            className="h-full w-full object-contain transition-transform group-hover:scale-110"
          />
        </button>
        <button
          onClick={() => toast.info('בקרוב - תשלום דרך Paybox')}
          className="group relative h-12 w-20 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
        >
          <img 
            src="/lovable-uploads/1f5589fb-c108-45ce-b235-a61909f72471.png" 
            alt="Paybox" 
            className="h-full w-full object-contain transition-transform group-hover:scale-110"
          />
        </button>
      </div>
    </div>
  );
};

export default PaymentButtons;