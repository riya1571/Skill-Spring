import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tasks: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "accepted", "submitted", "paid", "rejected"],
      default: "applied",
    },
    submission: {
      liveLink: { type: String, default: "" },
      clientRepo: { type: String, default: "" },
      serverRepo: { type: String, default: "" },
      submittedAt: { type: Date },
    },
    adminFeedback: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "none"],
      default: "none",
    },
    stripePaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

// Model register korar somoy check kora hocche jeno duplicate na hoy
const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;