import { Util, Enum, LibWrapperShim } from './library/lib.mjs'

/**
 * @namespace API
 */

export class CORE {

  static #registrar = new Map();
  
  /**
   * @type Record<string, any>
   */
  static MCDMHooks = new Enum({
    REGISTER: 'mcdm-core.register',
    ADD_API: 'mcdm-core.addApi',
  }, 'HOOK');

  /**
   * Wrapper for hook management. Groups functions together into a single
   * anonymous hook function per hook name.
   *
   * @param {string} setupHook hook name to use for this registration/init
   * @param {Function} fn hook function to be executed
   * @param {boolean} [runOnce=true] persistent hook or one-time hook?
   */
  static registerPlugin (setupHook, fn, runOnce = true) {
    if (setupHook === 'init') {
      throw new Error(Util.localize('error.badRegStage'));
    }

    if(CORE.#registrar.has([setupHook, runOnce])) {
      CORE.#registrar.get(setupHook).push(fn);
    } else {
      CORE.#registrar.set([setupHook, runOnce], [fn]);
    }

    return;
  }

  static #createHooks() {
    const map = {
      true: 'once',
      false: 'on',
    };

    CORE.#registrar.forEach( (fnArray, hookInfo) => {
      Hooks[map[hookInfo[1]]](hookInfo[0], (...args) => {
        fnArray.forEach( fn => fn(...args) );
      })
    });
  }

  /**
   * Helper function that allows MCDM plugins to add
   * their specific API to the MCDM CORE namespace.
   *
   * @param {AnyClass} cls Parent class of provided methods/fields
   * @param {Array<Function|any>} symbolList functions/fields to expose to module api
   */
  static addPluginApi(cls, symbolList) {
    game.modules.get(Util.DATA.NAME).api[cls.name] = symbolList.reduce( (acc,curr) => {
      acc[curr.name] = curr
      return acc;
    }, {});
  }

  /**
   * @param {any[]} args any hook arguments passed from the system during
   * this stage of initialization
   */
  static #callRegistration(...args) {

    /* initialize api namespace */
    game.modules.get(Util.DATA.NAME).api = {};

    /* construct libwrapper shim and get patch helper */
    const innerPatch = LibWrapperShim.register();
    const patch = (...args) => innerPatch(Util.DATA.NAME, ...args);

    CORE.addPluginApi(CORE, [CORE.MCDMHooks, CORE.registerPlugin, CORE.addPluginApi, patch]);

    const system = game.system.version;
    const {generation, build} = game.release;

    Hooks.callAll('mcdm-core.register', CORE.registerPlugin, {generation, build, system}, ...args); 
    CORE.#createHooks();
  }

  static #callAddApi(...args) {
    CORE.addPluginApi(Util, [Util.setting, Util.applySettings, Util.localize, Util.firstRunImport, Util.DATA])
    Hooks.callAll(CORE.MCDMHooks.ADD_API, CORE.addPluginApi, ...args);
  }
  
  static build() {
    //all startup tasks needed before sub module initialization
    Hooks.once('init', CORE.#callRegistration);
    Hooks.once('setup', CORE.#callAddApi);
  }
}

/*
  Initialize Module
*/
CORE.build();

