// 1.实现插件核心 挂在$store
// 实现Store
let Vue
class Store {
    constructor(options) {
        this.state = new Vue({
            data: options.state
        })
        this._mutations = options.mutations
        this._actions = options.actions
        // this._getters={}
        // Object.keys(options.getters).map(key=>{
        //     Object.defineProperty(this._getters,key,{get(){
        //         return this._getters[key]
        //     },set(newAge){
        //         this._getters[key] = newAge
        //     }})
        // })
        this.commit = this.commit.bind(this)
        // 绑定上下文中的数据是this指向$Store
        this.dispatch = this.dispatch.bind(this)
    }
    commit(type, payload) {
        const entry = this._mutations[type]
        if (!entry) {
            console.error('unkown mutation type')
        }
        entry(this.state, payload)
    }

    dispatch(type, payload) {
        const entry = this._actions[type]
        if (!entry) {
            console.error('unkown action type')
        }
        entry(this, payload)
    }

    // getters(state) {
    //     const entry = this._getters[type]
    //     if (!entry) {
    //         console.error('unkown getters type')
    //     }
    //     entry(this.state)
    // }
}
// haha
function install(_Vue) {
    Vue = _Vue
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}

export default { install, Store }
