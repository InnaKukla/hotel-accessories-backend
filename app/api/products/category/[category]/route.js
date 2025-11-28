import connectDB from "@/app/lib/mongodb";
import authMiddleware from "@/app/middleware/auth";
import { runMiddleware, cors } from "@/app/middleware/cors";
import Product from "@/app/modules/Product";

await connectDB();

export async function GET(req, { params }) {
  await runMiddleware(req, null, cors);

  try {
    const { category } = params;
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page")) || 1;
    let limit = parseInt(searchParams.get("limit")) || 8;

    // Перевірка допустимих категорій
    const validCategories = ["bedding", "towels", "household-linens"];
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ message: "Invalid category" }),
        { status: 400 }
      );
    }

    const totalProducts = await Product.countDocuments({ category });
    const products = await Product.find({ category })
      .skip((page - 1) * limit)
      .limit(limit);

    return new Response(
      JSON.stringify({
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        products,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching catalog", error: error.message }),
      { status: 500 }
    );
  }
}

// DELETE категорії (всі продукти цієї категорії)
export async function DELETE(req, { params }) {
  await runMiddleware(req, null, cors);
  await authMiddleware(req, null);

  try {
    const { category } = params;
    const validCategories = ["bedding", "towels", "household-linens"];
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ message: "Invalid category" }),
        { status: 400 }
      );
    }

    // Видаляємо всі продукти цієї категорії
    const result = await Product.deleteMany({ category });

    return new Response(
      JSON.stringify({ message: `${category} category deleted`, deletedCount: result.deletedCount }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error deleting category", error: error.message }),
      { status: 500 }
    );
  }
}