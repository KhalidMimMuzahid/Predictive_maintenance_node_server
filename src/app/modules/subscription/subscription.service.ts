import { Subscription } from './subscription.model';
import { TSubscription } from './subscription.interface';

const createSubscription = async (subscription: Partial<TSubscription>) => {
  const subscriptionData = await Subscription.create(subscription);
  return subscriptionData;
};

export const subscriptionServices = {
  createSubscription,
};
