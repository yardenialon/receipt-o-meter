import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import UploadZone from '@/components/UploadZone';
import ReceiptList from '@/components/ReceiptList';
import { BillBeLogo } from '@/components/BillBeLogo';
import { useIsMobile } from '@/hooks/use-mobile';
import { ReceiptStats } from '@/components/stats/ReceiptStats';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();

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

  if (!user) {
    navigate('/login');
    return null;
  }

  const username = user.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-1 md:px-2 py-6 md:py-8">
        <div className="flex justify-center items-center mb-8">
          <div className="text-center">
            <div className="flex flex-col items-center justify-center gap-3 mb-4">
              <BillBeLogo size={isMobile ? 225 : 200} className="mb-4" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isMobile ? 'קבלות' : 'ניהול קבלות'}
                </h1>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-medium text-gray-700">
                    שלום {username}!
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <ReceiptStats />
          <UploadZone />
          <ReceiptList />
        </div>
      </div>
    </div>
  );
};

export default Index;