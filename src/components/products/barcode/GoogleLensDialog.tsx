import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GoogleLensDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenGoogleLens: () => void;
}

export const GoogleLensDialog = ({ isOpen, onOpenChange, onOpenGoogleLens }: GoogleLensDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>סריקת ברקוד באמצעות Google Lens</DialogTitle>
          <DialogDescription>
            לא ניתן להשתמש בסורק המובנה. האם תרצה להשתמש ב-Google Lens לסריקת הברקוד?
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              שים לב: אם הסריקה נכשלת, נסה לצלם את הברקוד בתאורה טובה יותר או לנקות את עדשת המצלמה.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={onOpenGoogleLens}>
            פתח את Google Lens
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};