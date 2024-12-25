import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { BillBeLogo } from '@/components/BillBeLogo';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        window.history.replaceState({}, document.title, '/login');
        toast.success('התחברת בהצלחה!');
      }
      if (event === 'SIGNED_OUT') {
        toast.info('התנתקת בהצלחה');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-lg animate-scale-in">
              <BillBeLogo className="text-primary-500" size={48} showText={false} />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
            BillBe
          </h1>
          <p className="text-primary-700 text-sm">
            מערכת חכמה לניהול קבלות
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl animate-scale-in">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#47d193',
                    brandAccent: '#065f46',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'white',
                    defaultButtonBackgroundHover: '#f9fafb',
                    inputBackground: 'white',
                    inputBorder: '#e5e7eb',
                    inputBorderHover: '#47d193',
                    inputBorderFocus: '#47d193',
                  },
                  radii: {
                    buttonBorderRadius: '0.75rem',
                    inputBorderRadius: '0.75rem',
                  },
                  fontSizes: {
                    baseInputSize: '1rem',
                    baseLabelSize: '0.875rem',
                    baseButtonSize: '1rem',
                  },
                }
              },
              className: {
                container: 'auth-container',
                button: 'font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]',
                label: 'font-medium text-gray-700',
                input: 'transition-all duration-200',
                loader: 'text-primary-500',
              }
            }}
            providers={['google']}
            redirectTo="https://receipt-o-meter.lovable.app/login"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'כתובת אימייל',
                  password_label: 'סיסמה',
                  button_label: 'התחבר',
                  social_provider_text: 'התחבר באמצעות {{provider}}',
                  loading_button_label: 'מתחבר...',
                  email_input_placeholder: 'הכנס את כתובת האימייל שלך',
                  password_input_placeholder: 'הכנס סיסמה',
                },
                sign_up: {
                  email_label: 'כתובת אימייל',
                  password_label: 'סיסמה',
                  button_label: 'הרשם',
                  social_provider_text: 'התחבר באמצעות {{provider}}',
                  loading_button_label: 'נרשם...',
                  email_input_placeholder: 'הכנס את כתובת האימייל שלך',
                  password_input_placeholder: 'בחר סיסמה',
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;