import { AuthChecker } from 'type-graphql';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import { Context } from './Context';
import { User } from './data-types/User';

// @Service()
// class Tester {
//   constructor(@InjectManager() public readonly manager: EntityManager) {}
// }

// export const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
//   const manager = Container.get(EntityManager); // .manager;
//   const user = await manager.findOne(User, {
//     where: { id: context.userId }
//   });
//   if (user) {
//     if (roles.includes('verified')) {
//       return !!user.googleAccountId;
//     }
//     return true;
//   }
//   return false;
// };

@Service()
export class Authenticator {
  @InjectManager() private readonly manager: EntityManager;

  authChecker: AuthChecker<Context> = async ({ context }, roles) => {
    const user = await this.manager.findOne(User, {
      where: { id: context.userId }
    });
    if (user) {
      if (roles.includes('verified')) {
        return !!user.googleAccountId;
      }
      return true;
    }
    return false;
  };
}
