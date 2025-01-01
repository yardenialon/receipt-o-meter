import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { BillBeLogo } from '@/components/BillBeLogo';
import { useAuth } from '@/hooks/use-auth';
import { Camera, TrendingUp, Leaf, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Login = () => {
  const navigate = useNavigate();
  const currentOrigin = window.location.origin;
  const { user, isLoading } = useAuth();

  // Sample data for the interactive chart
  const data = [
    { savings: 4000, waste: 2400, prices: 2400 },
    { savings: 3000, waste: 1398, prices: 2210 },
    { savings: 2000, waste: 9800, prices: 2290 },
    { savings: 2780, waste: 3908, prices: 2000 },
    { savings: 1890, waste: 4800, prices: 2181 },
    { savings: 2390, waste: 3800, prices: 2500 },
    { savings: 3490, waste: 4300, prices: 2100 },
  ];

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const handleAuthChange = (event: string) => {
      if (event === 'SIGNED_IN') {
        window.history.replaceState({}, document.title, '/login');
        toast.success('התחברת בהצלחה!');
        navigate('/', { replace: true });
      }
      if (event === 'SIGNED_OUT') {
        toast.info('התנתקת בהצלחה');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <BillBeLogo size={150} showTagline={false} />
          <p className="mt-4 text-primary-600">טוען...</p>
        </motion.div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const FeatureCard = ({ icon: Icon, title, description, stat }: { icon: any, title: string, description: string, stat: string }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative p-6 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-blue-400/5 to-indigo-400/5" />
      <Icon className="h-8 w-8 text-primary-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <p className="text-primary-600 font-bold">{stat}</p>
    </motion.div>
  );

  const TestimonialCard = ({ text, author }: { text: string, author: string }) => (
    <motion.div
      className="min-w-[300px] p-4 mx-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg"
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-gray-700 mb-2">"{text}"</p>
      <p className="text-primary-600 font-semibold">- {author}</p>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50">
      {/* Background Effects */}
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
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-12 min-h-screen">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex justify-center mb-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BillBeLogo size={200} showTagline={false} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-blue-600 text-transparent bg-clip-text">
            נהלו חכם. חסכו יותר.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            הדרך החכמה לחסוך בקניות ולשמור על המזון שלכם
          </p>

          {/* Interactive Chart */}
          <div className="h-48 mb-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="savings" stroke="#47d193" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="waste" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prices" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FeatureCard
            icon={Camera}
            title="סריקת קבלות"
            description="סרקו קבלות וקבלו תובנות חכמות"
            stat="חיסכון ממוצע של 20%"
          />
          <FeatureCard
            icon={TrendingUp}
            title="השוואת מחירים"
            description="מצאו את הסל הזול ביותר"
            stat="השוואה בין 5 רשתות"
          />
          <FeatureCard
            icon={Leaf}
            title="ניהול מזון"
            description="הצילו מזון, חסכו כסף"
            stat="3,800 ₪ חיסכון שנתי"
          />
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Users className="h-6 w-6 text-primary-500" />
            <p className="text-xl font-semibold">
              100,000+ משפחות כבר חוסכות איתנו
            </p>
          </div>
          
          {/* Testimonials */}
          <div className="overflow-hidden">
            <motion.div 
              className="flex"
              animate={{ x: [-1200, 1200] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <TestimonialCard
                text="החיסכון הכספי מדהים, ממליצה בחום!"
                author="מיכל כהן"
              />
              <TestimonialCard
                text="האפליקציה עזרה לי להפחית בזבוז מזון"
                author="דוד לוי"
              />
              <TestimonialCard
                text="השוואת המחירים חוסכת לי מאות שקלים בחודש"
                author="רחל אברהם"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Auth Section */}
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
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
                  button: 'relative overflow-hidden font-medium transition-all duration-300 hover:shadow-lg active:scale-[0.98]',
                  label: 'font-medium text-gray-700',
                  input: 'transition-all duration-200 bg-white/80 backdrop-blur-sm focus:bg-white',
                  loader: 'text-primary-500',
                  anchor: 'text-primary-600 hover:text-primary-700 transition-colors',
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
            <p className="text-center text-sm text-gray-500 mt-4">
              2 דקות להתחברות, שנים של חיסכון
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;