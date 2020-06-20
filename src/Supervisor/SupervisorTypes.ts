import type { ObjectPatch } from "mergerino";
import type { Stream } from "rythe";
import type { TemplateResult } from "lit-html";

export type PatchFn<State extends Record<string, unknown>> = (
  state: State
) => State;

export interface AppState {
  [id: string]: any;
}

export type ComponentActions = {
  [action: string]: (...args: any[]) => void;
};

export interface NextContext<
  State extends Record<string, any>,
  Actions extends ComponentActions
> {
  state: State;
  patch: ObjectPatch<State>[] | null;
  actions: Actions;
  update: Stream<ObjectPatch<State>>;
  register: <Components extends Component<any, any>[]>(
    ...components: Components
  ) => void;
}

export type NextFn<
  State extends Record<string, any>,
  Actions extends ComponentActions
> = (context: NextContext<State, Actions>) => void | Promise<void>;

export interface Context<
  State extends Record<string, any>,
  Actions extends ComponentActions
> {
  prevState: State;
  state: State;
  patch: ObjectPatch<State>[] | null;
  next: NextFn<State, Actions>[];
}

export type ServiceResult<
  State extends Record<string, any>,
  Actions extends ComponentActions
> = {
  state?: ObjectPatch<State>;
  next?: NextFn<State, Actions>;
  reset?: boolean | NextFn<State, Actions>;
};

export type ServiceFn<
  State extends Record<string, any>,
  Actions extends ComponentActions
> = (
  params: Context<State, Actions>
) => {
  state?: ObjectPatch<State>;
  next?: NextFn<State, Actions>;
  reset?: boolean | NextFn<State, Actions>;
};

export interface Component<
  State extends Record<string, unknown>,
  Actions extends ComponentActions
> {
  id: string;
  initial?: PatchFn<State>;
  actions?: (updater: Stream<ObjectPatch<State>>) => Actions;
  service?: ServiceFn<State, Actions>;
}

export interface Service<
  State extends Record<string, any>,
  Actions extends ComponentActions
> extends Component<State, Actions> {
  service: ServiceFn<State, Actions>;
}

export interface App<State extends Record<string, any>> {
  context: Context<State, ComponentActions>;
  actions: ComponentActions;
  services: ServiceFn<State, ComponentActions>[];
  update: Stream<ObjectPatch<State>>;
  register: <Components extends Component<any, any>[]>(
    ...components: Components
  ) => void;
}

export type ViewFn<
  State extends Record<string, any>,
  Actions extends ComponentActions
> = (
  state: State,
  actions: Actions extends infer T
    ? T extends ComponentActions
      ? T
      : ComponentActions
    : never
) => TemplateResult;
