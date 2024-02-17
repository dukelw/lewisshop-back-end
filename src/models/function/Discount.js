const { DiscountModel } = require("../Discount");
const {
  getSelectData,
  unGetSelectData,
  convertToObjectIDMongo,
} = require("../../utils/index");

const updateDiscountByCode = async ({
  discount_shop_id,
  discount_code,
  bodyUpdate,
  isNew = true,
}) => {
  const filter = {
    discount_shop_id,
    discount_code,
  };

  return await DiscountModel.findOneAndUpdate(filter, bodyUpdate, {
    new: isNew,
  });
};

const updateDiscountByID = async ({
  discount_shop_id,
  discount_id,
  bodyUpdate,
  isNew = true,
}) => {
  const filter = {
    discount_shop_id,
    _id: convertToObjectIDMongo(discount_id),
  };

  return await DiscountModel.findOneAndUpdate(filter, bodyUpdate, {
    new: isNew,
  });
};

const findAllDiscountCodesUnselect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  unSelect,
  Model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await Model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();
  return discounts;
};

const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  select,
  Model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await Model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return discounts;
};

const checkDiscountExistence = async ({ Model, filter }) => {
  return await Model.findOne(filter).lean();
};

const restoreDiscount = async (order_discounts) => {
  for (const discount of order_discounts) {
    const { shop, code, user } = discount;
    
    const bodyUpdate = {
      $inc: {
        discount_uses_count: -1,
        discount_max_uses: 1,
      },
      $pull: {
        discount_users_used: user.toString(),
      },
    };

    updateDiscountByCode({
      discount_shop_id: shop,
      discount_code: code,
      bodyUpdate,
    });
  }
};

module.exports = {
  updateDiscountByCode,
  updateDiscountByID,
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
  checkDiscountExistence,
  restoreDiscount,
};
