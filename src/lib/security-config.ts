// Security configuration for the application
export const SECURITY_CONFIG = {
  // Content Security Policy directives
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:", "https:"],
    connectSrc: ["'self'", "https://kthqkydgegsoheymesgc.supabase.co"],
    fontSrc: ["'self'", "data:"],
    frameSrc: ["'none'"],
  },
  
  // Authentication security settings
  auth: {
    sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
    requireEmailConfirmation: false, // Set to true in production
    passwordMinLength: 8,
    enableMfa: false, // Can be enabled for additional security
  },
  
  // Input validation settings
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['application/xml', 'text/xml', 'application/zip', 'application/gzip'],
    maxInputLength: 1000,
  },
} as const;

// Helper function to sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, SECURITY_CONFIG.validation.maxInputLength);
}

// Helper function to validate file uploads
export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
    return { isValid: false, error: 'קובץ גדול מדי' };
  }
  
  if (!SECURITY_CONFIG.validation.allowedFileTypes.includes(file.type as any)) {
    return { isValid: false, error: 'סוג קובץ לא נתמך' };
  }
  
  return { isValid: true };
}