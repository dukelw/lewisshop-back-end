const { Types } = require("mongoose");
const { ProductModel } = require("../Product");
const { getSelectData, unGetSelectData } = require("../../utils/index");
const { NotFoundError } = require("../../core/error-response");
const { convertToObjectIDMongo } = require("../../utils/index");

const publishProductByShopId = async ({ product_shop, product_id }) => {
  const foundProduct = await ProductModel.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundProduct) throw new NotFoundError("Shop does not exist");
  foundProduct.isDraft = false;
  foundProduct.isPublished = true;
  const { modifiedCount } = await foundProduct.updateOne(foundProduct);
  return modifiedCount;
};

const unpublishProductByShopId = async ({ product_shop, product_id }) => {
  const foundProduct = await ProductModel.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundProduct) return null;
  foundProduct.isDraft = true;
  foundProduct.isPublished = false;
  const { modifiedCount } = await foundProduct.updateOne(foundProduct);
  return modifiedCount;
};

const findAllDraftProductOfShop = async ({ query, limit, skip }) => {
  const products = await queryProduct({ query, limit, skip });
  console.log(`products: ${products}`);
  return products;
};

const findAllPublishProductOfShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await ProductModel.find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const result = await ProductModel.find(
    {
      isPublished: true,
      $text: { $search: regexSearch },
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return result;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await ProductModel.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findProduct = async ({ product_id, unSelect }) => {
  return await ProductModel.findById(product_id).select(
    unGetSelectData(unSelect)
  );
};

const updateProductByID = async ({
  product_id,
  bodyUpdate,
  Model,
  isNew = true,
}) => {
  return await Model.findByIdAndUpdate(product_id, bodyUpdate, {
    new: isNew,
  });
};

const getProductByID = async (product_id) => {
  return await ProductModel.findOne({
    _id: convertToObjectIDMongo(product_id),
  }).lean();
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductByID(product.product_id);
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          product_id: product.product_id,
        };
      }
    })
  );
};

module.exports = {
  publishProductByShopId,
  unpublishProductByShopId,
  findAllDraftProductOfShop,
  findAllPublishProductOfShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductByID,
  getProductByID,
  checkProductByServer,
};
