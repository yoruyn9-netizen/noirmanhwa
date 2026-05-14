
/**
 * @fileOverview Pulse Check Logic
 * Verifies live connectivity to primary manga nodes at runtime.
 */

export async function verifyApiConnections() {
  console.log('📡 [System]: Initializing Neural Link Pulse Check...');
  
  const results = await Promise.allSettled([
    fetch('/api/asura?path=/series&limit=1').then(r => r.ok),
    fetch('/api/flame?path=/posts&per_page=1').then(r => r.ok),
    fetch('/api/komiku?path=/manga/page/1').then(r => r.ok)
  ]);
  
  const status = {
    asura: results[0].status === 'fulfilled' && (results[0] as any).value,
    flame: results[1].status === 'fulfilled' && (results[1] as any).value,
    komiku: results[2].status === 'fulfilled' && (results[2] as any).value
  };

  const workingCount = Object.values(status).filter(Boolean).length;
  
  console.log(`🔍 [API Health]: ${workingCount}/3 Nodes Online`, status);
  
  if (workingCount === 0) {
    console.error('❌ [CRITICAL]: ALL MANGA NODES UNREACHABLE. STANDBY FOR RETRY.');
  }

  return status;
}
