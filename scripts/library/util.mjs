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

  static setting(name) {
    return game.settings.get(Util.DATA.NAME, name);
  }

  static applySettings(settingsData) {
    Object.entries(settingsData).forEach(([key, data]) => {
      game.settings.register(
        Util.DATA.NAME, key, {
          name: Util.localize(`setting.${key}.name`),
          hint: Util.localize(`setting.${key}.hint`),
          ...data
        }
      );
    });
  }
}
