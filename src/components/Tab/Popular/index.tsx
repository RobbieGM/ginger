import React from 'react';
import RecipeList from '../../Recipe/List';
import baseClasses from '../style.module.scss';

const PopularTab: React.FC = () => {
  const x = true;
  return (
    <div className={baseClasses.tab}>
      <h1>Popular</h1>
      <RecipeList
        recipes={[]}
        loading={x}
        errorMessage={<>An error occurred, please try again.</>}
        emptyState={<>There are no popular recipes right now.</>}
        loadMore={() => []}
      />
    </div>
  );
};

export default PopularTab;
