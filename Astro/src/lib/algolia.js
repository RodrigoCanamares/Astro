import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch('TU_APP_ID', 'TU_API_KEY');
export const searchIndex = searchClient.initIndex('NOMBRE_DEL_INDICE');
