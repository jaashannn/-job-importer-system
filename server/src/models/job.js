import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
   externalId: {
    type: String,
    required: true,
    unique: true,
    index: true,
   },
   title: {
    type: String,
    required: true,
   },
   company: {
    type: String,
    required: true,
   },
   url: {
    type: String,
    required: true,
   },
   description: {
    type: String,
    required: true,
   },
   location: {
    type: String,
    required: false,
   },
}, {
    timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

export default Job;