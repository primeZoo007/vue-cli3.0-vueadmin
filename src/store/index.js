import Vue from 'vue'
import Vuex from '@/vuexCopy/index'

import state from './state'
import getters from './getters'
import modules from './modules'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

console.log(getters)
export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    modules
})
