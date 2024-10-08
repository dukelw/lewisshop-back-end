const UserModel = require("../../models/User");

const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 1,
    name: 1,
    thumb: 1,
    gender: 1,
    address: 1,
    phone_number: 1,
    bank_account_number: 1,
    status: 1,
    roles: 1,
    birthday: 1,
    all_addresses: 1,
  },
}) => {
  return await UserModel.findOne({ email }).select(select).lean();
};

module.exports = {
  findByEmail,
};
