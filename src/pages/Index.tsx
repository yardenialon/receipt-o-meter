import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import UploadZone from '@/components/UploadZone';
import ReceiptList from '@/components/ReceiptList';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isMobile ? 'קבלות' : 'ניהול קבלות'}
                </h1>
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <UploadZone />
        <ReceiptList />
      </div>
    </div>
  );
};

export default Index;