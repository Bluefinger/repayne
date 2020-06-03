import type { ObjectPatch } from "mergerino";
import type { Stream } from "rythe";
import type { TemplateResult } from "lit-html";

export type PatchFn<State extends object> = (state: State) => State;

export interface AppState {
  [id: string]: any;
}

export type ComponentActions = {
  [action: string]: (...args: any[]) => void;
};

export interface NextContext<State extends object, Actions extends object> {
  state: State;
  patch: ObjectPatch<State>[] | null;
  actions: Actions;
  update: Stream<ObjectPatch<State>>;
  register: <Components extends Component<any, any>[]>(
    ...components: Components
  ) => void;
}

export type NextFn<State extends object, Actions extends object> = (
  context: NextContext<State, Actions>
) => Promise<void>;

export interface Context<State extends object, Actions extends object> {
  prevState: State;
  state: State;
  patch: ObjectPatch<State>[] | null;
  next: NextFn<State, Actions>[];
}

export type ServiceFn<State extends object, Actions extends object> = (
  params: Context<State, Actions>
) => {
  state?: ObjectPatch<State>;
  next?: NextFn<State, Actions>;
  reset?: boolean | NextFn<State, Actions>;
};

export interface Component<
  State extends object = object,
  Actions extends object = object
> {
  id: string;
  initial?: PatchFn<State>;
  actions?: (updater: Stream<ObjectPatch<State>>) => Actions;
  service?: ServiceFn<State, Actions>;
}

export interface Service<State extends object, Actions extends object>
  extends Component<State, Actions> {
  service: ServiceFn<State, Actions>;
}

export interface App<State extends object> {
  context: Context<State, ComponentActions>;
  actions: ComponentActions;
  services: ServiceFn<State, ComponentActions>[];
  update: Stream<ObjectPatch<State>>;
  register: <Components extends Component<any, any>[]>(
    ...components: Components
  ) => void;
}

export type ViewFn<State extends object, Actions extends object> = (
  state: State,
  actions: Actions extends infer T
    ? T extends ComponentActions
      ? T
      : ComponentActions
    : never
) => TemplateResult;
