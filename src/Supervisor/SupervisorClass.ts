import { Stream, createStream, map, scan, throttle } from "rythe";
import merge, { ObjectPatch } from "mergerino";
import { render } from "lit-html";
import { patchContext, prepareRender } from "./SupervisorFns";
import type {
  App,
  Component,
  ComponentActions,
  ViewFn,
} from "./SupervisorTypes";

export class Supervisor<State extends Record<string, any>> {
  private _app: App<State>;
  private _render: Stream<App<State>>;
  public constructor(initialState: State = {} as State) {
    const update = createStream<ObjectPatch<State>>();
    this._app = {
      context: {
        prevState: {} as State,
        state: initialState,
        patch: [],
        next: [],
      },
      actions: {},
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
  public register<Components extends Component<State, any>[]>(
    ...components: Components
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
        return initial?.(context.state);
      })
    );
    update({});
  }
  public render(
    subscriberFn: ViewFn<State, ComponentActions>,
    container: Element
  ): void {
    this._render.pipe(
      map(({ context, actions }) =>
        render(subscriberFn(context.state, actions), container)
      )
    );
  }
}
