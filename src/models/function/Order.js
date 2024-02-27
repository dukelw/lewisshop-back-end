const { NotFoundError } = require("../../core/error-response");
const { OrderModel } = require("../Order");

const updateStatusOfOrder = async ({ order_id, action }) => {
  const foundOrder = await OrderModel.findById(order_id);
  if (!foundOrder) throw new NotFoundError("Can not find order");

  let newStatus;
  switch (action) {
    case "confirm":
      newStatus = "confirming";
      break;
    case "ship":
      newStatus = "shipped";
      break;
    case "cancel":
      newStatus = "canceled";
      break;
    case "deliver":
      newStatus = "delivering";
      break;
    default:
      throw new BadRequestError("Invalid action");
  }

  foundOrder.order_status = newStatus;
  await foundOrder.save();
  return foundOrder;
};

module.exports = {
  updateStatusOfOrder,
};
