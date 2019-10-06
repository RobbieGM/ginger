import {
  Resolver,
  ResolverInterface,
  Query,
  Arg,
  FieldResolver,
  Root,
  Mutation
} from 'type-graphql';
import { Recipe } from '../data-types/Recipe';
import { RecipeInput } from '../api-input/RecipeInput';
import { Service } from 'typedi';
import { RecipeRepository } from '../repositories/RecipeRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
@Resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  constructor(
    @InjectRepository() private readonly repository: RecipeRepository
  ) {}
  // @Query(returns => Recipe)
  // async dumbRecipe(): Promise<Recipe> {
  //   return {
  //     id: '293f8',
  //     name: 'nothing',
  //     ratings: [],
  //     prepTime: 0,
  //     cookTime: 2,
  //     ingredients: [],
  //     directions: 'put on the grill until it burns',
  //     lastModified: new Date(),
  //   };
  // }

  @Query(returns => Recipe)
  async recipe(@Arg('id') id: string) {
    return await this.repository.findOne({ id });
  }

  @Mutation(returns => [Recipe])
  async mergeRecipes(
    @Arg('recipes', type => [RecipeInput]) recipes: RecipeInput[]
  ) {
    const updatedRecipesForClient: Recipe[] = [];
    const updatedRecipesForServer: Recipe[] = [];
    const existingIdsForServer: string[] = []; // If an id from recipes isn't found in this array, it is new for the server

    const conflictingRecipes = await this.repository.find({
      where: { id: recipes.map(r => r.id) }
    });
    conflictingRecipes.forEach(serverRecipe => {
      existingIdsForServer.push(serverRecipe.id);
      const clientRecipe = recipes.find(r => r.id === serverRecipe.id)!;
      const clientLastModified = new Date(
        Math.max(clientRecipe.lastModified.getTime(), Date.now())
      );
      if (clientLastModified > serverRecipe.lastModified) {
        updatedRecipesForServer.push({
          ...serverRecipe,
          ...clientRecipe
        });
      } else {
        updatedRecipesForClient.push(serverRecipe);
      }
    });

    return updatedRecipesForClient;
  }

  @FieldResolver()
  averageRating(
    @Root() recipe: Recipe,
    @Arg('since') sinceDate: Date
  ): number | undefined {
    const ratings = recipe.ratings.filter(rating => rating.date > sinceDate);
    if (!ratings.length) return undefined;

    const ratingsSum = ratings.reduce((a, b) => a + b.value, 0);
    return ratingsSum / ratings.length;
  }
}
