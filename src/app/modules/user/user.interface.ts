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

// {

//     // prefecture : {type: String}, // why we need this

//     buildingNameRoomNumber : {type: String},
//     uniqueNumberId : {type: String},
//     stripeCustomerId : {type: String},
// },

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

// I have some confusion about this transaction model
export type TTransaction = {
  category: 'send-money' | 'fund-transfer' | 'payment' | 'mb-transfer'; // value can be like
  transactionId: string; //
  from: string; // objectId of the UserModel
  recipient: string; // objectId of the UserModel

  transactionDate: Date; // when this transaction will be happening
  paymentMethod: 'showa-balance' | 'showa-point' | 'card'; // what about showa mb ?
  referenceId: string; // objectId of the UserModel
  netAmount: number; //
  transactionFee: number; //
  totalAmount: number; // total amount
  status: 'pending' | 'success' | 'failure'; //  success or approved?? which sounds good?
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
  gender: 'male' | 'female' | 'others';

  role:
    | 'showa-user'
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

  // isDeleted: boolean;
  engineer?: TEngineer; // if this user is engineer only when this field will be created
};

export type TTeam = {
  teamName: string;
  createdBy: string; // objectId of User Model who is engineer at the same service provider company
  createdAt: Date;
  members: [
    {
      member: string; // objectId of User Model who is engineer at the same service provider company
    },
  ];
};
export type TServiceProviderCompany = {
  companyName: string;
  photoUrl: string; // company  profile photo
  representativeName: string;
  address: TAddress;
  fax: string;
  corporateNo: string;
  phone: string;
  currency:
    | 'us-dollar'
    | 'japan-yen'
    | 'korean-yen'
    | 'indian-rupee'
    | 'euro'
    | 'pound';
  capital: number;
  invoiceRegistrationNo: string; // what is it ?
  bank: {
    bankName: string;
    branchName: string;
    accountNo: number;
    postalCode: string;
    address: TAddress;
    departmentInCharge: string;
    personInChargeName: string;
    card: TCard;
  };
  emergencyContact: {
    departmentInCharge: string;
    personInChargeName: string;
    contactNo: string;
    email: string;
  };

  registrationDocumentPhotoUrl: [string];
};
// vendor
export type TServiceProviderBranch = {
  type: string;
  branchName: string;
  email: string;
  contactNo: string;
  language?: {
    katakana?: { branchName: string };
    korean?: { branchName: string };
  };
  address: TAddress;
  departmentInCharge: string;
  personInChargeName: string;
  services: [string]; //or 'dish-washing-machine'or 'container-washing-machine'or 'pallet-washing-machine'or 'parts-washing-machine'or 'sushi-maker'or 'refrigerator'or 'air-conditioner'or 'laundry-machine' or custom chosen
};

export type TCompany = {
  category: 'shop' | 'company';
  name: string;
  type: string;
  address: TAddress;
};
export type TSensor = {
  iotProductId: string; // unique identifier
  name: string;
  macAddress: string;
  price: number;
  status: 'in-stock' | 'sold-out';
  sensorType: 'temperature' | 'vibration';
  seller: string; // objectId of TServiceProviderBranch
};
export type TAttachedSensor = {
  sensor: string; // objectId of TSensor
  purpose: string;
  sectionName: string;
  isSwitchedOn: string;
  module: string;
  machine: string; // objectId of Machine model
  sensorData: [{ vibration: [number]; temperature: [number] }];
};
export type TMachine = {
  status: 'abnormal' | 'normal';
  category: 'washing-machine' | 'general-machine';
  name: string;
  generalMachine?: {
    homeName: string;
    homeType: string;
  };
  company: TCompany;
  type: string;
  brand: string; // as mentioned in figma
  model: string; // as mentioned in figma
  environment: 'indoor' | 'outdoor'; // as mentioned in figma  like  "indoor" or "outdoor"
  sensors?: [TSensor];
};

export type TReservationRequest = {
  requestId: string; // customized unique Identifier
  machine: string; //ObjectId for Machine Model;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'canceled'; // reservation request status; we have another status --> "expired" , we can generate this status in frontend by checking, if status is not completed and also the last date of schedule list is over
  date: Date; // date when the reservation arises
  location: TAddress; // where this machine is located
  isSensorConnected: boolean; // machineType as figma; true if sensor is sensor-connected, false if not sensor-non-connected
  problem: {
    issues: [string]; // all issues title one by one
    problemDescription: string;
    images: [{ image: string; comment: string }];
  };
  schedule: {
    category: 'on-demand' | 'within-one-week' | 'within-two-week';
    date: Date;
    schedules: [Date]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
  };
  feedBack: {
    user: string; //ObjectId for User Model;
    ratings: number;
    message: string;
  };

  allBids: [
    {
      bidder: string; // objectId  of ServiceProviderCompany or ServiceProviderBranch or what ?
      bidAmount: number; // price for the bid
    },
  ];

  postBiddingProcess: {
    bidWinner: string; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
    invoice: string; // objectId of Invoice model
  };
};

export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  reservationRequest: [string]; // objectId of TReservationRequest Model
};

export type TInvoice = {
  invoiceNo: string;
  reservationRequest: string; // objectId of ReservationRequest model
  additionalProducts: {
    products: [
      {
        productName: string;
        quantity: number;
        // promo:number // percentage of promo ; by default 0%   // is it the same of discount offer? what is actually a promo?
        tax: number; // percentage of tax ; by default 0%
        price: {
          amount: number;
          currency: string;
        };
      },
    ];
    totalAmount: number;
  };

  taskAssignee: [
    {
      taskName: string;
      taskDescription: string;
      engineer: string; // objectId of a Engineer who is working for this company
      taskStatus: 'inspection' | 'completed' | 'pending';
      comments: [string];
    },
  ];
  report: {
    // maintenance report
    cost: { totalCost: number }; // more field can be added
  };
};
export type TSubscription = {
  package: string; // @Jawed vy;  we need to make plane together
};
// -------------------- ROUGH SHEET ---------------------
//offer
export type TPromo = {
  discountInPercentage: number; // the range must be 0 to 100
  discountInAmount: number; //  admin can directly set the offer amount
};
