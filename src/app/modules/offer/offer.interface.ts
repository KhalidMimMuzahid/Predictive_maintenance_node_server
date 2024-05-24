import { TRole } from '../user/user.interface';

export type TOffer = {
  offerType: 'joiningBonus';
  joiningBonus?: {
    applicableFor: TRole;
    joiningBonusAmount: number;
  };
};
