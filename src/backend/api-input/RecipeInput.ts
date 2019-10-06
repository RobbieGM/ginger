import { InputType, Field, ID } from 'type-graphql';
import { Recipe } from '../data-types/Recipe';

@InputType()
export class RecipeInput implements Partial<Recipe> {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  prepTime: number;

  @Field()
  cookTime: number;

  @Field(type => [String])
  ingredients: string[];

  @Field()
  directions: string;

  @Field({ nullable: true })
  imageURL: string;

  @Field()
  lastModified: Date;
}
