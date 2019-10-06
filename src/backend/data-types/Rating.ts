import { ObjectType, Field, Int } from 'type-graphql';
import { User } from './User';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Recipe } from './Recipe';

@ObjectType()
@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(type => Int)
  @Column()
  value: number;

  @Field()
  @Column()
  date: Date;

  @Field(type => User)
  @ManyToOne(type => User)
  user: User;

  @Field(type => Recipe)
  @ManyToOne(type => Recipe)
  recipe: Recipe;
}
