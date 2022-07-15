
export default class Enum {

  /**
   * @param {Object<string,any>} props
   */
  constructor(props) {

    const members = Object.create(null);

    Object.keys(props)
      .forEach(name => members[name] = props[name]);

    /** @type {Object<string, any>} */
    return new Proxy(members, {
      get: (target, name) => {
        if (!members[name]) {
          throw new Error(`Member '${name}' not found on the Enum.`);
        }
        return members[name];
      },
      set: (target, name, value) => {
        throw new Error('Adding new members to Enums is not allowed.');
      }
    });

  }


}
