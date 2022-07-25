import Enum from './enum.mjs'

export default class Util {

  /**
   * @readonly
   * @type Record<string, any>
   */
  static DATA = new Enum( {
    NAME: 'mcdm-core',
    PATH: 'modules/mcdm-beastheart',
    TITLE: 'MCDM Core'
  });

  static localize(key, data) {
    return game.i18n.format(key, data);
  }

  static setting(name, scope = Util.DATA.NAME) {
    return game.settings.get(Util.DATA.NAME, name);
  }

  static applySettings(settingsData, scope = Util.DATA.NAME) {
    Object.entries(settingsData).forEach(([key, data]) => {
      game.settings.register(
        scope, key, {
          name: Util.localize(`setting.${key}.name`),
          hint: Util.localize(`setting.${key}.hint`),
          ...data
        }
      );
    });
  }

  static firstRunImport(moduleKey, imports) {
    
    const settingsData = {
      'firstRunImport': {
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
      }
    }

    Util.applySettings(settingsData, moduleKey);

    Hooks.on('ready', () => Util.#doImport(moduleKey, imports) );
  }

  static #doImport(moduleKey, imports) {

    if(!game.user.isGM || game.settings.get(moduleKey, 'firstRunImport')) return;

    /* run first import -- import all indicated documents */
    (async () => {

      const promises = Object.entries(imports).flatMap( ([packKey, destinations]) => {
        const pack = game.packs.get(packKey);
        return Object.entries(destinations).flatMap( ([type, info]) => {
          return info.map( async ([id, show]) => {
            let promise = game[type].importFromCompendium(pack, id, {permission: {default: CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER}})
            if(show) {
              const doc = await promise;
              return doc.sheet.render(true, {width:'100%', height: '100%'});
            }

            return promise;
          });
        });
      })

      await Promise.all(promises);

      await game.settings.set(moduleKey,'firstRunImport', true);
    })();

  }

}
