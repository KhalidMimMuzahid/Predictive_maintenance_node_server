import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { InvoiceGroup } from '../invoiceGroup/invoiceGroup.model';
import { ReservationRequestGroup } from '../reservationGroup/reservationGroup.model';
import { TeamOfEngineers } from '../teamOfEngineers/teamOfEngineers.model';
import { User } from '../user/user.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import {
  TAdditionalProduct,
  TAssignedTaskType,
  TInspecting,
} from './invoice.interface';
import { Invoice } from './invoice.model';
import {
  getAllInvoicesOfReservationGroup,
  isEngineerBelongsToThisTeamByInvoiceGroup,
  isEngineerBelongsToThisTeamByReservation,
} from './invoice.utils';
import { ReservationRequest } from '../reservation/reservation.model';

const addAdditionalProduct = async ({
  user,
  role,
  reservationRequest_id,
  additionalProduct,
}: {
  user: mongoose.Types.ObjectId;
  role: 'showaAdmin' | 'serviceProviderEngineer';
  reservationRequest_id: string;
  additionalProduct: TAdditionalProduct;
}) => {
  const existingInvoice = await Invoice.findOne({
    reservationRequest: new mongoose.Types.ObjectId(reservationRequest_id),
  }).populate({
    path: 'invoiceGroup',
    options: { strictPopulate: false },
  });
  if (!existingInvoice) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no invoice found for this reservation',
    );
  }
  let isEngineerBelongsToThisTeamData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isUserBelongsToThisTeam: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serviceProviderEngineer: any;
  };
  if (role === 'serviceProviderEngineer') {
    isEngineerBelongsToThisTeamData =
      await isEngineerBelongsToThisTeamByInvoiceGroup(
        existingInvoice?.invoiceGroup,
        user,
      );
    if (
      !isEngineerBelongsToThisTeamData?.isUserBelongsToThisTeam ||
      !isEngineerBelongsToThisTeamData?.serviceProviderEngineer
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'you are not the engineer for this reservation or something went wrong',
      );
    }
  }

  const { serviceProviderEngineer } = isEngineerBelongsToThisTeamData;

  if (existingInvoice.taskStatus === 'completed') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this reservation has already been completed; you can not add additional products',
    );
  }
  //   console.log({
  //     result,
  //   });
  //   const resGroup = await ReservationRequestGroup.findById(
  //     new mongoose.Types.ObjectId(reservationRequestGroup_id),
  //   ).populate({
  //     path: 'reservationRequests'   ,
  //     options: { strictPopulate: false }    ,
  //   });

  // calculate the total number according to its tax and price and quantity
  additionalProduct.cost.totalAmount =
    additionalProduct.cost.price * additionalProduct.cost.quantity;
  additionalProduct.addedByUserType = role;
  additionalProduct.addedBy = serviceProviderEngineer || undefined;
  // console.log({ additionalProduct });
  //   now push this additional data to additional products array
  existingInvoice.additionalProducts.products.push(additionalProduct);
  existingInvoice.additionalProducts.totalAmount +=
    additionalProduct.cost.totalAmount;
  await existingInvoice.save();
  return existingInvoice;
};
const inspection = async ({
  user,
  reservationRequest,
  inspectingData,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequest: string;
  inspectingData: TInspecting;
}) => {
  const engineerExistsInThisTeam =
    await isEngineerBelongsToThisTeamByReservation({
      reservationRequest,
      user: user,
    });

  if (engineerExistsInThisTeam) {
    const serviceProviderEngineer = await ServiceProviderEngineer.findOne({
      user,
    });
    if (!serviceProviderEngineer?._id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }

    const invoiceData = await Invoice.findOne({
      reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
    });

    if (invoiceData?.taskStatus !== 'ongoing') {
      throw new AppError(httpStatus.BAD_REQUEST, 'reservation is not ongoing');
    } else if (invoiceData?.inspection?.isInspecting !== true) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'first start inspection before adding product',
      );
    } else if (
      invoiceData?.inspection?.isInspecting === true &&
      invoiceData?.inspection?.serviceProviderEngineer?.toString() !==
        serviceProviderEngineer?._id?.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this reservation has already been inspected by other engineer in your team',
      );
    }
    const products = inspectingData?.additionalProducts?.products?.map(
      (product) => {
        return {
          addedBy: serviceProviderEngineer?._id,
          addedByUserType: 'serviceProviderEngineer',
          productName: product?.productName,

          cost: {
            price: product?.cost?.price,
            quantity: product?.cost?.quantity,
            // tax: { type: Number, default: 0 },
            totalAmount: product?.cost?.price * product?.cost?.quantity,
          },
        };
      },
    );
    const totalAmount =
      products?.reduce(
        (accumulator, product) => accumulator + product?.cost?.totalAmount,
        0,
      ) || 0;

    const documents = inspectingData?.additionalProducts?.documents;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateObject: any = {
      $inc: {
        'additionalProducts.totalAmount': totalAmount,
      },
    };

    if (products?.length > 0 || documents?.length > 0) {
      const $push = {};
      if (products?.length > 0) {
        $push['additionalProducts.products'] = {
          $each: products,
        };
      }
      if (documents?.length > 0) {
        $push['additionalProducts.documents'] = {
          $each: documents,
        };
      }
      updateObject['$push'] = $push;
    }
    if (inspectingData?.inspection) {
      updateObject['inspection'] = {
        issues: invoiceData?.inspection?.issues,
        isInspecting: false,
        serviceProviderEngineer:
          invoiceData?.inspection?.serviceProviderEngineer,

        ...inspectingData?.inspection,
      };
    }
    //  else {
    //   updateObject['inspection'] = {
    //     serviceProviderEngineer: serviceProviderEngineer?._id,
    //   };
    // }

    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
        taskStatus: 'ongoing',
      },
      updateObject,
      // {
      //   inspection: inspectingData?.inspection,

      //   $inc: {
      //     'additionalProducts.totalAmount': totalAmount,
      //   },
      //   $push: {
      //     'additionalProducts.products': {
      //       $each: products,
      //     },
      //     'additionalProducts.documents': {
      //       $each: documents,
      //     },
      //   },
      // },
    );

    if (!updatedInvoice) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    } else {
      return null;
    }
    // const updatedReservationRequest =
    //   await ReservationRequest.findByIdAndUpdate(reservationRequest, {
    //     reasonOfReSchedule: rescheduleData?.reasonOfReSchedule,
    //     $push: { 'schedule.schedules': new Date(rescheduleData.schedule) },
    //   });
    // return updatedReservationRequest;
  } else {
    // return error
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not in the team that has assigned in this reservation',
    );
  }
};

const startInspection = async ({
  user,
  reservationRequest,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequest: string;
}) => {
  const engineerExistsInThisTeam =
    await isEngineerBelongsToThisTeamByReservation({
      reservationRequest,
      user: user,
    });

  if (engineerExistsInThisTeam) {
    const serviceProviderEngineer = await ServiceProviderEngineer.findOne({
      user,
    });
    if (!serviceProviderEngineer?._id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const invoiceData = await Invoice.findOne({
      reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
    });

    if (invoiceData?.taskStatus !== 'ongoing') {
      throw new AppError(httpStatus.BAD_REQUEST, 'reservation is not ongoing');
    } else if (
      invoiceData?.inspection?.isInspecting === true &&
      invoiceData?.inspection?.serviceProviderEngineer?.toString() !==
        serviceProviderEngineer?._id?.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this reservation has already been inspected by other engineer in your team',
      );
    } else if (
      invoiceData?.inspection?.isInspecting === true &&
      invoiceData?.inspection?.serviceProviderEngineer?.toString() ===
        serviceProviderEngineer?._id?.toString()
    ) {
      return null; // or, 'you have already started inspecting, just keep going';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateObject: any = {
      inspection: {
        serviceProviderEngineer: serviceProviderEngineer?._id,
        isInspecting: true,
      },
    };

    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
        taskStatus: 'ongoing',
      },
      updateObject,
    );

    if (!updatedInvoice) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    return null; // or, 'you have successfully started inspecting';

    // const updatedReservationRequest =
    //   await ReservationRequest.findByIdAndUpdate(reservationRequest, {
    //     reasonOfReSchedule: rescheduleData?.reasonOfReSchedule,
    //     $push: { 'schedule.schedules': new Date(rescheduleData.schedule) },
    //   });
    // return updatedReservationRequest;
  } else {
    // return error
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not in the team that has assigned in this reservation',
    );
  }
};

const inspectionReport = async ({
  user,
  reservationRequest,
  issues,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequest: string;
  issues: string;
}) => {
  const engineerExistsInThisTeam =
    await isEngineerBelongsToThisTeamByReservation({
      reservationRequest,
      user: user,
    });

  if (engineerExistsInThisTeam) {
    const serviceProviderEngineer = await ServiceProviderEngineer.findOne({
      user,
    });
    if (!serviceProviderEngineer?._id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const invoiceData = await Invoice.findOne({
      reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
    });

    if (invoiceData?.taskStatus !== 'ongoing') {
      throw new AppError(httpStatus.BAD_REQUEST, 'reservation is not ongoing');
    } else if (invoiceData?.inspection?.isInspecting !== true) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'first start inspection before adding issues',
      );
    } else if (
      invoiceData?.inspection?.isInspecting === true &&
      invoiceData?.inspection?.serviceProviderEngineer?.toString() !==
        serviceProviderEngineer?._id?.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this reservation has already been inspected by other engineer in your team',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateObject: any = {
      'inspection.issues': issues,
    };

    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
        taskStatus: 'ongoing',
      },
      updateObject,
    );

    if (!updatedInvoice) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    } else {
      return null;
    }
    // const updatedReservationRequest =
    //   await ReservationRequest.findByIdAndUpdate(reservationRequest, {
    //     reasonOfReSchedule: rescheduleData?.reasonOfReSchedule,
    //     $push: { 'schedule.schedules': new Date(rescheduleData.schedule) },
    //   });
    // return updatedReservationRequest;
  } else {
    // return error
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not in the team that has assigned in this reservation',
    );
  }
};
const changeStatusToCompleted = async ({
  user,
  reservationRequest_id,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequest_id: string;
}) => {
  const existingInvoice = await Invoice.findOne({
    reservationRequest: new mongoose.Types.ObjectId(reservationRequest_id),
  }).populate({
    path: 'invoiceGroup',
    options: { strictPopulate: false },
  });
  if (!existingInvoice) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no invoice found for this reservation',
    );
  }

  //   const isUserBelongsToThisTeam =
  const { isUserBelongsToThisTeam, serviceProviderEngineer } =
    await isEngineerBelongsToThisTeamByInvoiceGroup(
      existingInvoice?.invoiceGroup,
      user,
    );
  if (!isUserBelongsToThisTeam || !serviceProviderEngineer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not the engineer for this reservation or something went wrong',
    );
  }

  // first check all reservations of reservation group's task status has been completed or not; if completed then also change the status of invoiceGroup.taskAssignee.taskStatus to completed

  const allInvoices: mongoose.Types.ObjectId[] =
    getAllInvoicesOfReservationGroup(existingInvoice);
  const restOfTheInvoices: mongoose.Types.ObjectId[] = allInvoices.filter(
    (invoice) => invoice.toString() !== existingInvoice?._id?.toString(),
  );
  // console.log({ allInvoices });
  // console.log({ restOfTheInvoices });

  const incompleteInvoices = await Invoice.find({
    taskStatus: { $ne: 'completed' },
    _id: { $in: restOfTheInvoices },
  });
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (incompleteInvoices?.length === 0) {
      // that means all of the rest of the invoices have been completed

      const updatedInvoiceGroup = await InvoiceGroup.findByIdAndUpdate(
        existingInvoice.invoiceGroup,
        {
          'taskAssignee.taskStatus': 'completed',
        },
        { session: session, new: true },
      );
      if (!updatedInvoiceGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      const updatedResGroup = await ReservationRequestGroup.findOneAndUpdate(
        { 'postBiddingProcess.invoiceGroup': existingInvoice.invoiceGroup },
        {
          taskStatus: 'completed',
        },
        { session: session, new: true },
      );

      if (!updatedResGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      existingInvoice.taskStatus = 'completed';
      const updatedExistingInvoice = await existingInvoice.save({
        session: session,
      });
      if (!updatedExistingInvoice) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      const updatedReservationRequest =
        await ReservationRequest.findByIdAndUpdate(
          existingInvoice?.reservationRequest?.toString(),
          {
            status: 'completed',
          },
          {
            session,
          },
        );
      if (!updatedReservationRequest) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      await session.commitTransaction();
      await session.endSession();
      const result = await Invoice.findOne({
        reservationRequest: new mongoose.Types.ObjectId(reservationRequest_id),
      }).populate({
        path: 'invoiceGroup',
        options: { strictPopulate: false },
      });
      return result;
    } else {
      existingInvoice.taskStatus = 'completed';
      const updatedInvoice = await existingInvoice.save({ session });
      if (!updatedInvoice) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }
      const updatedReservationRequest =
        await ReservationRequest.findByIdAndUpdate(
          existingInvoice?.reservationRequest?.toString(),
          {
            status: 'completed',
          },
          {
            session,
          },
        );
      if (!updatedReservationRequest) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }
      await session.commitTransaction();
      await session.endSession();
      return updatedInvoice;
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getAllInvoices = async () => {
  const invoices = await Invoice.find({}).populate([
    {
      path: 'reservationRequest',
      options: { strictPopulate: false },
    },
    {
      path: 'user',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    },
  ]);

  return invoices;
};
const getAllInvoicesByUser = async (user: string) => {
  const invoices = await Invoice.find({
    user: new mongoose.Types.ObjectId(user),
  }).populate({
    path: 'reservationRequest',
    options: { strictPopulate: false },
  });

  return invoices;
};

const getAllAssignedTasksByEngineer = async ({
  status,
  user,
}: {
  status: TAssignedTaskType;
  user: mongoose.Types.ObjectId;
}) => {
  const userData = await User.findOne({ _id: user }).select(
    'serviceProviderEngineer',
  );

  const teamOfEngineers = await TeamOfEngineers.find({
    'members.member': userData?.serviceProviderEngineer,
  });
  const teamOfEngineersList = teamOfEngineers?.map((each) => each?._id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allTask: any[];
  if (status === 'all') {
    // do nothing
    allTask = await InvoiceGroup.aggregate([
      {
        $match: {
          'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
        },
      },

      {
        $lookup: {
          from: 'invoices',
          localField: 'invoices',
          foreignField: '_id',
          as: 'invoices',
        },
      },

      {
        $unwind: '$invoices',
      },

      {
        $replaceRoot: {
          newRoot: '$invoices',
        },
      },

      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },
      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },
    ]);
  } else if (status === 'completed') {
    allTask = await InvoiceGroup.aggregate([
      {
        $match: {
          'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
        },
      },

      {
        $lookup: {
          from: 'invoices',
          localField: 'invoices',
          foreignField: '_id',
          as: 'invoices',
        },
      },

      {
        $unwind: '$invoices',
      },

      {
        $replaceRoot: {
          newRoot: '$invoices',
        },
      },

      {
        $match: {
          taskStatus: 'completed',
        },
      },

      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },
      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },
    ]);
  } else if (status === 'inspection') {
    allTask = await InvoiceGroup.aggregate([
      {
        $match: {
          'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
        },
      },

      {
        $lookup: {
          from: 'invoices',
          localField: 'invoices',
          foreignField: '_id',
          as: 'invoices',
        },
      },

      {
        $unwind: '$invoices',
      },

      {
        $replaceRoot: {
          newRoot: '$invoices',
        },
      },

      {
        $match: {
          'inspection.isInspecting': true,
        },
      },

      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },
      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },
    ]);
  } else if (status === 'pending') {
    // In Figma, Its pending, But actually Its a ongoing
    allTask = await InvoiceGroup.aggregate([
      {
        $match: {
          'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
        },
      },

      {
        $lookup: {
          from: 'invoices',
          localField: 'invoices',
          foreignField: '_id',
          as: 'invoices',
        },
      },

      {
        $unwind: '$invoices',
      },

      {
        $replaceRoot: {
          newRoot: '$invoices',
        },
      },

      {
        $match: {
          taskStatus: 'ongoing',
        },
      },

      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },
      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },
    ]);
  } else if (status === 'schedule') {
    // filterQuery.$match['taskStatus'] = 'ongoing';

    allTask = await InvoiceGroup.aggregate([
      {
        $match: {
          'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
        },
      },

      {
        $lookup: {
          from: 'invoices',
          localField: 'invoices',
          foreignField: '_id',
          as: 'invoices',
        },
      },

      {
        $unwind: '$invoices',
      },

      {
        $replaceRoot: {
          newRoot: '$invoices',
        },
      },

      // {
      //   $match: {
      //     taskStatus: 'ongoing',
      //   },
      // },

      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },

      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },

      {
        $addFields: {
          schedulesCount: { $size: '$schedule.schedules' },
        },
      },
      {
        $match: {
          schedulesCount: { $eq: 1 },
        },
      },
    ]);
  }

  // console.log(teamOfEngineers);

  return allTask;
};

const getTodayTasksSummary = async (user: mongoose.Types.ObjectId) => {
  const userData = await User.findOne({ _id: user }).select(
    'serviceProviderEngineer',
  );

  const teamOfEngineers = await TeamOfEngineers.find({
    'members.member': userData?.serviceProviderEngineer,
  });

  const teamOfEngineersList = teamOfEngineers?.map((team) => team?._id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  console.log("Today's Date (Local):", today.toString());
  console.log(endOfToday.toString());

  const todayTasksSummary = await InvoiceGroup.aggregate([
    {
      $match: {
        'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
        createdAt: { $gte: today, $lte: endOfToday },
      },
    },
    {
      $lookup: {
        from: 'invoices',
        localField: 'invoices',
        foreignField: '_id',
        as: 'invoices',
      },
    },
    {
      $unwind: '$invoices',
    },
    {
      $replaceRoot: {
        newRoot: '$invoices',
      },
    },

    {
      $facet: {
        totalTasks: [{ $match: {} }, { $count: 'count' }],

        totalInspectionTasks: [
          { $match: { 'inspection.isInspecting': true } },
          { $count: 'count' },
        ],

        totalCompletedTasks: [
          { $match: { taskStatus: 'completed' } },
          { $count: 'count' },
        ],
        // In Figma, Its pending, But actually Its a ongoing

        totalPendingTasks: [
          { $match: { taskStatus: 'ongoing' } },
          { $count: 'count' },
        ],
      },
    },

    {
      $project: {
        totalTasks: { $arrayElemAt: ['$totalTasks.count', 0] },
        totalInspectionTasks: {
          $arrayElemAt: ['$totalInspectionTasks.count', 0],
        },
        totalCompletedTasks: {
          $arrayElemAt: ['$totalCompletedTasks.count', 0],
        },
        totalPendingTasks: { $arrayElemAt: ['$totalPendingTasks.count', 0] },
      },
    },
  ]);

  return {
    totalTasks: todayTasksSummary[0]?.totalTasks || 0,
    totalInspectionTasks: todayTasksSummary[0]?.totalInspectionTasks || 0,
    totalCompletedTasks: todayTasksSummary[0]?.totalCompletedTasks || 0,
    totalPendingTasks: todayTasksSummary[0]?.totalPendingTasks || 0,
  };
};

export const invoiceServices = {
  addAdditionalProduct,
  inspection,
  startInspection,
  inspectionReport,
  changeStatusToCompleted,
  getAllInvoices,
  getAllInvoicesByUser,
  getAllAssignedTasksByEngineer,
  getTodayTasksSummary,
};
