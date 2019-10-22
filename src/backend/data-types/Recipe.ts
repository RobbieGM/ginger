import { ObjectType, Field, ID, Float, Int, Authorized } from 'type-graphql';
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Rating } from './Rating';
import { Bookmark } from './Bookmark';
import { User } from './User';

@ObjectType()
@Entity()
export class Recipe {
  @Field(type => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(type => User)
  @ManyToOne(type => User, user => user.recipes)
  user: User;

  @Field(type => Float, { nullable: true })
  averageRating?: number;

  @Field(type => [Rating])
  @OneToMany(type => Rating, rating => rating.recipe)
  ratings: Rating[];

  @Authorized()
  @Field(type => Int)
  userRating?: number;

  @Authorized()
  @Field()
  bookmarkDate?: Date;

  @OneToMany(type => Bookmark, bookmark => bookmark.recipe)
  bookmarks: Bookmark[];

  @Field()
  @Column()
  prepTime: number;

  @Field()
  @Column()
  cookTime: number;

  @Field(type => [String])
  @Column('simple-json')
  ingredients: string[];

  @Field()
  @Column()
  directions: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageURL?: string;

  @Field()
  @UpdateDateColumn()
  lastModified: Date;
}

// export type RecipeType = Recipe;
