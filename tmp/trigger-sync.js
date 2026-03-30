
async function runSync() {
  const SYNC_URL = 'https://store.imbra.cloud/api/sync-products?secret=Imbra2025_Sync_Safety';
  console.log('Disparando sincronizacion en:', SYNC_URL);
  try {
    const res = await fetch(SYNC_URL);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Resultado:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

runSync();
