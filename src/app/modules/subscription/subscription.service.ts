import { TSubscription } from './subscription.interface';
import { Subscription } from './subscription.model';

const createSubscription = async (subscription: Partial<TSubscription>) => {
  const subscriptionData = await Subscription.create(subscription);

  return subscriptionData;
};

const getAllOfferedSubscriptionsForShowaUser = async () => {
  const offeredSubscriptions = await Subscription.find({
    'package.packageFor': 'showaUser',
  });

  return offeredSubscriptions;
};

export const subscriptionServices = {
  createSubscription,
  getAllOfferedSubscriptionsForShowaUser,
};
