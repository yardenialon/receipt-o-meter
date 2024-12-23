import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      console.log('Session:', session);
      
      // Handle hash fragment from OAuth redirect
      if (window.location.hash && !session) {
        // If we have a hash but no session, let's wait for the session
        return;
      }
      
      if (session) {
        // Clear the hash fragment
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        toast.success('התחברת בהצלחה!');
        navigate('/');
      }
      if (event === 'SIGNED_OUT') {
        toast.info('התנתקת בהצלחה');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">התחברות לCashBackly</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0EA5E9',
                  brandAccent: '#0284C7',
                }
              }
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              label: 'auth-label',
              input: 'auth-input',
            }
          }}
          providers={['google']}
          redirectTo={`${window.location.origin}/projects/adefcec6-d186-4415-b58d-9b931f14f135/login`}
          localization={{
            variables: {
              sign_in: {
                email_label: 'אימייל',
                password_label: 'סיסמה',
                button_label: 'התחבר',
                social_provider_text: 'התחבר באמצעות {{provider}}',
                loading_button_label: 'מתחבר...',
              },
              sign_up: {
                email_label: 'אימייל',
                password_label: 'סיסמה',
                button_label: 'הרשם',
                social_provider_text: 'התחבר באמצעות {{provider}}',
                loading_button_label: 'נרשם...',
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;