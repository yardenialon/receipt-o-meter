
import { motion } from 'framer-motion';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export const AuthSection = () => {
  const currentOrigin = window.location.origin;

  return (
    <motion.div 
      className="w-full max-w-md mx-auto mb-4 md:mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-2 md:p-6 shadow-2xl border border-white/20">
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
                }
              }
            },
            className: {
              container: 'auth-container space-y-2 md:space-y-3',
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
        <p className="text-center text-sm md:text-base text-gray-500 mt-2 md:mt-3">
          2 דקות להתחברות, שנים של חיסכון
        </p>
      </div>
    </motion.div>
  );
};
