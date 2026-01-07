const SuperAdminModel = require('../models/superadminModel');
exports.getAllSuperAdmins = async (req, res) => {
  try {
    const superadmins = await SuperAdminModel.find();
    res.status(200).json(superadmins);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching superadmins', error: err });
  }
};
exports.createSuperAdmin = async (req, res) => {
  const { name, officeEmail, password, adminType } = req.body;
  if (!name || !officeEmail || !password || !adminType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newSuperAdmin = new SuperAdminModel({
      name,
      officeEmail,
      password,
      adminType,
    });
    await newSuperAdmin.save();
    res.status(201).json({ message: 'Superadmin created successfully', superadmin: newSuperAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Error creating superadmin', error: err });
  }
};
exports.updateSuperAdmin = async (req, res) => {
  const { id } = req.params; 
  const { name, officeEmail, password, adminType } = req.body;
  if (!name && !officeEmail && !password && !adminType) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const updatedSuperAdmin = await SuperAdminModel.findByIdAndUpdate(
      id,
      { name, officeEmail, password, adminType },
      { new: true }
    );

    if (!updatedSuperAdmin) {
      return res.status(404).json({ message: 'Superadmin not found' });
    }

    res.status(200).json({
      message: 'Superadmin updated successfully',
      superadmin: updatedSuperAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating superadmin', error: err });
  }
};
