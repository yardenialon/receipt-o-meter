import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DockerConfig {
  enabledScrapers: string[];
  enabledFileTypes: string[];
  limit?: number;
  date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Rami Levy price fetch operation...');

    // Configure the scraper
    const config: DockerConfig = {
      enabledScrapers: ['RAMI_LEVY'],
      enabledFileTypes: ['STORE_FILE'],
      limit: 1, // Start with one file for testing
    };

    // Create temporary directory for dumps
    const dumpsDir = await Deno.makeTempDir({ prefix: 'rami-levy-dumps-' });
    console.log('Created temporary dumps directory:', dumpsDir);

    // Set up Docker command
    const dockerCommand = [
      'docker',
      'run',
      '--rm',
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

    // Run Docker container
    console.log('Running Docker command:', dockerCommand.join(' '));
    const process = new Deno.Command(dockerCommand[0], {
      args: dockerCommand.slice(1),
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await process.output();
    const outStr = new TextDecoder().decode(stdout);
    const errStr = new TextDecoder().decode(stderr);
    
    console.log('Docker output:', outStr);
    if (errStr) console.error('Docker errors:', errStr);

    if (code !== 0) {
      throw new Error(`Docker process failed with code ${code}`);
    }

    // Process the downloaded files
    const prices = [];
    for await (const entry of Deno.readDir(dumpsDir)) {
      if (entry.isFile && entry.name.endsWith('.xml')) {
        const content = await Deno.readTextFile(`${dumpsDir}/${entry.name}`);
        console.log(`Processing file: ${entry.name}`);
        // Here we would parse the XML and process the prices
        // TODO: Add XML parsing logic
        prices.push({
          filename: entry.name,
          content: content.substring(0, 200) + '...' // Log just the start for debugging
        });
      }
    }

    // Clean up
    await Deno.remove(dumpsDir, { recursive: true });
    console.log('Cleaned up temporary directory');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully fetched Rami Levy prices',
        data: prices
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in Rami Levy price fetch:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});