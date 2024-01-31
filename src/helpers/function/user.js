const UserModel = require("../../models/User");

const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 1,
    name: 1,
    status: 1,
    roles: 1,
  },
}) => {
  console.log(`User model:::`, UserModel);
  return await UserModel.findOne({ email }).select(select).lean();
};

module.exports = {
  findByEmail,
};
