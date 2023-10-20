import { shallowRef } from 'vue';

import Actions from './actions/Actions.vue';
import Audio from './audio/Audio.vue';
import Designs from './designs/Designs.vue';
import Icons from './icons/Icons.vue';
import InputBox from './input/InputBox.vue';
import Job from './job/Job.vue';
import StateTest from './stateTest/StateTest.vue';
import WheelMenu from './wheelMenu/WheelMenu.vue';
import EmptyStaticPage0 from './static/EmptyStaticPage0.vue';
import EmptyStaticPage1 from './static/EmptyStaticPage1.vue';
import EmptyStaticPage2 from './static/EmptyStaticPage2.vue';
import EmptyStaticPage3 from './static/EmptyStaticPage3.vue';
import EmptyStaticPage4 from './static/EmptyStaticPage4.vue';

export const CORE_IMPORTS = {
    Actions: shallowRef(Actions),
    Audio: shallowRef(Audio),
    Designs: shallowRef(Designs),
    Icons: shallowRef(Icons),
    InputBox: shallowRef(InputBox),
    Job: shallowRef(Job),
    StateTest: shallowRef(StateTest),
    WheelMenu: shallowRef(WheelMenu),
    EmptyStaticPage0: shallowRef(EmptyStaticPage0),
    EmptyStaticPage1: shallowRef(EmptyStaticPage1),
    EmptyStaticPage2: shallowRef(EmptyStaticPage2),
    EmptyStaticPage3: shallowRef(EmptyStaticPage3),
    EmptyStaticPage4: shallowRef(EmptyStaticPage4),
};
