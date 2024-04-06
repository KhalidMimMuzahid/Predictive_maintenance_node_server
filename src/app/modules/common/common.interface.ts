export type TAddress = {
  street: string;
  city: string;
  prefecture: string;
  postalCode: string;
  country: string;
  buildingName: string;
  roomNumber: string;
  state?: string;
  details?: string;
};

export type TCard = {
  cardType?: 'debit' | 'credit'; // or something else
  cardName: string; // name of the card like visa or master
  cardNumber: number; // number of the card
  cardHolderName: string; // name of the card holder
  address: TAddress; // why do we need this address in the card details
  expDate: Date; //
  country: string; //
  cvc_cvv: string; //
};

export type TPayment = {
  billingAddress: TAddress;
};

// id registration

export type TTeam = {
  teamName: string;
  createdBy: string; // objectId of User Model who is engineer at the same service provhmmider company
  createdAt: Date;
  members: [
    {
      member: string; // objectId of User Model who is engineer at the same service provider company
    },
  ];
};

export type TCompany = {
  category: 'home' | 'shop' | 'company' | 'others';
  name?: string;
  type?: string; // type of shop oor company
  address: TAddress; // where the company is located
};

// -------------------- ROUGH SHEET ---------------------
