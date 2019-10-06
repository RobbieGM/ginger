import { ObjectType, Field } from 'type-graphql';
import { Recipe } from './Recipe';
import { OneToMany, Entity, Column, PrimaryColumn } from 'typeorm';
import { Bookmark } from './Bookmark';
import { Rating } from './Rating';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field(type => [Recipe])
  @OneToMany(type => Recipe, recipe => recipe.user)
  recipes: Recipe[];

  @OneToMany(type => Rating, rating => rating.user)
  ratings: Rating[];

  @Field(type => [Recipe])
  @OneToMany(type => Bookmark, bookmark => bookmark.user)
  bookmarks: Recipe[];

  // @Field({ nullable: true })
  @Column({ nullable: true })
  googleAccountId?: string;
}
