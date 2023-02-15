import { AuthenticationException } from "@adonisjs/auth/build/standalone";
import type { GuardsList } from "@ioc:Adonis/Addons/Auth";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

/**
 * Auth middleware is meant to restrict un-authenticated access to a given route
 * or a group of routes.
 *
 * You must register this middleware inside `start/kernel.ts` file under the list
 * of named middleware.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to when request is Unauthorized
   */
  protected redirectTo = "/login";

  protected async authenticate(
    auth: HttpContextContract["auth"],
    guards: (keyof GuardsList)[]
  ) {
    let guardLastAttempted: string | undefined;

    for (let guard of guards) {
      guardLastAttempted = guard;

      if (await auth.use(guard).check()) {
        return true;
      }
    }

    throw new AuthenticationException(
      "Unauthorized access",
      "E_UNAUTHORIZED_ACCESS",
      guardLastAttempted,
      this.redirectTo
    );
  }

  /**
   * Handle request
   */
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: (keyof GuardsList)[]
  ) {
    const guards = customGuards.length ? customGuards : [auth.name];
    await this.authenticate(auth, guards);
    await next();
  }
}
