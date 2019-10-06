import { Repository, EntityRepository } from 'typeorm';
import { Service } from 'typedi';
import { Recipe } from '../data-types/Recipe';

@Service()
@EntityRepository()
export class RecipeRepository extends Repository<Recipe> {}
