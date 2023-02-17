/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.patch("/forgot-password", "AuthController.forgotPassword");
  Route.post("/register", "AuthController.signUp");
  Route.post("/login", "AuthController.login");
  Route.patch("/update-password", "AuthController.updatePassword");
  Route.patch("/reset-password/:token", "AuthController.resetPassword");
}).prefix("/api/auth");

Route.group(() => {
  Route.post("/create", "ProductsController.createProduct");
  Route.get("/all", "ProductsController.getProducts");
  Route.get("/:id", "ProductsController.getProduct");
  Route.patch("update/:id", "ProductsController.update");
  Route.delete("/delete/:id", "ProductsController.deleteProduct");
})
  .middleware("auth:api")
  .prefix("/api/product");
