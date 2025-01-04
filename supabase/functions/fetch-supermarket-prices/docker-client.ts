import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface DockerConfig {
  enabledScrapers: string[];
  enabledFileTypes: string[];
  limit?: number;
  date?: string;
}

export const fetchPricesFromDocker = async () => {
  console.log('Starting Docker price fetch operation...');

  // נגדיר את התצורה הבסיסית
  const config: DockerConfig = {
    enabledScrapers: ['SHUFERSAL', 'YAYNO_BITAN', 'BAREKET'],
    enabledFileTypes: ['STORE_FILE'],
    limit: 1, // נתחיל עם מגבלה קטנה לבדיקה
  };

  try {
    // יצירת תיקיית dumps זמנית
    const dumpsDir = await Deno.makeTempDir({ prefix: 'supermarket-dumps-' });
    console.log('Created temporary dumps directory:', dumpsDir);

    // הגדרת פקודת הדוקר
    const dockerCommand = [
      'docker',
      'run',
      '--rm', // מחיקה אוטומטית של הקונטיינר לאחר סיום
      '-v',
      `${dumpsDir}:/usr/src/app/dumps`,
      '-e',
      `ENABLED_SCRAPERS=${config.enabledScrapers.join(',')}`,
      '-e',
      `ENABLED_FILE_TYPES=${config.enabledFileTypes.join(',')}`,
      '-e',
      `LIMIT=${config.limit}`,
      'erlichsefi/israeli-supermarket-scarpers:latest'
    ];

    if (config.date) {
      dockerCommand.push('-e', `TODAY=${config.date}`);
    }

    // הפעלת הדוקר
    const process = new Deno.Command(dockerCommand[0], {
      args: dockerCommand.slice(1),
      stdout: 'piped',
      stderr: 'piped',
    });

    console.log('Running Docker command:', dockerCommand.join(' '));
    const { code, stdout, stderr } = await process.output();

    const outStr = new TextDecoder().decode(stdout);
    const errStr = new TextDecoder().decode(stderr);
    
    console.log('Docker output:', outStr);
    if (errStr) console.error('Docker errors:', errStr);

    if (code !== 0) {
      throw new Error(`Docker process failed with code ${code}`);
    }

    // קריאת הקבצים מתיקיית ה-dumps
    const prices = [];
    for await (const entry of Deno.readDir(dumpsDir)) {
      if (entry.isFile && entry.name.endsWith('.xml')) {
        const content = await Deno.readTextFile(`${dumpsDir}/${entry.name}`);
        console.log(`Processing file: ${entry.name}`);
        // כאן נוסיף את הלוגיקה לעיבוד קבצי XML
        // TODO: להוסיף פרסור של ה-XML והמרה למבנה הנתונים הרצוי
      }
    }

    // ניקוי התיקייה הזמנית
    await Deno.remove(dumpsDir, { recursive: true });
    console.log('Cleaned up temporary directory');

    return prices;
  } catch (error) {
    console.error('Docker operation failed:', error);
    throw error;
  }
};