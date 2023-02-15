import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Mail from "@ioc:Adonis/Addons/Mail";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

import crypto from "crypto";
import User from "App/Models/User";

export default class UsersController {
  public async signUp({ request, response }: HttpContextContract) {
    const Userschema = schema.create({
      fullname: schema.string(),
      email: schema.string([
        rules.email(),
        rules.unique({ table: "users", column: "email" }),
      ]),
      password: schema.string([rules.minLength(8)]),
    });

    const payload = await request.validate({
      schema: Userschema,
      messages: {
        "*": (field, rule) => {
          return `${rule} : An Error Occured, please check ${field} and try again!`;
        },
        "email.unique": "Email already exist",
      },
    });

    const { fullname, email, password } = payload;

    const user = new User();
    user.email = email;
    user.fullname = fullname;
    user.password = password;

    await user.save();

    response
      .status(201)
      .json({ success: true, message: "User created successfully" });
  }

  public async login({ auth, request, response }: HttpContextContract) {
    const email = request.input("email");
    const password = request.input("password");

    try {
      const token = await auth.use("api").attempt(email, password);
      return response.status(200).json(token);
    } catch (error) {
      return response.unauthorized({ message: "Invalid Credentials" });
    }
  }

  public async updatePassword({
    auth,
    request,
    response,
  }: HttpContextContract) {
    const { newPassword, confirmPassword } = request.body();

    const user = await auth.use("api").authenticate();
    if (!user) {
      return response.badRequest({ message: "You are not logged in" });
    }

    if (newPassword != confirmPassword) {
      return response.badRequest({ message: "Password are not the same" });
    }
    user.password = newPassword;
    await user.save();

    return response.send({ message: "Updated Success" });
  }

  public async forgotPassword({ request, response }) {
    const { email } = request.body();
    console.log(request.body());
    const user = await User.findBy("email", email);

    if (!user) {
      return response.notFound({ message: "User not found" });
    }

    const code = crypto.randomBytes(7).toString("hex");

    await Mail.send((message) => {
      message
        .from("shopme@info.com")
        .to(user.email)
        .subject("Reset Your password")
        .htmlView("emails/verify", { code });
    });

    user.resetpasswordtoken = code;
    await user.save();

    return { message: "Email sent" };
  }

  public async resetPassword({
    request,
    response,
    params,
  }: HttpContextContract) {
    const { token } = params;
    const { password, confirmPassword } = request.body();

    const user = await User.query().where("resetpasswordtoken", token).first();

    if (!user) {
      return response.notFound({ message: "Invalid Token" });
    }

    if (password != confirmPassword) {
      return response.badRequest({ message: "Passwords are not the same" });
    }

    user.resetpasswordtoken = null;
    user.password = password;
    await user.save();

    return { message: "Password updated" };
  }
}
