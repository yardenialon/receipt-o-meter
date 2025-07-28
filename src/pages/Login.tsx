
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { LoginHero } from '@/components/login/LoginHero';
import { FeaturesGrid } from '@/components/login/FeaturesGrid';
import { SocialProof } from '@/components/login/SocialProof';

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Simple redirect when user is authenticated
  useEffect(() => {
    if (user && !isLoading) {
      console.log('User authenticated, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Simplified auth change handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success('התחברת בהצלחה!');
        navigate('/', { replace: true });
      }
      if (event === 'SIGNED_OUT') {
        toast.info('התנתקת בהצלחה');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50">
        <div className="text-center animate-pulse">
          <div className="h-24 w-24 md:h-32 md:w-32 mx-auto bg-primary-100 rounded-full mb-4" />
          <div className="h-3 w-20 md:h-4 md:w-24 mx-auto bg-primary-100 rounded" />
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.1),rgba(52,211,153,0.1),rgba(129,140,248,0.1))]" />
      </div>

      <div className="relative container mx-auto py-6 md:py-12 min-h-screen overflow-y-auto">
        <LoginHero />
        <FeaturesGrid />
        <SocialProof />
      </div>
    </div>
  );
};

export default Login;
