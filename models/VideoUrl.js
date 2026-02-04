const mongoose = require('mongoose');

const VideoUrlSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "DSA"
    category: { type: String, required: true }, // e.g., "Computer Science"
    lectures: [
        {
            lectureNumber: { type: Number },
            title: { type: String }, // e.g., "Array Basics"
            videoUrl: { type: String }
        }
    ],
    description: { type: String }, // Optional
    thumbnail: { type: String }, // Optional
}, { timestamps: true });

module.exports = mongoose.model('VideoUrl', VideoUrlSchema, 'video-url');
