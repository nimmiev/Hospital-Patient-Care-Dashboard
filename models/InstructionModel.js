import mongoose from 'mongoose';

const instructionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String }
  },
  {
    timestamps: true
  });  

const Instruction = mongoose.model("Instruction", instructionSchema);
export default Instruction;