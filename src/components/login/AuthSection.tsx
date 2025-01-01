import { motion } from 'framer-motion';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export const AuthSection = () => {
  const currentOrigin = window.location.origin;

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/login`
        }
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto px-3 md:px-0 mb-6 md:mb-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
    >
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-3 md:p-8 shadow-2xl border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-blue-400/5 to-indigo-400/5 rounded-2xl" />
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
                  baseInputSize: '0.875rem',
                  baseLabelSize: '0.75rem',
                  baseButtonSize: '0.875rem',
                },
              }
            },
            className: {
              container: 'auth-container space-y-3 md:space-y-4',
              button: 'relative overflow-hidden font-medium transition-all duration-300 hover:shadow-lg active:scale-[0.98] min-h-[40px] md:min-h-[44px] text-sm md:text-base',
              label: 'font-medium text-gray-700 text-sm md:text-base',
              input: 'transition-all duration-200 bg-white/80 backdrop-blur-sm focus:bg-white min-h-[40px] md:min-h-[44px] text-sm md:text-base',
              loader: 'text-primary-500',
              anchor: 'text-primary-600 hover:text-primary-700 transition-colors text-sm md:text-base',
            }
          }}
          providers={['google']}
          redirectTo={`${currentOrigin}/login`}
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
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          2 דקות להתחברות, שנים של חיסכון
        </p>
        <div className="mt-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2 py-6"
            variant="outline"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            הרשמה עם Google
          </Button>
        </div>
      </div>
    </motion.div>
  );
};