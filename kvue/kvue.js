// 数据响应式
function defineReactive(obj, key, val) {
    // 递归遍历子元素，解决嵌套问题
    observe(val)
    // 闭包，不回被释放
    const dep = new Dep()
    Object.defineProperty(obj, key, {
        get() {
            // console.log('get', key)
            // Dep.target = watcher 两者形成关系
            Dep.target && dep.addDep(Dep.target)
            return val
        },
        set(newVal) {
            if (val !== newVal) {
                // console.log('set', key)
                val = newVal
                // 保证如果newVal是对象，再次赋值做响应式，如果newVal为对象不在set中监听，那吗newVal中的自级将不能被监听，继续修改之后，元素并没有被监听
                observe(newVal)
                // set 新的值的同时调用dep中notify方法，使管家将wathcer分法调用watcher中的update方法，使数据和视图更新
                dep.notify()
            }
        }
    })
}
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }
    new Observer(obj)
}
function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(val) {
                vm.$data[key] = val
            }
        })
    })
}
class Observer { // 根据传入的value类型做相应的响应式处理
    constructor(value) {
        this.value = value
        if (Array.isArray(value)) {

        } else {
            this.walk(value)
        }
    }
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}
function set(obj, key, val) {
    defineReactive(obj, key, val)
}
function update(obj, key, val) {

}

// arr数据 defineproperty为什么不行
// 数组中有很多方法会改变数组本身，push/pop/unshift.. 使用defineproperty的方式拦截不到
// 通过拿到原型里面的方法去修改原型中的方法

// 模版引擎的愈发

// Kvue1.对data选项做响应式处理
// 2.编译模版
class Kvue {
    constructor(options) {
        this.$options = options
        this.$data = options.data
        // data响应式处理
        observe(this.$data)
        // 代理,将data上的数据挂载到实例上
        proxy(this)
        new Compile(options.el, this)
    }
}

// 1.处理插值
// 2.处理指令和事件
// 3.以上两者初始化和更新
class Compile {
    constructor(el, vm) {
        this.$vm = vm
        this.$el = document.querySelector(el)
        if (this.$el) {
            this.compile(this.$el)
        }
    }
    compile(el) {
        // 遍历el的子节点，判断他们的相应处理
        const childNodes = el.childNodes
        childNodes.forEach(node => {
            if (node.nodeType === 1) {
                // 元素
                const attrs = node.attributes
                Array.from(attrs).forEach(attr => {
                    const attrName = attr.name
                    const exp = attr.value
                    if (attrName.startsWith('k-')) {
                        const dir = attrName.substring(2)
                        this[dir] && this[dir](node, exp)
                    }
                })
            } else if (node.nodeType === 3) {
                // 文本的处理
                if (this.isInter(node)) {
                    // 此处匹配{{}}
                    // console.log('插值', node.textContent)
                    this.compileText(node)
                }
            }
            if (node.childNodes) {
                this.compile(node)
            }
        })
    }
    update(node, exp, dir) {
        // 1.初始化
        const fn = this[dir + 'Updater']
        fn && fn(node, this.$vm[exp])
        // 2.更新时候重制函数
        new Watcher(this.$vm, exp, function(val) {
            fn && fn(node, val)
        })
    }
    model(node, exp) {
        node.addEventListener('input', e => {
            // defineReactive(this.$vm, exp, e.target.value)
            this.$vm[exp] = e.target.value
        })
        this.update(node, exp, 'model')
    }
    modelUpdater(node, val) {
        node.value = val
    }
    html(node, exp) {
        this.update(node, exp, 'html')
    }
    htmlUpdater(node, value) {
        node.innerHTML = value
    }
    text(node, exp) {
        this.update(node, exp, 'text')
    }
    textUpdater(node, value) {
        node.textContent = value
    }
    compileText(node) {
        this.update(node, RegExp.$1, 'text')
    }
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}
class Watcher {
    constructor(vm, key, updateFn) {
        this.$vm = vm
        this.key = key
        this.updateFn = updateFn
        // 触发依赖是收集，将dep和watcher之间产生联系
        Dep.target = this
        this.$vm[this.key]
        // 触发get方式，使其之间产生联系
        Dep.target = null
    }
    // 未来被Dep实例调用
    update() {
        // 将最近的值传递
        this.updateFn.call(this.$vm, this.$vm[this.key])
    }
}

class Dep {
    constructor() {
        this.deps = []
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify() {
        // dep则是没有watcher
        this.deps.forEach(dep => {
            dep.update()
        })
    }
}
