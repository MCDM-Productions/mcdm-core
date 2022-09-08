/**
 * @class 
 * @property {String} name
 */
export default class Enum {

  /**
   * @param {Object<string,any>} props
   * @param {string} [clsName='Enum']
   */
  constructor(props, clsName = 'Enum') {

    const members = Object.create(null);

    Object.keys(props)
      .forEach(name => members[name] = props[name]);

    if('name' in members) {
      throw new Error(game.i18n.localize('mcdmcore.error.enum.badField'));
    }

    /**
     * @name Enum.name
     * @memberof Enum
     */
    members.name = clsName;

    return new Proxy(members, {
      get: (target, name, receiver) => {
        if (!Reflect.has(target, name)) {
          throw new Error(game.i18n.format('mcdmcore.error.enum.notFound', {path: String(name), class: clsName }));
        }
        return Reflect.get(target, name, receiver);
      },
      set: (/*target, name, value*/) => {
        throw new Error(game.i18n.localize('mcdmcore.error.enum.noAdd'));
      }
    });

  }


}
