// 1.插件
// 2.两个组件
// vue插件function
// 要求必须有一个install，将来会被vue。use调用
let Vue // 保存vue的构造函数，插件中要使用
class VueRouter {
    constructor(options) {
        this.current = '/'
        // Vue.util.defineReactive(this, 'current', initial)
        this.current = window.location.hash.slice(1) || '/'
        Vue.util.defineReactive(this, 'matched', [])
        // match可以递归遍历路由表
        this.$options = options
        this.match()
        window.addEventListener('hashchange', () => {
            console.log(123)
            this.current = window.location.hash.slice(1)
            this.matched = []
            this.match()
        })
    }
    match(routes) {
        routes = routes || this.$options.routes
        // 递归遍历
        for (const route of routes) {
            if (route.path === '/' && this.current === '/') {
                this.matched.push(route)
                return
            }
            if (route.path !== '/' && this.current.indexOf(route.path) !== -1) {
                this.matched.push(route)
                if (route.children) {
                    this.match(route.children)
                }
                return
            }
        }
    }
}
// 参数1是vue。use的时候直接引入的
VueRouter.install = function (_Vue) {
    Vue = _Vue
    // 1.挂在vuerouter的属性
    // this.$router.push()
    // 全局混入
    Vue.mixin({
        beforeCreate() {
            // 子钩子在每次组件创建实例时都会调用
            if (this.$options.router) {
                // mixin让这行代码的执行延迟到router已经创建完,并且附加到选项上时才执行
                Vue.prototype.$router = this.$options.router
                // 每一个组件并且他们的实例都指向vue的原型对象，所以每个实例都能获取到router
                // 将router实例给vue的原型
            }
        }
    })

    // 任务二注册并实现router-link router-view
    Vue.component('router-link', {
        props: {
            to: {
                type: String,
                required: true
            }
        },
        render(h) {
            return h('a', { attrs: { href: '#' + this.to } }, this.$slots.default)
        }
    })
    Vue.component('router-view', {
        render(h) {
            // 标记当前route-view的深度
            this.$vnode.data.routerView = true
            let depth = 0
            let parent = this.$parent
            while (parent) {
                const vnodeData = parent.$vnode && parent.$vnode.data
                if (vnodeData) {
                    if (vnodeData.routerView) {
                        // 说明当前的router-view是个parent
                        depth++
                    }
                }
                parent = parent.$parent
            }
            let component = null
            // install的时候已经将options中的router申明给
            const route = this.$router.matched[depth]
            if (route) { component = route.component }
            return h(component)
        }
    })
}
export default VueRouter
