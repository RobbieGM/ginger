import {
  Resolver,
  ResolverInterface,
  Query,
  Arg,
  FieldResolver,
  Root,
  Mutation,
  Authorized,
  Ctx,
  Int,
  Float
} from 'type-graphql';
import { InjectManager } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';
import { EntityManager, In } from 'typeorm';
import { Recipe } from '../data-types/Recipe';
import { RecipeInput } from '../api-input/RecipeInput';
import { Context } from '../Context';
import { Bookmark } from '../data-types/Bookmark';
import { Rating } from '../data-types/Rating';

@Service()
@Resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  @InjectManager() private readonly manager: EntityManager;

  @Query(returns => [Recipe])
  async recipes(@Arg('ids', type => [String]) ids: string[]) {
    return this.manager.find(Recipe, { where: { id: In(ids) } }).then(recipes => {
      return recipes;
    });
  }

  @Authorized()
  @Query(returns => [Recipe])
  async myRecipes(@Ctx() context: Context) {
    const recipes = this.manager.find(Recipe, {
      where: {
        user: {
          id: context.userId
        }
      },
      order: {
        lastModified: 'DESC'
      }
    });
    return recipes;
  }

  @Authorized()
  @Mutation(returns => [Recipe])
  async mergeRecipes(
    @Arg('recipes', type => [RecipeInput]) recipes: RecipeInput[],
    @Ctx() context: Context
  ) {
    const updatedRecipesForClient: Recipe[] = [];
    const editedRecipes: Recipe[] = [];
    const allConflictingRecipes = await this.manager.find(Recipe, {
      where: {
        id: In(recipes.map(r => r.id))
      },
      relations: ['user']
    });
    const conflictingRecipesForUser = allConflictingRecipes.filter(
      recipe => recipe.user.id === context.userId
    ); // Consists only of recipes the user may update
    conflictingRecipesForUser.forEach(serverRecipe => {
      const clientRecipe = recipes.find(r => r.id === serverRecipe.id)!;
      const clientLastModified = Math.max(clientRecipe.lastModified, Date.now());
      if (clientLastModified > serverRecipe.lastModified) {
        editedRecipes.push({
          ...serverRecipe,
          ...clientRecipe
        });
      } else {
        updatedRecipesForClient.push(serverRecipe);
      }
    });
    editedRecipes.forEach(recipe => {
      this.manager.save(Recipe, recipe);
    });
    const recipeIdExists = (id: string) => allConflictingRecipes.map(r => r.id).includes(id);
    const createdRecipes = recipes.filter(recipe => !recipeIdExists(recipe.id));
    createdRecipes.forEach(recipe => {
      this.manager.save(Recipe, {
        ...recipe,
        creationDate: recipe.lastModified,
        user: { id: context.userId }
      });
    });
    return updatedRecipesForClient;
  }

  @Authorized()
  @Mutation(returns => Boolean, { nullable: true })
  async setBookmarkDate(
    @Arg('recipeId') recipeId: string,
    @Arg('date', type => Float, { nullable: true }) date: number | undefined,
    @Ctx() { userId }: Context
  ) {
    console.log('setting bookmark date to', date);
    const existingBookmarks = await this.manager.find(Bookmark, {
      where: {
        recipe: {
          id: recipeId
        },
        user: {
          id: userId
        }
      }
    });
    await Promise.all(existingBookmarks.map(bookmark => this.manager.remove(bookmark))); // Remove potential duplicates
    if (date != null) {
      this.manager.save(Bookmark, {
        user: {
          id: userId
        },
        recipe: {
          id: recipeId
        },
        date
      });
    }
  }

  @Authorized()
  @FieldResolver()
  async isMine(@Root() { id }: Recipe, @Ctx() { userId }: Context) {
    const thisRecipe = await this.manager.findOne(Recipe, {
      where: {
        id,
        user: { id: userId }
      }
    });
    return !!thisRecipe;
  }

  @FieldResolver()
  async averageRating(@Root() { id }: Recipe) {
    const ratings = await this.manager.find(Rating, {
      where: {
        recipe: {
          id
        }
      }
    });
    if (!ratings.length) return undefined;

    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return sum / ratings.length;
  }

  @Authorized()
  @FieldResolver()
  async bookmarkDate(
    @Root() { id }: Recipe,
    @Ctx() { userId }: Context
  ): Promise<number | undefined> {
    const bookmark = await this.manager.findOne(Bookmark, {
      where: {
        user: {
          id: userId
        },
        recipe: {
          id
        }
      }
    });
    return bookmark?.date;
  }

  @Authorized()
  @FieldResolver()
  async userRating(@Root() { id }: Recipe, @Ctx() context: Context) {
    if (!context.userId) return undefined;
    const rating = await this.manager.findOne(Rating, {
      where: {
        user: {
          id: context.userId
        },
        recipe: {
          id
        }
      }
    });
    if (rating) return rating.value;
    return undefined;
  }
}
