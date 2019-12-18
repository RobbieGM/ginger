import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User } from './User';
import { Recipe } from './Recipe';

@ObjectType()
@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(
    type => User,
    user => user.bookmarks,
    { onDelete: 'CASCADE' }
  )
  public user: User;

  @ManyToOne(
    type => Recipe,
    recipe => recipe.bookmarks,
    { onDelete: 'CASCADE' }
  )
  public recipe: Recipe;

  @Column({ type: 'bigint' })
  @Field()
  public date: number;
}
