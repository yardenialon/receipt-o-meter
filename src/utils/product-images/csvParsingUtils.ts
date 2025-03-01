
import Papa from 'papaparse';

/**
 * Parse a CSV file into array of data objects
 */
export async function parseCSVFile(csvFile: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
