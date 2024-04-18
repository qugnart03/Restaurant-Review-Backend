const cloudinary = require("../utils/cloudinary");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../server");
const Restaurant = require("../models/restaurantModel");

//CREATE RESTAURANT
exports.createRestaurant = async (req, res, next) => {
  const {
    name,
    type,
    country,
    timeWork: { start, end },
    phone,
    distance,
    description,
    address,
    image,
  } = req.body;

  try {
    //UPLOAD IMAGE IN CLOUDINARY
    const result = await cloudinary.uploader.upload(image, {
      folder: "restaurants",
      width: 1200,
      crop: "scale",
    });
    const restaurant = await Restaurant.create({
      name,
      type,
      country,
      phone,
      distance,
      description,
      address,
      timeWork: {
        start: req.body.timeWork.start,
        end: req.body.timeWork.end,
      },
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      postedBy: req.user._id,
    });
    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//SHOW RESTAURANT
exports.showRestaurant = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(201).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

//SHOW SINGLE RESTAURANT
exports.showSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.postedBy",
      "name"
    );
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
  const currentPost = await Post.findById(req.params.id);

  //DELETE POST IMAGE IN CLOUDINARY
  const ImgId = currentPost.image.public_id;
  if (ImgId) {
    await cloudinary.uploader.destroy(ImgId);
  }

  try {
    const post = await Post.findByIdAndRemove(req.params.id);
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
    const currentPost = await Post.findById(req.params.id);

    //BUILD THE OBJECT DATA
    const data = {
      title: title || currentPost.title,
      content: content || currentPost.content,
      image: image || currentPost.image,
    };

    //MODIFY POST IMAGE CONDITIONALLY
    if (req.body.image !== "") {
      const ImgId = currentPost.image.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const newImage = await cloudinary.uploader.upload(req.body.image, {
        folder: "posts",
        width: 1200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    const postUpdate = await Post.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      postUpdate,
    });
  } catch (error) {
    next(error);
  }
};

//ADD COMMENT
exports.addComment = async (req, res, next) => {
  const { comment } = req.body;
  try {
    const postComment = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: { comments: { text: comment, postedBy: req.user._id } },
      },
      { new: true }
    );
    const post = await Post.findById(postComment._id).populate(
      "comments.postedBy",
      "name email"
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
exports.addLike = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likes: req.user._id },
      },
      { new: true }
    );
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("add-like", posts);

    res.status(200).json({
      success: true,
      post,
      posts,
    });
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
