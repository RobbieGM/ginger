import { ObjectType, Field } from 'type-graphql';
import { Recipe } from './Recipe';

@ObjectType()
export class InfiniteRecipeScrollResult {
  @Field()
  canLoadMore: boolean;

  @Field(type => [Recipe])
  results: Recipe[];
}
