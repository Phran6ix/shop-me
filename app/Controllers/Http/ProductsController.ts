import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Product from "App/Models/Product";

enum CATEGORY {
  SNEAKERS = "sneakers",
  TSHIRT = "T-shirt",
  FEMALEBAG = "female bag",
  WRISTWATCH = "wristwatch",
  OFFICEWEARS = "office wears",
}

export default class ProductsController {
  public async createProduct({ request, response, auth }: HttpContextContract) {
    await auth.use("api").authenticate();
    const user = auth.use("api").user!;

    const productSchema = schema.create({
      name: schema.string(),
      description: schema.string(),
      category: schema.enum(Object.values(CATEGORY)),
      price: schema.number(),
    });

    const payload = await request.validate({ schema: productSchema });

    const product = await user.related("products").create({ ...payload });

    return response.created({ data: product });
  }

  public async getProducts({ response }: HttpContextContract) {
    const products = await Product.query().preload("uploader");
    return response.send({ products });
  }

  public async getProduct({ params, response }) {
    const { id } = params;

    const product = await Product.query().where("id", id).preload("uploader");

    return response.status(200).json({ product });
  }

  public async update({ params, request, response }: HttpContextContract) {
    const product = await Product.findOrFail(params.id);
    const updateProductSchema = schema.create({
      name: schema.string.optional(),
      description: schema.string.optional(),

      price: schema.number.optional(),
    });

    const data = await request.validate({ schema: updateProductSchema });

    await product.merge({ ...data }).save();

    return response.ok({ message: "Update Successful" });
  }

  public async deleteProduct({ response, params }) {
    const product = await Product.findOrFail(params.id);
    await product.delete();

    return response.noContent();
  }
}
