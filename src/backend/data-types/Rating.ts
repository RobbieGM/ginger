import { ObjectType, Field, Int } from 'type-graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
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
  @Column({ type: 'bigint' })
  date: number;

  @Field(type => User)
  @ManyToOne(type => User, { onDelete: 'CASCADE' })
  user: User;

  @Field(type => Recipe)
  @ManyToOne(type => Recipe, { onDelete: 'CASCADE' })
  recipe: Recipe;
}
