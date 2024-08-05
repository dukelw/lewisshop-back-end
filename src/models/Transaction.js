const { Schema, model } = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const DOCUMENT_NAME = "Transaction";
const COLLECTION_NAME = "Transactions";

var transactionSchema = new Schema(
  {
    gateway: {
      type: String,
      required: true,
    },
    transaction_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    account_number: {
      type: String,
      default: null,
    },
    sub_account: {
      type: String,
      default: null,
    },
    amount_in: {
      type: Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    amount_out: {
      type: Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    accumulated: {
      type: Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    code: {
      type: String,
      default: null,
    },
    transaction_content: {
      type: String,
      default: null,
    },
    reference_number: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: COLLECTION_NAME,
  }
);

transactionSchema.plugin(mongoose_delete, {
  overrideMethods: true,
  deletedAt: true,
});

module.exports = {
  TransactionModel: model(DOCUMENT_NAME, transactionSchema),
};
