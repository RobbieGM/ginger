import { InputType, Field, ID, Int } from 'type-graphql';
import { MaxLength, Matches } from 'class-validator';
import { Recipe } from '../data-types/Recipe';

@InputType()
export class RecipeInput implements Partial<Recipe> {
  @Field(type => ID)
  @Matches(/^A-Za-z0-9_-$/)
  id: string;

  @Field()
  @MaxLength(60)
  name: string;

  @Field()
  isPrivate: boolean;

  @Field()
  prepTime: number;

  @Field({ nullable: true })
  bookmarkDate?: number;

  @Field()
  cookTime: number;

  @Field(type => Int)
  servings: number;

  @Field(type => [String])
  ingredients: string[];

  @Field(type => [String])
  directions: string[];

  @Field({ nullable: true })
  imageURL?: string;

  @Field()
  lastModified: number;
}
