import {
  Resolver,
  ResolverInterface,
  Query,
  Arg,
  FieldResolver,
  Root,
  Mutation,
  Authorized,
  Ctx
} from 'type-graphql';
import { InjectManager } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { Recipe } from '../data-types/Recipe';
import { RecipeInput } from '../api-input/RecipeInput';
import { Context } from '../Context';
import { User } from '../data-types/User';
import { Bookmark } from '../data-types/Bookmark';

@Service()
@Resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  @InjectManager() private readonly manager: EntityManager;

  @Query(returns => Recipe)
  recipe(@Arg('id') id: string) {
    return this.manager.findOne(Recipe, { id });
  }

  @Authorized()
  @Query(returns => [Recipe])
  async myRecipes(@Ctx() context: Context) {
    const user = await this.manager.findOneOrFail(User, {
      where: {
        id: context.userId
      },
      relations: ['recipes']
    });
    console.log('user', user);
    return user.recipes;
  }

  @Authorized()
  @Mutation(returns => [Recipe])
  async mergeRecipes(@Arg('recipes', type => [RecipeInput]) recipes: RecipeInput[]) {
    const updatedRecipesForClient: Recipe[] = [];
    const updatedRecipesForServer: Recipe[] = [];
    const existingIdsForServer: string[] = []; // If an id from recipes isn't found in this array, it is new for the server

    const conflictingRecipes = await this.manager.find(Recipe, {
      where: {
        id: recipes.map(r => r.id)
      }
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
  averageRating(@Root() { ratings }: Recipe): number | undefined {
    if (!ratings.length) return undefined;

    const ratingsSum = ratings.reduce((a, b) => a + b.value, 0);
    return ratingsSum / ratings.length;
  }

  @Authorized()
  @FieldResolver()
  async bookmarkDate(@Root() recipe: Recipe, @Ctx() context: Context): Promise<Date | undefined> {
    const bookmark = await this.manager.findOne(Bookmark, {
      where: {
        user: {
          id: context.userId
        },
        recipe: {
          id: recipe.id
        }
      }
    });
    return bookmark?.date;
  }

  @Authorized()
  @FieldResolver()
  userRating(@Root() recipe: Recipe, @Ctx() context: Context): number | undefined {
    return undefined;
  }
}
