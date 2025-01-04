import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";

export const getBrowserHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
});

export const getTodayFileName = () => {
  const today = new Date();
  return `Price${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.gz`;
};

export const fetchAndDecompressFile = async (url: string) => {
  console.log('Fetching file:', url);
  const response = await fetch(url, { headers: getBrowserHeaders() });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }
  
  const gzBuffer = await response.arrayBuffer();
  console.log('Decompressing file...');
  const decompressed = gunzip(new Uint8Array(gzBuffer));
  return new TextDecoder().decode(decompressed);
};