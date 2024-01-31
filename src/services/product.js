const { BadRequestError } = require("../core/error-response");
const {
  ProductModel,
  ClothesModel,
  ElectronicModel,
  FurnitureModel,
} = require("../models/Product");
const {
  publishProductByShopId,
  unpublishProductByShopId,
  findAllDraftProductOfShop,
  findAllPublishProductOfShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductByID,
} = require("../models/function/Product");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/function/Inventory");
const { pushNotificationToSystem } = require("../services/notification");

// Factory and Trategy pattern
// Defined factory class to create Product
class ProductFactory {
  static productRegistry = {};

  static registryProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError("Invalid Product type: ", type);

    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, product_id, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError("Invalid Product type: ", type);

    return new productClass(payload).updateProduct(product_id);
  }

  // PUT
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShopId({ product_shop, product_id });
  }

  static async unpublishProductByShop({ product_shop, product_id }) {
    return await unpublishProductByShopId({ product_shop, product_id });
  }

  // Query
  static async findAllDraftProductOfShop({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    const query = { product_shop, isDraft: true };
    const products = await findAllDraftProductOfShop({ query, limit, skip });
    console.log(`Product in service ${products}`)
    return products
  }

  static async findAllPublishProductOfShop({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishProductOfShop({ query, limit, skip });
  }

  // Search
  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }

  static async findProduct({ product_id }) {
    return await findProduct({
      product_id,
      unSelect: ["--v"],
    });
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    (this.product_name = product_name),
      (this.product_thumb = product_thumb),
      (this.product_description = product_description),
      (this.product_price = product_price),
      (this.product_quantity = product_quantity),
      (this.product_type = product_type),
      (this.product_shop = product_shop),
      (this.product_attributes = product_attributes);
  }

  // Create new product
  async createProduct(product_id) {
    const newProduct = ProductModel.create({ ...this, _id: product_id });
    if (newProduct) {
      // Add stock to Inventory Collection
      await insertInventory({
        product_id: newProduct._id,
        shop_id: this.product_shop,
        stock: this.product_quantity,
      });

      // Push notification to Notification Collection
      pushNotificationToSystem({
        type: "SHOP-001",
        receiver_id: 1,
        sender_id: this.product_shop,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop,
        },
      })
        .then((rs) => console.log(rs))
        .catch(console.error);
    }
    return newProduct;
  }

  // Update product
  async updateProduct(product_id, bodyUpdate) {
    return await updateProductByID({
      product_id,
      bodyUpdate,
      Model: ProductModel,
    });
  }
}

// Create sub-class for different product types Clothes
class Clothes extends Product {
  async createProduct() {
    const isProductExisted = await ProductModel.findOne({
      product_name: this.product_name,
    });
    if (isProductExisted)
      throw new BadRequestError(`Product has already existed`);

    const newClothes = await ClothesModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothes) throw new BadRequestError("Create new clothes error");

    const newProduct = await super.createProduct(newClothes._id);
    if (!newProduct) throw new BadRequestError("Create new product error");

    return newProduct;
  }

  async updateProduct(product_id) {
    // 1. Remove attributes null, undefined
    const standardAtributes = removeUndefinedObject(this);
    // 2. Chcek where will be updated
    if (standardAtributes.product_attributes) {
      // Update child
      await updateProductByID({
        product_id,
        bodyUpdate: updateNestedObjectParser(
          standardAtributes.product_attributes
        ),
        Model: ClothesModel,
      });
    }
    const updatedProduct = await super.updateProduct(
      product_id,
      updateNestedObjectParser(standardAtributes)
    );
    return updatedProduct;
  }
}

// Create sub-class for different product types
class Electronic extends Product {
  async createProduct() {
    const isProductExisted = await ProductModel.findOne({
      product_name: this.product_name,
    });
    if (isProductExisted)
      throw new BadRequestError(`Product has already existed`);

    const newElectronic = await ElectronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("Create new electronic failed");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new product failed");

    return newProduct;
  }

  async updateProduct(product_id) {
    // 1. Remove attributes null, undefined
    const standardAtributes = removeUndefinedObject(this);
    // 2. Chcek where will be updated
    if (standardAtributes.product_attributes) {
      // Update child
      await updateProductByID({
        product_id,
        bodyUpdate: updateNestedObjectParser(
          standardAtributes.product_attributes
        ),
        Model: ElectronicModel,
      });
    }
    const updatedProduct = await super.updateProduct(
      product_id,
      updateNestedObjectParser(standardAtributes)
    );
    return updatedProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const isProductExisted = await ProductModel.findOne({
      product_name: this.product_name,
    });
    if (isProductExisted)
      throw new BadRequestError(`Product has already existed`);

    const newFurniture = await FurnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError("Create new electronic error");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new product error");

    return newProduct;
  }

  async updateProduct(product_id) {
    // 1. Remove attributes null, undefined
    const standardAtributes = removeUndefinedObject(this);
    // 2. Chcek where will be updated
    if (standardAtributes.product_attributes) {
      // Update child
      await updateProductByID({
        product_id,
        bodyUpdate: updateNestedObjectParser(
          standardAtributes.product_attributes
        ),
        Model: FurnitureModel,
      });
    }
    const updatedProduct = await super.updateProduct(
      product_id,
      updateNestedObjectParser(standardAtributes)
    );
    return updatedProduct;
  }
}

// Registry product type
ProductFactory.registryProductType("Clothes", Clothes);
ProductFactory.registryProductType("Electronic", Electronic);
ProductFactory.registryProductType("Furniture", Furniture);

module.exports = ProductFactory;
