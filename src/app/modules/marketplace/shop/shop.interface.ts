import { Types } from 'mongoose';
import { TAddress } from '../../common/common.interface';

export type TShop = {
  serviceProviderAdmin?: Types.ObjectId;
  ownedBy: 'serviceProviderCompany' | 'showa';
  type: string; // this shop type can be selected from a array list that is created by admin like,  electronics, fashion, pet food and treats
  serviceProviderCompany?: Types.ObjectId;
  status: 'pending' | 'success' | 'suspended';

  shopName: string;
  shopRegNo?: string;
  address?: TAddress;
  phone?: string;
  photoUrl?: string; // company  profile photo
  registrationDocument?: { photoUrl: string; title: string }[]; //
  wallet: Types.ObjectId;
};
