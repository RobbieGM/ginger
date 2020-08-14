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
import { EntityManager, In, DeepPartial } from 'typeorm';
import { InfiniteRecipeScrollResult } from '../data-types/InfiniteRecipeScrollResult';
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
  @Query(returns => InfiniteRecipeScrollResult)
  async myRecipes(
    @Arg('skip', type => Int) skip: number,
    @Arg('results', type => Int) limit: number,
    @Ctx() ctx: Context
  ) {
    const results = await this.manager.find(Recipe, {
      where: {
        user: {
          id: ctx.userId
        }
      },
      order: {
        lastModified: 'DESC'
      },
      take: limit + 1,
      skip
    });
    const canLoadMore = results.length === limit + 1;
    if (canLoadMore) results.pop();
    return { results, canLoadMore };
  }

  @Query(returns => InfiniteRecipeScrollResult)
  async search(
    @Arg('query') query: string,
    @Arg('skip', type => Int) skip: number,
    @Arg('results', type => Int) limit: number,
    @Ctx() ctx: Context
  ) {
    const results: Partial<
      Recipe
    >[] = await this.manager.query(
      `select * from "recipe" where name @@ $1 and ("userId" = $2 or not "isPrivate") order by ts_rank(to_tsvector('english', name), plainto_tsquery('english', $3)) desc limit $4 offset $5`,
      [query, ctx.userId, query, limit + 1, skip]
    );
    const canLoadMore = results.length === limit + 1;
    if (canLoadMore) results.pop();
    return { results, canLoadMore };
  }

  @Authorized()
  @Mutation(returns => [Recipe])
  async mergeRecipes(
    @Arg('recipes', type => [RecipeInput]) recipes: RecipeInput[],
    @Ctx() ctx: Context
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
      recipe => recipe.user.id === ctx.userId
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

    const save = (recipe: DeepPartial<Recipe>) => this.manager.save(Recipe, recipe);
    await Promise.all(editedRecipes.map(save));
    const recipeIdExists = (id: string) => allConflictingRecipes.map(r => r.id).includes(id);
    const createdRecipes = recipes.filter(recipe => !recipeIdExists(recipe.id));

    await Promise.all(
      createdRecipes.map(recipe =>
        save({
          ...recipe,
          creationDate: recipe.lastModified,
          user: { id: ctx.userId }
        })
      )
    );
    // Return even the recipes the client knows about--urql will only invalidate caches that way
    return (updatedRecipesForClient as RecipeInput[]).concat(createdRecipes);
  }

  @Authorized()
  @Mutation(returns => Recipe)
  async delete(@Arg('recipeId') recipeId: string, @Ctx() ctx: Context) {
    const deletedRecipe = await this.manager.findOneOrFail(Recipe, {
      where: {
        id: recipeId,
        user: {
          id: ctx.userId
        }
      }
    });
    this.manager.remove(deletedRecipe);
    return deletedRecipe;
  }

  @Authorized()
  @Mutation(returns => Recipe, { nullable: true })
  async setRating(
    @Arg('rating', type => Int) rating: number,
    @Arg('recipeId') recipeId: string,
    @Ctx() ctx: Context
  ): Promise<Partial<Recipe> | undefined> {
    const existingRating = await this.manager.findOne(Rating, {
      where: {
        recipe: {
          id: recipeId
        },
        user: {
          id: ctx.userId
        }
      }
    });
    if (existingRating && rating === existingRating.value) return undefined;
    if (existingRating) await this.manager.remove(existingRating);
    await this.manager.save(Rating, {
      user: {
        id: ctx.userId
      },
      recipe: {
        id: recipeId
      },
      value: rating,
      date: Date.now()
    });
    return { id: recipeId };
  }

  @Authorized()
  @Mutation(returns => Recipe, { nullable: true })
  async setBookmarkDate(
    @Arg('recipeId') recipeId: string,
    @Arg('date', type => Float, { nullable: true }) date: number | undefined,
    @Ctx() ctx: Context
  ): Promise<Partial<Recipe>> {
    const existingBookmark = await this.manager.findOne(Bookmark, {
      where: {
        recipe: {
          id: recipeId
        },
        user: {
          id: ctx.userId
        }
      }
    });
    if (existingBookmark) await this.manager.remove(existingBookmark); // Remove potential duplicate
    if (date != null) {
      await this.manager.save(Bookmark, {
        user: {
          id: ctx.userId
        },
        recipe: {
          id: recipeId
        },
        date
      });
    }
    return { id: recipeId };
  }

  @Authorized()
  @FieldResolver()
  async isMine(@Root() recipe: Recipe, @Ctx() ctx: Context) {
    const thisRecipe = await this.manager.findOne(Recipe, {
      where: {
        id: recipe.id,
        user: { id: ctx.userId }
      }
    });
    return !!thisRecipe;
  }

  @FieldResolver()
  async averageRating(@Root() recipe: Recipe) {
    const ratings = await this.manager.find(Rating, {
      where: {
        recipe: {
          id: recipe.id
        }
      }
    });
    if (!ratings.length) return undefined;

    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return sum / ratings.length;
  }

  @Authorized()
  @FieldResolver()
  async bookmarkDate(@Root() recipe: Recipe, @Ctx() ctx: Context): Promise<number | undefined> {
    const bookmark = await this.manager.findOne(Bookmark, {
      where: {
        user: {
          id: ctx.userId
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
  async userRating(@Root() recipe: Recipe, @Ctx() ctx: Context) {
    if (!ctx.userId) return undefined;
    const rating = await this.manager.findOne(Rating, {
      where: {
        user: {
          id: ctx.userId
        },
        recipe: {
          id: recipe.id
        }
      }
    });
    if (rating) return rating.value;
    return undefined;
  }
}
