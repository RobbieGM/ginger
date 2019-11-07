import React from 'react';
import RecipeList from '../../Recipe/List';
import baseClasses from '../style.module.scss';

const PopularTab: React.FC = () => {
  return (
    <div className={baseClasses.tab}>
      <h1>Popular</h1>
      <RecipeList
        recipes={[]}
        loading
        errorOccurred={false}
        errorMessage={<>An error occurred, please try again.</>}
        emptyState={<>There are no popular recipes right now.</>}
        loadMore={async () => []}
      />
    </div>
  );
};

export default PopularTab;
