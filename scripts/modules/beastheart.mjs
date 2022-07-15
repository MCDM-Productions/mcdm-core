import Enum from '../library/enum.mjs'
import Util from '../library/util.mjs'


class Beastheart {

  static #BH = new Enum( {
    LINK_FLAG: 'ferolink',
    RES_SETTING: 'feroPath',
    RES_OVERRIDE_SETTING: 'feroPathOverride',
  })

  static #hooks() {
    Hooks.on('updateActor', Beastheart.#ferocityLink);
  }

  static #settings() {
    const settingsData = {
      'feroPath' : {
        scope: 'world',
        config: true,
        type: String,
        choices: {
          'system.resources.primary.value': Util.localize('resources.primary.value'),
          'system.resources.primary.max': Util.localize('resources.primary.max'),
          'system.resources.secondary.value': Util.localize('resources.secondary.value'),
          'system.resources.secondary.max': Util.localize('resources.secondary.max'),
          'system.resources.tertiary.value': Util.localize('resources.tertiary.value'),
          'system.resources.tertiary.max': Util.localize('resources.tertiary.max'),
        },
        default: 'system.resources.primary.value'
      },
      'feroPathOverride' : {
        scope: 'client',
        config: true,
        type: String,
        default: '',
      }
    }

    Util.applySettings(settingsData);
  }

  static getFerocityPath() {
    const world = Util.setting(Beastheart.#BH.RES_SETTING);
    const override = Util.setting(Beastheart.#BH.RES_OVERRIDE_SETTING);

    if (override == '') return world;

    return override;
  }

  /**
   * @param {Function} registrar
   * @param {Object<string, string|number>} versionInfo
   */
  static register(registrar, versionInfo) {
    registrar('setup', Beastheart.#settings);
    registrar('setup', Beastheart.#hooks);
  }

  static async #ferocityLink(actor, update, options, user) {

    //We will only handle updates that we issued that was NOT caused by a link update
    if(user !== game.userId || !!(Beastheart.#BH.LINK_FLAG in options)) return;

    //Ferocity update?
    const priValue = getProperty(update, Beastheart.getFerocityPath());
    const linkedActorId = actor.getFlag(Util.DATA.NAME, Beastheart.#BH.LINK_FLAG);
    if(priValue != undefined && !!linkedActorId){

      //are they currently different?
      const linkedActor = game.actors.get(linkedActorId);
      if(getProperty(actor,Beastheart.getFerocityPath()) != getProperty(linkedActor,Beastheart.getFerocityPath())){
        await linkedActor.update({[Beastheart.getFerocityPath()]: priValue}, {[Beastheart.#BH.LINK_FLAG]: true});
      }
    }
  }

}

Hooks.once('mcdm-core.register', Beastheart.register);
