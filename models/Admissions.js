import mongoose from "mongoose";

const admissionsSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["open", "closed"], default: "open" },
    intakeYear: { type: String, default: "" },
    applicationOpens: { type: Date, default: null },
    applicationCloses: { type: Date, default: null },
    interviewDates: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Admissions", admissionsSchema);