import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface XmlUploadDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  networkName: string;
  setNetworkName: (name: string) => void;
  branchName: string;
  setBranchName: (name: string) => void;
  pendingFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  onConfirm: () => void;
}

export const XmlUploadDialog = ({
  showDialog,
  setShowDialog,
  networkName,
  setNetworkName,
  branchName,
  setBranchName,
  pendingFile,
  isUploading,
  uploadProgress,
  onConfirm
}: XmlUploadDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>פרטי הרשת והסניף</DialogTitle>
          <DialogDescription>
            אנא הזן את שם הרשת ושם הסניף עבור הקובץ
            {pendingFile && (
              <div className="mt-2 text-sm text-gray-500">
                שם הקובץ: {pendingFile.name}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="networkName">שם הרשת</Label>
            <Input
              id="networkName"
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value)}
              placeholder="לדוגמה: שופרסל"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchName">שם הסניף</Label>
            <Input
              id="branchName"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="לדוגמה: סניף רמת אביב"
            />
          </div>
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500 text-center">
                מעלה מוצרים... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onConfirm}
            disabled={!networkName || !branchName || isUploading}
          >
            {isUploading ? 'מעלה...' : 'אישור'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};