const mongoose = require('mongoose');

// Define the RefreshToken schema
const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId, // Assuming userId is a string, adjust data type as needed
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  
},{timestamps:true});

// Create and export the RefreshToken model
const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshToken;
