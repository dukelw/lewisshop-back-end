const { Schema, model } = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const DOCUMENT_NAME = "Variant";
const COLLECTION_NAME = "Variants";

var variantSchema = new Schema(
  {
    variant_product_id: {
      type: String,
      required: true,
    },
    variant_size: {
      type: String,
      default: null,
    },
    variant_color: {
      type: String,
      default: null,
    },
    variant_image: {
      type: String,
      default: null,
    },
    variant_remain_quantity: {
      type: Number,
      default: 0,
    },
    variant_sold_quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: COLLECTION_NAME,
  }
);

variantSchema.plugin(mongoose_delete, {
  overrideMethods: true,
  deletedAt: true,
});

module.exports = {
  VariantModel: model(DOCUMENT_NAME, variantSchema),
};
