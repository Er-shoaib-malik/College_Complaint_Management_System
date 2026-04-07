import dbConnect from "@/lib/dbConnect";
import Complaint from "@/models/Complaint";
import Category from "@/models/Category";

export async function GET() {
  await dbConnect();

  try {
    // STATUS
    const statusStats = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // PRIORITY
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // CATEGORY
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          name: "$category.name",
          count: 1,
        },
      },
    ]);

    // MONTHLY TREND
    const monthlyStats = await Complaint.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $arrayElemAt: [
              ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              { $subtract: ["$_id", 1] }
            ],
          },
          count: 1,
        },
      },
    ]);

    return Response.json({
      statusStats,
      priorityStats,
      categoryStats,
      monthlyStats,
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}