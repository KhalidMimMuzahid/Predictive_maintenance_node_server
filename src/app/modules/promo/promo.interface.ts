import { TRole } from '../user/user.interface';

export type TPromo = {
  promoType: 'joiningBonus' | 'marketplaceOffer';
  joiningBonus?: {
    applicableFor: TRole;
    joiningBonusAmount: number;
  };
  marketplaceOffer: {
    promoCOde: string;
    discountType: 'flatDiscount' | 'percentage';
    percentage: number; // percentage ; 0<x<100
    flatDiscount: number; //
  };
};
