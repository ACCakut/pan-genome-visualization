var Config;
import { Model } from 'backbone-thin';

// simple user config
module.exports = Config = Model.extend({

  defaults:
    {registerMouseHover: false,
    registerMouseClicks: true,
    importProxy: "",
    importProxyStripHttp: false,
    eventBus: true,
    alphabetSize: 20,
    dropImport: false,
    debug: false,
    hasRef: false, // hasReference
    bootstrapMenu: false,
    manualRendering: false // not recommended to turn on
    }
});
