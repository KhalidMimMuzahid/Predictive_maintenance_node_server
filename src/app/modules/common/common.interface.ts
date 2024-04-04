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
  cardName: string; // name of the card like visa or master
  cardNumber: number; // number of the card
  cardHolderName: string; // name of the card holder
  address: TAddress; // why do we need this address in the card details
  expDate: Date; //
  country: string; //
  cvc_cvv: string; //
};
export type TWallet = {
  user: string; // it user is ObjectId of the user model
  cards: [{ card: TCard; isDeleted: boolean }];
  balance: number; //
  point: number; //
  showaMB: number; //
};

export type TPayment = {
  billingAddress: TAddress;
};

export type TEngineer = {
  current: {
    designation: string;
    company: string; // objectId of the ServiceProviderCompany
    branch: string; // objectId of the ServiceProviderBranch model
    joiningDate: Date;
  };
  ratings: {
    rate: number; // 0 to 5
    feedback: [
      {
        comment: string;
        rate: number;
        user: string; // objectId of the User
      },
    ];
  };
  history: [
    {
      designation: string;
      company: string; // objectId of the ServiceProviderCompany
      branch: string; // objectId of the ServiceProviderBranch model
      joiningDate: Date;
      endingDate: Date;
    },
  ];
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
  category: 'shop' | 'company';
  name: string;
  type: string;
  address: TAddress;
};

// -------------------- ROUGH SHEET ---------------------
