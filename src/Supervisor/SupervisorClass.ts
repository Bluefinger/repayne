import { Stream, createStream, map, scan, throttle } from "rythe";
import merge, { ObjectPatch } from "mergerino";
import { render } from "lit-html";
import { patchContext, prepareRender } from "./SupervisorFns";
import type { App, Component, ViewFn, Register } from "./SupervisorTypes";

export class Supervisor<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  private _app: App<State, Actions>;
  private _render: Stream<App<State, Actions>>;
  public constructor(initialState: State = {} as State) {
    const update = createStream<ObjectPatch<State>>();
    this._app = {
      context: {
        prevState: {} as State,
        state: initialState,
        patch: [],
        next: [],
      },
      actions: {} as Actions,
      services: [],
      update,
      register: this.register.bind(this),
    };
    this._render = update.pipe(
      scan(patchContext, this._app),
      map(prepareRender),
      throttle
    );
  }
  public register<Components extends Component<any, any>[]>(
    ...components: Components & Register<Components, State, Actions>
  ): void {
    const { actions, context, services, update } = this._app;
    context.state = merge(
      context.state,
      components.map(({ initial, actions: newActions, service }) => {
        if (newActions) {
          Object.assign(actions, newActions(update));
        }
        if (service) {
          services.push(service);
        }
        return initial?.(context.state) as State;
      })
    );
    update({});
  }
  public render<T extends ViewFn<State, Actions>>(
    subscriberFn: T,
    container: Element
  ): void {
    this._render.pipe(
      map(({ context, actions }) =>
        render(subscriberFn(context.state, actions), container)
      )
    );
  }
}
