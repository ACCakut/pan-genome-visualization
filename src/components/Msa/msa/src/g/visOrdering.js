var Visibility;
import { Model } from 'backbone-thin';

// visible areas
module.exports = Visibility = Model.extend({

  defaults:

    // for the Stage
    {searchBox: -10,
    overviewBox: 30,
    headerBox: -1,
    alignmentBody: 0,
    scaleSlider: 50
    }
});
