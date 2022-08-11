/**
 * @typedef {typeof import('../module.mjs').CORE} CORE
 */

export class Illrigger {

  static build() {
    Hooks.once('mcdm-core.register', Illrigger.#register);
    Hooks.once('mcdm-core.addApi', Illrigger.#addApi);
  }

  static #register(_, versionInfo) {
    console.log(`Registering Illrigger Plugin`, versionInfo);
  }

  static #addApi(_) {
    /** no api to add, but we need to use the CORE patch function */
    Illrigger.#config();
    Illrigger.#patch();
  }

  static #config() {
    const { Util } = game.modules.get('mcdm-core')?.api
    if(!Util) console.error('Could not initialize Illrigger plugin from mcdm-core -- no API provided!');


    globalThis.game.dnd5e.config.spellProgression.illrigger = Util.localize("Illrigger");
    globalThis.game.dnd5e.config.ILLRIGGER_SLOT_TABLE = [
        [
          0
        ],
        [
          0
        ],
        [
          2
        ],
        [
          3
        ],
        [
          3, 2
        ],
        [
          3, 2
        ],
        [
          4, 2, 2
        ],
        [
          4, 3, 2
        ],
        [
          4, 3, 2, 1 
        ],
        [
          4, 3, 3, 2 
        ],
        [
          4, 3, 3, 3, 1
        ],
        [
          4, 3, 3, 3, 1
        ],
        [
          4, 3, 3, 3, 1
        ],
        [
          4, 3, 3, 3, 1
        ],
        [
          4, 3, 3, 3, 1, 1
        ],
        [
          4, 3, 3, 3, 1, 1
        ],
        [
          4, 3, 3, 3, 1, 1
        ],
        [
          4, 3, 3, 3, 1, 1
        ],
        [
          4, 3, 3, 3, 2, 1
        ],
        [
          4, 3, 3, 3, 2, 1
        ]
      ] 
    
  }

  static #patch() {

    const { CORE } = game.modules.get('mcdm-core')?.api;
    if(!CORE) console.error('Could not initialize Illrigger plugin from mcdm-core -- no API provided!');
    const target = 'dnd5e.documents.Actor5e.prototype';

    const patches = {
      prepareDerivedData: {
        value: Illrigger.deriveIllriggerSlots,
        mode: 'WRAPPER',
      }
    }

    CORE.patch(target, patches);

  }



  /**
   * Spellcasting Progression Management
   * @this Actor
   */
  static deriveIllriggerSlots(wrapped, ...args) {

    /* call base derived data */
    wrapped(...args); 

    /* prepare any illrigger progression */ 
    const {name, type, items, system: {spells}} = this;

    /* only consider PCs (for now?) */
    if (type !== 'character') return;

    /* any class/subclass could have illrigger progression */
    const classes = items.filter( item => ['class', 'subclass'].includes(item.type) )

    if (classes.length == 0) return;

    /* do we have *any* illrigger progression? */
    const progression = classes.reduce( (acc, curr) => {
      const prog = curr.system.spellcasting?.progression ?? 'none';
      if(prog == 'none') return acc;

      /* allocate space for this progression */
      if(!acc[prog]) {
        acc[prog] = 0;
      }

      /* subclass? look up main class */
      if (curr.type == 'subclass') {
        const classId = curr.system.classIdentifier;
        // @ts-ignore
        const classItem = this.classes[classId];
        if(!classItem) {
          console.debug(`Could not locate class by identifier '${classId}' from:`, curr);
          return acc;
        }

        acc[prog] += classItem.system.levels;
        return acc;
      }

      /* full class? level is direct */
      if (curr.type == 'class') {
        acc[prog] += curr.system.levels;
        return acc;
      }

    }, {});

    if(!progression.illrigger) return; //no modifications need to be made, core handled it

    /* illrigger progression present, are there any OTHERS that need to be multiclass computed? */
    console.log(progression, spells);
    const isMC = Object.keys(progression).length > 1;

    if (isMC) {
      Illrigger.computeMCProgression(progression, spells);
    } else {
      progression.slots = progression.illrigger;
      Illrigger.computeProgression(progression, spells);
    }

  }

  static computeMCProgression(progression, spells) {

    /* scale caster types to their equivalent level */
    const equivalentFull = Object.entries(progression).reduce( (acc, [prog, level]) => {
      switch (prog) {
        case 'full': acc += level; break;
        case 'half': acc += Math.floor(level/2); break;
        case 'illrigger': //fallthrough -> illrigger = third caster for MC
        case 'third': acc += Math.floor(level/3); break;
        case 'artificer': acc += Math.ceil(level/2); break;
      }

      return acc;
    },0);

    progression.slots = equivalentFull;
    Illrigger.computeProgression(progression, spells, game.dnd5e.config.SPELL_SLOT_TABLE);
  };


  static computeProgression(progression, spells, slotTable = game.dnd5e.config.ILLRIGGER_SLOT_TABLE) {

    /** Taken from dnd5e/module/actor/entity.js:627 -- (C) MIT Foundry Network **/
    // Look up the number of slots per level from the progression table
    const levels = Math.clamped(progression.slots, 0, CONFIG.DND5E.maxLevel);
    const slots = slotTable[Math.min(levels, slotTable.length) - 1] || [];
    for ( let [n, lvl] of Object.entries(spells) ) {
      let i = parseInt(n.slice(-1));
      if ( Number.isNaN(i) ) continue;
      if ( Number.isNumeric(lvl.override) ) lvl.max = Math.max(parseInt(lvl.override), 0);
      else lvl.max = slots[i-1] || 0;
      lvl.value = parseInt(lvl.value);
    }
  };
}

Illrigger.build();
