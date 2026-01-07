  const Lead = require('../models/leadModel');
  exports. createLead = async (req, res) => {
    const { name, contact, email, requirements, company, location, links, comments, status } = req.body;

    try {
      const newLead = new Lead({
        name,
        contact,
        email,
        requirements,
        company,
        location,
        links,
        comments,
        status
      });
      await newLead.save();
      res.status(201).json({ message: 'Lead created successfully', lead: newLead });
    } catch (error) {
      res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
  };


    exports. getAllLeads = async (req, res) => {
      try {
        const leads = await Lead.find();
        res.json(leads);
      } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ message: 'Error fetching leads', error });
      }
    };
    
    
    exports.getLeadById = async (req, res) => {
      try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
          return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead fetched successfully', data: lead });
      } catch (error) {
        res.status(500).json({ message: 'Error fetching lead', error });
      }
    };
    
    exports.updateLeadById = async (req, res) => {
      try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lead) {
          return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead updated successfully', data: lead });
      } catch (error) {
        res.status(500).json({ message: 'Error updating lead', error });
      }
    };
    
    exports.deleteLeadById = async (req, res) => {
      try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
          return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting lead', error });
      }
    };
    
    exports.updateLeadStatus = async (req, res) => {
      try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!lead) {
          return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead status updated successfully', data: lead });
      } catch (error) {
        res.status(500).json({ message: 'Error updating lead status', error });
      }
    };
exports.getTotalLeads = async (req, res) => {
    try {
      const totalLeads = await Lead.countDocuments();
  
      console.log("Total leads count:", totalLeads);
      res.status(200).json({ TotalLeads: totalLeads });
    } catch (error) {
      console.error("Error fetching total leads:", error);
      res.status(500).json({ message: error.message });
    }
  };
