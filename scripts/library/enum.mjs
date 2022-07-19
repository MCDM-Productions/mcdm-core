/**
 * @class
 */
export default class Enum {

  /**
   * @param {Object<string,any>} props
   * @param {string} [clsName='Enum']
   * @member {string} name
   */
  constructor(props, clsName = 'Enum') {

    const members = Object.create(null);

    Object.keys(props)
      .forEach(name => members[name] = props[name]);

    if('name' in members) {
      throw new Error('Enum field "name" is not allowed');
    }

    members.name = clsName;

    return new Proxy(members, {
      get: (target, name, receiver) => {
        if (!Reflect.has(target, name)) {
          throw new Error(`Member '${String(name)}' not found on the Enum.`);
        }
        return Reflect.get(target, name, receiver);
      },
      set: (/*target, name, value*/) => {
        throw new Error('Adding new members to Enums is not allowed.');
      }
    });

  }


}
