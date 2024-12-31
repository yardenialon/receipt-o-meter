import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BarcodeDialogProps {
  isOpen: boolean;
  isInitializing: boolean;
  onOpenChange: (open: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const BarcodeDialog = ({ isOpen, isInitializing, onOpenChange, videoRef }: BarcodeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isInitializing ? 'מאתחל מצלמה...' : 'סריקת ברקוד'}
          </DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            playsInline
            muted
          />
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-pulse" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {isInitializing ? 'מאתחל את המצלמה...' : 'מחפש ברקוד...'}
        </p>
      </DialogContent>
    </Dialog>
  );
};