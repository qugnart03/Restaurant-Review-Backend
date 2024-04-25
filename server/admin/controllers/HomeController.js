const User = require("../../models/userModel");

exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error while fetching user count:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
