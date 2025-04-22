import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import algoliasearch from 'algoliasearch';

// Algolia
const algoliaClient = algoliasearch(
  'TU_APP_ID',
  'TU_ADMIN_API_KEY'
);
const index = algoliaClient.initIndex('contenido_unificado');

// Firebase
const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_DOMINIO',
  projectId: 'TU_PROJECT_ID',
  appId: 'TU_APP_ID',
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// BigQuery
const bigquery = new BigQuery();

async function syncFirestore() {
  const snap = await getDocs(collection(db, 'peliculas'));
  return snap.docs.map(doc => ({
    objectID: `firestore_${doc.id}`,
    source: 'firestore',
    ...doc.data(),
  }));
}

async function syncBigQuery() {
  const [rows] = await bigquery.query(`
    SELECT id, title, overview FROM \`tu_proyecto.tu_dataset.tu_tabla\`
  `);

  return rows.map(row => ({
    objectID: `bigquery_${row.id}`,
    source: 'bigquery',
    ...row,
  }));
}

async function main() {
  const firestoreData = await syncFirestore();
  const bigqueryData = await syncBigQuery();

  const allData = [...firestoreData, ...bigqueryData];

  await index.saveObjects(allData);

  console.log(`✅ Sincronizado ${allData.length} objetos a Algolia`);
}

main().catch(console.error);
