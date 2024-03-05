const ShopModel = require("../../models/Shop");

const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 1,
    name: 1,
    status: 1,
    roles: 1,
    thumb: 1,
    description: 1,
  },
}) => {
  return await ShopModel.findOne({ email }).select(select).lean();
};

module.exports = {
  findByEmail,
};
