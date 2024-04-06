import { TAddress } from '../common/common.interface';

export type TUser = {
  uid: string;
  uniqueNumberId?: string; // why we need this
  firstName: string;
  lastName: string;
  language?: {
    katakana?: { firstName: string; lastName: string };
    korean?: { firstName: string; lastName: string };
  };
  // name: firstName + " " + lastName // this name field will be virtual
  email: string;
  phone: string;
  occupation?: string;
  dateOfBirth: string;
  photoUrl: string;
  gender: 'male' | 'female' | 'prefer-not-answer';
  stripeCustomerId: string; // we need it? cause we have a wallet to  handle all transaction and bank account
  role:
    | 'showa-user'
    | 'service-provider-admin'
    | 'service-provider-engineer'
    | 'service-provider-branch-manager'
    | 'service-provider-support-stuff' //  'service-provider' is it be a role? I think its a another model like ServiceProviderCompany Model
    | 'showa-admin'
    | 'showa-super-admin';

  canAccess?: ['xx' | 'yy' | 'zz']; // why we need this ?
  addresses: [{ isDeleted: boolean } & TAddress];
  stripeId: string;
  wallet: string; // it user is ObjectId of the Wallet model
  status: 'in-progress' | 'blocked' | 'approved';

  isDeleted: boolean; // by default false
  engineer?: string; // objectId of Engineer model; if this user is engineer only when this field will be created
};
