import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { searchBox, hits } from 'instantsearch.js/es/widgets';

if (typeof window !== 'undefined') {
  const searchClient = algoliasearch(
    import.meta.env.PUBLIC_ALGOLIA_APP_ID,
    import.meta.env.PUBLIC_ALGOLIA_SEARCH_API_KEY
  );

  const search = instantsearch({
    indexName: import.meta.env.PUBLIC_ALGOLIA_INDEX_NAME,
    searchClient,
  });

  search.addWidgets([
    searchBox({
      container: '#searchbox',
      placeholder: 'Buscar películas...',
    }),
    hits({
      container: '#hits',
      templates: {
        item(hit, { html, components }) {
          return html`
            <div class="border hit">
              <span>${components.Highlight({ attribute: 'title', hit })}</span><br />
              <span>${components.Highlight({ attribute: 'overview', hit })}</span>
            </div>
          `;
        },
      },
    }),
  ]);

  search.start();
}
