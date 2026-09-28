import express from 'express';
import Enquiry from '../models/Enquiry.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/enquiries
// @desc    Public website submission of inquiry
router.post('/', async (req, res) => {
  try {
    const { name, phone, service, message } = req.body;

    if (!name || !phone || !service) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone and service' });
    }

    const newEnquiry = await Enquiry.create({
      name,
      phone,
      service,
      message: message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/enquiries
// @desc    Get all enquiries with search, filter and pagination for Admin Panel
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { search, status, service, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (service && service !== 'All') {
      query.service = service;
    }

    const total = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Summary stats for dashboard
    const totalAll = await Enquiry.countDocuments();
    const totalNew = await Enquiry.countDocuments({ status: 'New' });
    const totalContacted = await Enquiry.countDocuments({ status: 'Contacted' });
    const totalCompleted = await Enquiry.countDocuments({ status: 'Completed' });

    res.json({
      success: true,
      data: enquiries,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: totalAll,
        new: totalNew,
        contacted: totalContacted,
        completed: totalCompleted
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/enquiries/:id
// @desc    Update status or internal notes
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) enquiry.status = status;
    if (notes !== undefined) enquiry.notes = notes;

    const updated = await enquiry.save();
    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/enquiries/:id
// @desc    Delete enquiry
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
