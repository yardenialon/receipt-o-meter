import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import UploadZone from '@/components/UploadZone';
import ReceiptList from '@/components/ReceiptList';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Lottie from 'lottie-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

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
              <div className="bg-white p-3 rounded-2xl shadow-lg animate-scale-in w-16 h-16 flex items-center justify-center">
                <Lottie 
                  lottieRef={ref => {
                    if (ref) {
                      fetch('https://lottie.host/37b258a0-4c07-419c-80b3-2dda87d5d789/MiupA8JcV1.lottie')
                        .then(response => response.json())
                        .then(animationData => {
                          ref.play();
                          ref.setSpeed(0.5);
                        });
                    }
                  }}
                  style={{ width: '100%', height: '100%' }}
                  loop={true}
                />
              </div>
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