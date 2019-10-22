import { Service } from 'typedi';
import { Resolver, Mutation, Query } from 'type-graphql';
import { InjectManager } from 'typeorm-typedi-extensions';
import { EntityManager } from 'typeorm';
import { User } from '../data-types/User';

@Service()
// @Resolver(of => User)
@Resolver()
export class UserResolver /* implements ResolverInterface<User> */ {
  @InjectManager() private readonly manager: EntityManager;

  @Query(returns => [User])
  dumpUsers() {
    return this.manager.find(User);
  }

  @Mutation(returns => String)
  async createAccount() {
    const newUser = await this.manager.save(this.manager.create(User));
    return newUser.id;
  }
}
