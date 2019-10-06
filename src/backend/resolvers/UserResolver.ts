import { Service } from 'typedi';
import { Resolver, Mutation, Arg } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserRepository } from '../repositories/UserRepository';

@Service()
// @Resolver(of => User)
@Resolver()
export class UserResolver /* implements ResolverInterface<User> */ {
  constructor(
    @InjectRepository() private readonly repository: UserRepository
  ) {}

  @Mutation(returns => Boolean)
  async createAccount(@Arg('id') id: string) {
    if (await this.repository.findOne({ id })) {
      return false;
    }
    const newUser = this.repository.create({
      id,
      recipes: [],
      ratings: [],
      bookmarks: []
    });
    this.repository.save(newUser);
    return true;
  }
}
