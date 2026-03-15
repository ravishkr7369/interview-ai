import mongoose, { model } from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
    },
  },
  { timestamps: true },
);


const Blacklist=mongoose.model("Blacklist",blacklistSchema)

export default Blacklist;
