import { SKIP } from "rythe";
import merge, { ObjectPatch } from "mergerino";
import type { App } from "./SupervisorTypes";

export const patchContext = <State extends object>(
  app: App<State>,
  patch: ObjectPatch<State>
): App<State> => {
  const { context, services } = app;
  context.prevState = context.state;
  context.patch = [patch];
  context.state = merge(context.state, patch);
  for (const service of services) {
    const { reset, next, state } = service(context);
    if (reset) {
      context.patch = null;
      context.state = context.prevState;
      if (typeof reset === "function") {
        context.next.length = 1;
        context.next[0] = reset;
        break;
      } else {
        return SKIP;
      }
    }
    if (state) context.state = merge(context.state, state);
    if (next) context.next.push(next);
  }
  return app;
};

export const prepareRender = <State extends object>(
  app: App<State>
): App<State> => {
  const { context, actions, update, register } = app;
  const { state, patch, next } = context;
  if (next.length) {
    const params = Promise.resolve({
      state,
      patch,
      actions,
      update,
      register,
    });
    for (const nextFn of next) {
      params.then(nextFn);
    }
    next.length = 0;
  }
  return patch ? app : SKIP;
};
