import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, default: "" },
    summary: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);