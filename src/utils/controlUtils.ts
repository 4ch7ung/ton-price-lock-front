// Sleep function to pause execution for a given number of milliseconds
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}