// import mongoose from 'mongoose';
// import { TSubscription } from '../subscription/subscription.interface';

// export type TSubscriptionPurchased = {
//   subscription: TSubscription & { _id: mongoose.Types.ObjectId }; // @Jawed vy;  we need to make plane together
//   isActive: boolean;
//   usages: {
//     showaUser?: {
//       machines: mongoose.Types.ObjectId[];
//       IOT: mongoose.Types.ObjectId[]; // IOT mean sensor modules attached
//     };
//     serviceProviderAdmin?: { engineers: mongoose.Types.ObjectId[] };
//   };
//   expDate: Date;
//   price: {
//     tax: number; // percentage; coming from mongodb set by showa admin;
//     applicablePrice: number; // this applicable price is calculated automatically if this package has any offers
//     totalPrice: number; //  applicablePrice+ ((applicablePrice*tax)/100)
//   };
// };
