import RecipeList from 'components/Recipe/List';
import { RecipePreview, RECIPE_PREVIEW_FIELD_TYPE } from 'components/Recipe/List/queries';
import React, { useState, useRef } from 'react';
import baseClasses from '../style.module.scss';
import { debounce, useInfiniteScrollRecipeQuery } from './helpers';
import { SEARCH } from './queries';
import classes from './style.module.scss';

const SearchTab: React.FC = () => {
  // const [query, setQuery] = useState<string | undefined>();
  const queryRef = useRef('');
  // eslint-disable-next-line no-sequences
  const { recipes, loading, error, canLoadMore, loadNext, reload } = useInfiniteScrollRecipeQuery<
    RECIPE_PREVIEW_FIELD_TYPE,
    { search: { results: RecipePreview[]; canLoadMore: boolean } }
  >(
    ({ offset, results }) => ({
      query: SEARCH,
      variables: { skip: offset, results, query: queryRef.current.trim() }
    }),
    1,
    data => data.search
  );
  console.debug('query =', queryRef.current.trim());
  console.debug('error =', error);
  const search = debounce((newQuery: string) => {
    queryRef.current = newQuery;
    reload();
  }, 250);
  return (
    <div className={baseClasses.tab}>
      <input
        className={`${classes.search} reset`}
        placeholder='Search for something delicious...'
        onChange={event => search(event.target.value)}
      />
      {queryRef.current.trim() && (
        <RecipeList
          recipes={recipes}
          loading={loading}
          error={error}
          canLoadMore={canLoadMore}
          emptyState='No results found'
          errorMessage='Failed to search for recipes. Please try again later.'
          loadNext={loadNext}
        />
      )}
    </div>
  );
};

export default SearchTab;
