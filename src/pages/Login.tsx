import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { motion } from 'framer-motion';
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.1),rgba(52,211,153,0.1),rgba(129,140,248,0.1))]" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, #34D399 0%, transparent 50%)',
              'radial-gradient(circle at 60% 60%, #38BDF8 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, #818CF8 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, #34D399 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      {/* Content container */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and title section */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div 
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BillBeLogo size={200} showTagline={false} />
            </motion.div>
            <p className="text-primary-700/80 text-sm mt-2">
              מערכת חכמה לניהול קבלות
            </p>
          </motion.div>

          {/* Auth form container */}
          <motion.div 
            className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-blue-400/5 to-indigo-400/5 rounded-3xl" />
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
                  container: 'auth-container space-y-4',
                  button: 'relative overflow-hidden font-medium transition-all duration-300 hover:shadow-lg active:scale-[0.98] after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0 after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-500',
                  label: 'font-medium text-gray-700',
                  input: 'transition-all duration-200 bg-white/80 backdrop-blur-sm focus:bg-white',
                  loader: 'text-primary-500',
                  anchor: 'text-primary-600 hover:text-primary-700 transition-colors',
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;