export type TDeleteUser = {
  emailOrPhone: string;
};
export type TExtraData = {
  type: 'deleteUser' | 'more';
  deleteUser: TDeleteUser;
  //   more?: {
  //     //
  //   };
};
