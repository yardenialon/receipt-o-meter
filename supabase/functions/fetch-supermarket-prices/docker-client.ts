import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface DockerConfig {
  enabledScrapers: string[];
  enabledFileTypes: string[];
  limit?: number;
  date?: string;
}

export const fetchPricesFromDocker = async () => {
  console.log('Starting Docker price fetch operation...');

  const config: DockerConfig = {
    enabledScrapers: ['SHUFERSAL', 'YAYNO_BITAN', 'BAREKET'],
    enabledFileTypes: ['STORE_FILE'],
    limit: 1, // Start with a small limit for testing
  };

  try {
    // Create Docker container
    const createResponse = await fetch('http://localhost:2375/containers/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Image: 'erlichsefi/israeli-supermarket-scarpers:latest',
        Env: [
          `ENABLED_SCRAPERS=${config.enabledScrapers.join(',')}`,
          `ENABLED_FILE_TYPES=${config.enabledFileTypes.join(',')}`,
          `LIMIT=${config.limit}`,
          config.date ? `TODAY=${config.date}` : '',
        ].filter(Boolean),
        HostConfig: {
          Binds: ['./dumps:/usr/src/app/dumps'],
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create Docker container: ${createResponse.statusText}`);
    }

    const container = await createResponse.json();
    console.log('Created Docker container:', container.Id);

    // Start container
    const startResponse = await fetch(`http://localhost:2375/containers/${container.Id}/start`, {
      method: 'POST',
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start Docker container: ${startResponse.statusText}`);
    }

    console.log('Started Docker container');

    // Wait for container to finish
    const waitResponse = await fetch(`http://localhost:2375/containers/${container.Id}/wait`);
    const waitResult = await waitResponse.json();

    if (waitResult.StatusCode !== 0) {
      throw new Error(`Docker container exited with status ${waitResult.StatusCode}`);
    }

    // Get container logs
    const logsResponse = await fetch(`http://localhost:2375/containers/${container.Id}/logs?stdout=1&stderr=1`);
    const logs = await logsResponse.text();
    console.log('Container logs:', logs);

    // Process the dumps directory
    // This is a placeholder - we'll need to implement the actual file processing
    const prices = []; // This should be populated with the actual price data
    
    // Cleanup container
    await fetch(`http://localhost:2375/containers/${container.Id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return prices;
  } catch (error) {
    console.error('Docker operation failed:', error);
    throw error;
  }
};