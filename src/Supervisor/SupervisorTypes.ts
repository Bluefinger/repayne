import type { ObjectPatch } from "mergerino";
import type { Stream } from "rythe";
import type { TemplateResult } from "lit-html";

type inferComponent<
  Comp extends Component<any, any>,
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = Comp extends Component<infer S, infer A>
  ? Component<State extends S ? S : never, Actions extends A ? A : never>
  : never;

export type Register<
  Components extends Component<any, any>[],
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = {
  [I in keyof Components]: Components[I] extends Component<any, any>
    ? inferComponent<Components[I], State, Actions>
    : never;
};

export type PatchFn<State extends Record<string, unknown>> = (
  state: State
) => State;

export interface NextContext<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  state: State;
  patch: ObjectPatch<State>[] | null;
  actions: Actions;
  update: Stream<ObjectPatch<State>>;
  register: <Components extends Component<State, Actions>[]>(
    ...components: Components & Register<Components, State, Actions>
  ) => void;
}

export type NextFn<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = (context: NextContext<State, Actions>) => void | Promise<void>;

export interface Context<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  prevState: State;
  state: State;
  patch: ObjectPatch<State>[] | null;
  next: NextFn<State, Actions>[];
}

export type ServiceResult<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = {
  state?: ObjectPatch<State>;
  next?: NextFn<State, Actions>;
  reset?: boolean | NextFn<State, Actions>;
};

export type ServiceFn<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = (
  params: Context<State, Actions>
) => {
  state?: ObjectPatch<State>;
  next?: NextFn<State, Actions>;
  reset?: boolean | NextFn<State, Actions>;
};

export interface Component<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  id: string;
  initial?: PatchFn<State>;
  actions?: (updater: Stream<ObjectPatch<State>>) => Actions;
  service?: ServiceFn<State, Actions>;
}

export interface Service<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> extends Component<State, Actions> {
  service: ServiceFn<State, Actions>;
}

export interface App<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  context: Context<State, Actions>;
  actions: Actions;
  services: ServiceFn<State, Actions>[];
  update: Stream<ObjectPatch<State>>;
  register: <Components extends Component<State, Actions>[]>(
    ...components: Components & Register<Components, State, Actions>
  ) => void;
}

export type ViewFn<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = (state: State, actions: Actions) => TemplateResult;
