// ----------------START------------------
// 'all' -> for everyone, like a announcement
//  'showaUser' -> for all customer
//  'showaAdmin' -> for only showa Admin
//  'showaSubAdmin' -> for all showa Sub Admin
//  'serviceProviderAdmin' -> for all service provider admin
//  'serviceProviderSubAdmin' -> for all service provider sub admin
//  'serviceProviderBranchManager' -> for all service provider branch manager
//  'serviceProviderEngineer' -> for all service provider engineer
// ----------------END------------------
export type TNotification = {
  type: 'announcement';
  announcement?: {
    title: string; //max length: 100 characters
    content: string; // max length: 500 character
    photoUrl?: string; // max size :2 MB

    sendingAs: 'scheduled' | 'draft' | 'instant'; // in documents, it  is named as 'status' and
    scheduled: {
      scheduledDate: Date;
    };
    hasTriggered: boolean; // true if 'completed'
    triggeredCount: number; // number of how many time it has been triggered
    // if admin shoot again,  should be deleted previously sent notifications
    // if admin delete ,  should be also deleted previously sent notifications
  };

  receivers: string[];
  seenBy: string[];
  deletedBy: string[];
};
