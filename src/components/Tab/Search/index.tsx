import { InfiniteRecipeScrollResult } from 'backend/data-types/InfiniteRecipeScrollResult';
import RecipeList from 'components/Recipe/List';
import { useInfiniteScrollRecipeQuery } from 'components/Recipe/List/infinite-scroll';
import React, { useRef } from 'react';
import baseClasses from '../style.module.scss';
import { debounce } from './helpers';
import { SEARCH } from './queries';
import classes from './style.module.scss';

const SearchTab: React.FC = () => {
  // const [query, setQuery] = useState<string | undefined>();
  const queryRef = useRef('');
  const { recipes, loading, error, canLoadMore, loadNext, reload } = useInfiniteScrollRecipeQuery<{
    search: InfiniteRecipeScrollResult;
  }>(
    ({ offset, results }) => ({
      query: SEARCH,
      variables: { skip: offset, results, query: queryRef.current.trim() }
    }),
    data => data.search
  );
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
