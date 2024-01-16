const { NotFoundError } = require("../core/error-response");
const { CommentModel } = require("../models/Comment");
const { convertToObjectIDMongo } = require("../utils/index");
const { findProduct } = require("../models/function/Product");

class CommentService {
  async createComment({
    product_id,
    user_id,
    content,
    parent_comment_id = null,
  }) {
    const comment = new CommentModel({
      comment_product_id: product_id,
      comment_user_id: user_id,
      comment_content: content,
      comment_parent_id: parent_comment_id,
    });

    let rightValue;
    if (parent_comment_id) {
      // Reply comment
      const parentComment = await CommentModel.findById(parent_comment_id);
      if (!parentComment)
        throw new NotFoundError("Can not find parent comment");

      rightValue = parentComment.comment_right;

      // Update many comments
      await CommentModel.updateMany(
        {
          comment_product_id: convertToObjectIDMongo(product_id),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: {
            comment_right: 2,
          },
        }
      );

      await CommentModel.updateMany(
        {
          comment_product_id: convertToObjectIDMongo(product_id),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRightValue = await CommentModel.findOne(
        {
          comment_product_id: convertToObjectIDMongo(product_id),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    // Insert to comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;
    return await comment.save();
  }

  async getCommentByParentID({
    product_id,
    parent_comment_id,
    limit = 50,
    offset = 0,
  }) {
    if (parent_comment_id) {
      const parentComment = await CommentModel.findById(parent_comment_id);
      if (!parentComment)
        throw new NotFoundError("Can not find parent comment");

      const comment = await CommentModel.find({
        comment_product_id: convertToObjectIDMongo(product_id),
        comment_left: { $gt: parentComment.comment_left },
        comment_right: { $lte: parentComment.comment_right },
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parent_id: 1,
        })
        .sort({ comment_left: 1 });
      return comment;
    }
    const comments = await CommentModel.find({
      comment_product_id: convertToObjectIDMongo(product_id),
      comment_parent_id: parent_comment_id, // null
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parent_id: 1,
      })
      .sort({
        comment_left: 1,
      });
    return comments;
  }

  async deleteComment({ comment_id, product_id }) {
    // Check product's existence in database
    const foundProduct = await findProduct({ product_id });
    if (!foundProduct) throw new NotFoundError("Product not found");

    // 1. Get left value and right value of comment
    const comment = await CommentModel.findById(comment_id);
    if (!comment) throw new NotFoundError("Comment not found");

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;

    // 2. Calculate width
    const width = rightValue - leftValue + 1;

    // 3. Delete all comment which is child of the deleted comment
    await CommentModel.deleteMany({
      comment_product_id: convertToObjectIDMongo(product_id),
      comment_left: { $gte: leftValue, $lte: rightValue },
    });

    // 4. Update left and right of the rest comments
    await CommentModel.updateMany(
      {
        comment_product_id: convertToObjectIDMongo(product_id),
        comment_right: { $gt: rightValue },
      },
      {
        $inc: { comment_right: -width },
      }
    );

    await CommentModel.updateMany(
      {
        comment_product_id: convertToObjectIDMongo(product_id),
        comment_left: { $gt: rightValue },
      },
      {
        $inc: { comment_left: -width },
      }
    );
    return true;
  }
}

module.exports = new CommentService();
