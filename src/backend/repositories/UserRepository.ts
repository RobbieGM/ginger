import { Repository, EntityRepository } from 'typeorm';
import { User } from '../data-types/User';
import { Service } from 'typedi';

@Service()
@EntityRepository()
export class UserRepository extends Repository<User> {}
