import { Schema } from 'mongoose';
import {
  TAddress,
  TCard,
  TCompany,
  TIsDeleted,
  TPayment,
} from './common.interface';

export const AddressSchema: Schema = new Schema<TAddress>({
  googleString: { type: String, required: false },
  street: { type: String, required: false },
  city: { type: String, required: false },
  prefecture: { type: String, required: false },
  postalCode: { type: String, required: false },
  country: { type: String, required: true },
  buildingName: { type: String, required: false },
  roomNumber: { type: String, required: false },
  state: { type: String, required: false },
  details: { type: String, required: false },
});
export const CardSchema: Schema = new Schema<TCard>({
  cardType: { type: String, enum: ['debit', 'credit'] },
  cardName: { type: String, required: true },
  cardNumber: { type: Number, required: true },
  cardHolderName: { type: String, required: true },
  address: { type: AddressSchema, required: true },
  expDate: { type: Date, required: true },
  country: { type: String, required: true },
  cvc_cvv: { type: String, required: true },
});
export const PaymentSchema: Schema = new Schema<TPayment>({
  billingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
});

export const CompanySchema: Schema = new Schema<TCompany>({
  category: {
    type: String,
    enum: ['home', 'shop', 'company', 'others'],
    required: true,
  },
  name: { type: String, required: true },
  type: { type: String, required: true },
  address: { type: AddressSchema, required: true },
});
export const IsDeletedSchema = new Schema<TIsDeleted>({
  value: { type: Boolean, default: false, required: true },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});
