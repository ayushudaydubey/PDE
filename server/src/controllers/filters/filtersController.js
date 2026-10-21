const Company = require("../../models/company.model");
const Tag = require("../../models/tag.model");
const companyService = require("../../services/companyService");

const resolveTagId = async (tagName) => {
  if (!tagName) return null;
  const tagDoc = await Tag.findOne({ name: tagName });
  return tagDoc ? tagDoc._id : "000000000000000000000000";
};

const getCountries = async (req, res, next) => {
  try {
    const { industry, city, tag } = req.query;
    const filter = {};
    if (industry) filter.industry = industry;
    if (city) filter.city = city;
    if (tag) {
      const tagId = await resolveTagId(tag);
      if (tagId) filter.tags = tagId;
    }
    companyService.addStatusFilter(filter, req.query.leadStatus || req.query.status);

    const countries = await Company.distinct("country", filter);
    res.json({ data: countries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getCities = async (req, res, next) => {
  try {
    const { country, industry, tag } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (industry) filter.industry = industry;
    if (tag) {
      const tagId = await resolveTagId(tag);
      if (tagId) filter.tags = tagId;
    }
    companyService.addStatusFilter(filter, req.query.leadStatus || req.query.status);
    
    const cities = await Company.distinct("city", filter);
    res.json({ data: cities.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getIndustries = async (req, res, next) => {
  try {
    const { country, city, tag } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;
    if (tag) {
      const tagId = await resolveTagId(tag);
      if (tagId) filter.tags = tagId;
    }
    companyService.addStatusFilter(filter, req.query.leadStatus || req.query.status);

    const industries = await Company.distinct("industry", filter);
    res.json({ data: industries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getTags = async (req, res, next) => {
  try {
    const { country, city, industry } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;
    if (industry) filter.industry = industry;
    companyService.addStatusFilter(filter, req.query.leadStatus || req.query.status);

    const tagIds = await Company.distinct("tags", filter);
    const tags = await Tag.find({ _id: { $in: tagIds } });
    res.json({ data: tags.map(t => ({ _id: t._id, name: t.name })).sort((a, b) => a.name.localeCompare(b.name)) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCountries,
  getCities,
  getIndustries,
  getTags,
};

