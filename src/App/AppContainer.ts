/* eslint-disable @typescript-eslint/ban-types */
import { createStream, map as mapStream, scan, throttle } from "rythe";
import merge from "mergerino";
import { render, TemplateResult } from "lit-html";
import { filter, map } from "../utils/iterables";
import {
  Service,
  Action,
  EffectFn,
  Component,
  App,
  Register,
  Patch,
} from "./types";

const filterUndefined = <Value extends unknown>(
  value: Value | undefined
): boolean => value !== undefined;

const executeEffect = function <State extends Record<string, unknown>>(
  this: State,
  effect: EffectFn<State>
) {
  effect(this);
};

export const createAppContainer = <
  State extends Record<string, unknown> = {},
  Actions extends Record<string, Action> = {}
>(
  initialState = {} as State
): App<State, Actions> => {
  const services: Service<State>[] = [];
  const effects: EffectFn<State>[] = [];
  const actions = {} as Actions;
  const update = createStream<Patch<State>>();
  const registered = new Set<string>();

  const serviceAccumulator = (state: State, service: Service<State>): State =>
    merge(state, service(state));
  const serviceLayer = (state: State) =>
    services.reduce(serviceAccumulator, state);

  const states = update.pipe(
    scan<Patch<State>, State>(
      (state, patch) => serviceLayer(merge(state, patch)),
      initialState
    )
  );

  const isRegistered = <C extends Component<State, Actions>>({ id }: C) =>
    !registered.has(id);

  const registerComponent = <C extends Component<State, Actions>>({
    id,
    initial,
    actions: newActions,
    service,
    effects: effect,
  }: C) => {
    registered.add(id);
    if (newActions) {
      Object.assign(actions, newActions(update));
    }
    if (service) {
      services.push(service);
    }
    if (effect) {
      effects.push(effect(update, actions));
    }
    return initial?.(states());
  };

  const register = <Components extends Component<State, Actions>[]>(
    ...components: Components & Register<Components, State, Actions>
  ) => {
    const loadComponents = filter(
      map(filter(components as Components, isRegistered), registerComponent),
      filterUndefined
    );
    const toLoad = [...loadComponents];
    if (toLoad.length) {
      update(merge(states(), toLoad));
    }
  };

  states.pipe(
    mapStream((state) => {
      if (effects.length) {
        effects.forEach(executeEffect, state);
      }
    })
  );
  const throttled = states.pipe(throttle);

  return {
    register,
    render: (
      subscriberFn: (
        state: State,
        actions: Actions
      ) => TemplateResult | undefined,
      container: Element
    ): void => {
      throttled.pipe(
        mapStream((state) => render(subscriberFn(state, actions), container))
      );
    },
    subscribe: <T extends unknown>(fn: (state: State) => T) =>
      throttled.pipe(mapStream(fn)),
  };
};
