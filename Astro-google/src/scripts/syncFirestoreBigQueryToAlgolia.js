// scripts/syncFirestoreBigQueryToAlgolia.js

import algoliasearch from 'algoliasearch';
import { Firestore } from '@google-cloud/firestore';
import { BigQuery } from '@google-cloud/bigquery';

// 🔐 Ruta a la clave de servicio GCP
const keyFile = './gcp-key.json';

// 🔹 Inicializar Firestore Admin
const firestore = new Firestore({
  keyFilename: keyFile,
  projectId: 'TU_PROJECT_ID'
});

// 🔹 Inicializar BigQuery
const bigquery = new BigQuery({
  keyFilename: keyFile,
  projectId: 'TU_PROJECT_ID'
});

// 🔹 Inicializar Algolia
const client = algoliasearch('TU_ALGOLIA_APP_ID', 'TU_ALGOLIA_ADMIN_API_KEY');
const index = client.initIndex('contenido_unificado');

async function syncFirestore() {
  const snapshot = await firestore.collection('peliculas').get();

  return snapshot.docs.map(doc => ({
    objectID: `firestore_${doc.id}`,
    source: 'firestore',
    ...doc.data()
  }));
}

async function syncBigQuery() {
  const [rows] = await bigquery.query(`
    SELECT id, title, overview FROM \`TU_PROJECT_ID.TU_DATASET.TU_TABLA\`
  `);

  return rows.map(row => ({
    objectID: `bigquery_${row.id}`,
    source: 'bigquery',
    ...row
  }));
}

async function main() {
  console.log('📡 Consultando Firestore...');
  const firestoreData = await syncFirestore();

  console.log('📊 Consultando BigQuery...');
  const bigQueryData = await syncBigQuery();

  const allData = [...firestoreData, ...bigQueryData];
  console.log(`🔁 Subiendo ${allData.length} objetos a Algolia...`);

  await index.saveObjects(allData);
  console.log('✅ ¡Sincronización completada!');
}

main().catch(console.error);
