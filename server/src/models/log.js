import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    }, 
    totalFetched:{
        type:Number,
        required:true,
        default:0,
    },
  newJobs:{
    type:Number,
    required:true,
    default:0,
  },
  updatedJobs:{
    type:Number,
    required:true,
    default:0,
  },
  failedJobs:[
    {
        externalId:String,
        error:String,
        jobData:mongoose.Schema.Types.Mixed,
    }
  ],
}, {
    timestamps: true,
});

const Log = mongoose.model('Log', logSchema);

export default Log;

