const cloudinary = require("../utils/cloudinary");
const Post = require("../models/postModel");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../server");
const User = require("../models/userModel");

//CREATE POST
exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;

  try {
    //UPLOAD IMAGE IN CLOUDINARY
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "posts",
      width: 1200,
      crop: "scale",
    });

    const user = await User.findById(req.user._id);

    const post = await Post.create({
      title,
      content,
      postedBy: req.user._id,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    res.status(201).json({
      _id: post._id,
      title: post.title,
      content: post.content,
      postedBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        image: user.image,
        address: user.address,
        phone: user.phone,
        role: user.role,
        bookmarks: user.bookmarks,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        __v: user.__v,
        vouchers: user.vouchers,
      },
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      likes: post.likes,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      countComment: post.comments.length,
      countLike: post.likes.length,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//SHOW POSTS
exports.showPost = async (req, res, next) => {
  try {
    const posts = await Post.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedByArray",
        },
      },
      {
        $addFields: {
          postedBy: { $arrayElemAt: ["$postedByArray", 0] },
          countComment: { $size: "$comments" },
          countLike: { $size: "$likes" },
        },
      },
      {
        $project: {
          image: 1,
          title: 1,
          content: 1,
          likes: 1,
          postedBy: 1,
          countComment: 1,
          countLike: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

exports.showMyPost = async (req, res, next) => {
  try {
    const posts = await Post.find({ postedBy: req.user._id })
      .populate(
        "postedBy",
        "_id name email password image address phone role bookmarks verified createdAt updatedAt __v vouchers"
      )
      .select("_id title content image likes createdAt updatedAt comments");

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

//SHOW SINGLE POST
exports.showSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: "comments.postedBy",
      select: "name image",
    });
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE POST
exports.deletePost = async (req, res, next) => {
  try {
    const currentPost = await Post.findById(req.params.id);

    //DELETE POST IMAGE IN CLOUDINARY
    const ImgId = currentPost.image.public_id;
    if (ImgId) {
      await cloudinary.uploader.destroy(ImgId);
    }

    await currentPost.deleteOne();

    res.status(200).json({
      success: true,
      message: "post deleted",
    });
  } catch (error) {
    next(error);
  }
};

//UPDATE POST
exports.updatePost = async (req, res, next) => {
  try {
    const { title, content, image } = req.body;
    let updatedImage;

    //MODIFY POST IMAGE CONDITIONALLY
    if (image !== "") {
      const newImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
        width: 1200,
        crop: "scale",
      });

      updatedImage = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    const postUpdate = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        image: updatedImage,
      },
      { new: true, omitUndefined: true }
    );

    const user = await User.findById(postUpdate.postedBy).select("-password");

    res.status(200).json({
      ...postUpdate._doc,
      postedBy: user,
      image: updatedImage,
      countComment: postUpdate.comments.length,
      countLike: postUpdate.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

//ADD COMMENT
exports.addComment = async (req, res, next) => {
  const { comment } = req.body;
  try {
    let image = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "comments",
        width: 400,
        crop: "scale",
      });

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const postComment = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: { text: comment, image: image, postedBy: req.user._id },
        },
      },
      { new: true }
    );
    const post = await Post.findById(postComment._id).populate(
      "comments.postedBy",
      "name image email"
    );
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

//ADD LIKE
exports.toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId).populate("postedBy");
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    const likeIndex = post.likes.findIndex(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
      post.liked = true;
    } else {
      post.likes.splice(likeIndex, 1);
      post.liked = false;
    }

    await post.save();

    res.status(200).json({ success: true, check: post.liked });
  } catch (error) {
    next(error);
  }
};

//REMOVE LIKE
exports.removeLike = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("remove-like", posts);

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};
