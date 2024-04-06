export type TEngineer = {
  user: string; // objectId of the user model
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
