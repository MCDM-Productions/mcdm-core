
// try to use a proper type
declare global {
  interface LenientGlobalVariableTypes {
    game: Game; 
    canvas: Canvas;
  };
}

class ClientDocument extends ClientDocumentMixin(Document<>) {
  get constructor(): any; 

  getFlag(scope: string, key: string): any;
}

var game;
var Hooks;

function getProperty(obj: Object, path: String);

class AnyClass {
  constructor(...args) {};
  name: string;
}


