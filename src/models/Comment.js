const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";

var commentSchema = new Schema(
  {
    comment_product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    comment_user_id: {
      type: String,
      default: "",
    },
    comment_user_name: {
      type: String,
      default: "",
    },
    comment_content: {
      type: String,
      default: "text",
    },
    comment_left: {
      type: Number,
      default: 0,
    },
    comment_right: {
      type: Number,
      default: 0,
    },
    comment_parent_id: {
      type: Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = {
  CommentModel: model(DOCUMENT_NAME, commentSchema),
};
