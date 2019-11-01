import { InputType, Field, ID } from 'type-graphql';
import { Recipe } from 'store/state';

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

  @Field(type => [String])
  directions: string[];

  @Field({ nullable: true })
  imageURL: string;

  @Field()
  lastModified: Date;
}
