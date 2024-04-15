import { Types } from 'mongoose';
import { TReservationRequest } from './reservation.interface';
import { ReservationRequest } from './reservation.model';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '../invoice/invoice.model';

const createReservationRequestIntoDB = async (payload: TReservationRequest) => {
  const invoice = new Invoice({ user: payload.user, invoiceNo: uuidv4() });

  const reservation = new ReservationRequest(payload);
  reservation.invoice = invoice._id;
  const result = await reservation.save();
  invoice.reservationRequest = result._id;
  await invoice.save();

  return result;
};

const getMyReservationsService = async (uid: String) => {

  const results = await ReservationRequest.find({user: uid}).populate('user');

  return results;
};

const getMyReservationsByStatusService = async (uid: String, status: String) => {

  const results = await ReservationRequest.find({user: uid, status: status}).populate('user');

  return results;
};

const getReservationsByStatusService = async (status: String) => {

  const results = await ReservationRequest.find({status: status}).populate('user').sort({ createdAt: -1 });

  return results;
};

export const reservationServices = {
  createReservationRequestIntoDB,
  getMyReservationsService,
  getMyReservationsByStatusService,
  getReservationsByStatusService
};