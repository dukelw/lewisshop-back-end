const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

var shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone_number: {
      type: String,
      default: "",
    },
    birthday: {
      type: Date,
      default: new Date(),
    },
    password: {
      type: String,
      required: true,
    },
    thumb: {
      type: String,
      default:
        "https://img.lovepik.com/png/20231006/black-line-drawing-online-store-mobile-shopping-icon-drawing-icons_105485_wh860.png",
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, shopSchema);
