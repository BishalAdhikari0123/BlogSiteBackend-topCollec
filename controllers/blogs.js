import catchAsync from "../helper/catchAsync.js";
import Blog from "../models/blog.js";
import User from "../models/users.js";

// Create a new blog
const createBlog = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { title, content, coverImage, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Title and content are required.",
    });
  }

  const user = await User.findById(userId);
  if (!user || !user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized or email not verified.",
    });
  }

  const blog = await Blog.create({
    title,
    content,
    coverImage,
    tags,
    author: userId,
  });

  return res.status(201).json({
    success: true,
    message: "Blog created successfully.",
    blog,
  });
});