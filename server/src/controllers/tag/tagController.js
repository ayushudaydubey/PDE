const tagModel = require("../../models/tag.model");
const Tag = require("../../models/tag.model");

const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const trimmed = name.trim();
    const esc = trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    
    // Check if tag already exists (case-insensitive)
    const existingTag = await Tag.findOne({
      name: { $regex: new RegExp("^" + esc + "$", "i") },
    });

    if (existingTag) {
      return res.status(400).json({ message: "Tag with this name already exists" });
    }

    const tag = await Tag.create({ name: trimmed });
    res.json(tag);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find();

    res.json(tags);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const deleteTag = async (req, res) => {
  try {
    await tagModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createTag,
  getTags,
  deleteTag
};