import Enum from './library/enum.mjs'

export class CORE {

  static #registrar = new Map();

  
  /**
   * @param {string} setupHook
   * @param {Function} fn
   */
  static #registerModule(setupHook, fn) {
    if (setupHook === 'init') {
      throw new Error('Invalid registration stage "init" used.')
    }

    if(CORE.#registrar.has(setupHook)) {
      CORE.#registrar.get(setupHook).push(fn);
    } else {
      CORE.#registrar.set(setupHook, [fn]);
    }

    return;

  }

  static #callRegistration(...args) {
    const system = game.system.version;
    const {generation, build} = game.release;
    Hooks.callAll('mcdm-core.register', CORE.#registerModule, {generation, build, system}, ...args); 

    CORE.#registrar.forEach( (hookName, fnArray) => fnArray.forEach( fn => Hooks.once(hookName, fn ) ) );
  }
  
  static build() {
    //all startup tasks needed before sub module initialization
    Hooks.once('init', CORE.callRegistration);
  }
}



/*
  Initialize Module
*/
CORE.build();

