const addSensorModule: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const sensorModule: TSensorModule = req?.body;

  sensorModule.addedBy = auth._id;

  const result = await sensorModuleServices.addSensorModuleIntoDB(sensorModule);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensorModule has added successfully',
    data: result,
  });
});

export const sensorModuleAttachedControllers = {
  addSensorModule,
};
