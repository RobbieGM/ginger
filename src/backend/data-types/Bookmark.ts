import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User } from './User';
import { Recipe } from './Recipe';

@ObjectType()
@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(type => User, user => user.bookmarks)
  public user: User;

  @ManyToOne(type => Recipe, recipe => recipe.bookmarks)
  public recipe: Recipe;

  @Column()
  @Field()
  public date: Date;
}
