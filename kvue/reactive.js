// 数据响应式
function defineReactive(obj, key, val) {
    // 递归遍历子元素，解决嵌套问题
    observe(val)
    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key)
            return val
        },
        set(newVal) {
            if (val !== newVal) {
                console.log('set', key)
                val = newVal
                // 保证如果newVal是对象，再次赋值做响应式，如果newVal为对象不在set中监听，那吗newVal中的自级将不能被监听，继续修改之后，元素并没有被监听
                observe(newVal)
                update(obj)
            }
        }
    })
}
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}
function set(obj, key, val) {
    defineReactive(obj, key, val)
}
function update(obj, key, val) {
}
const obj = {
    foo: 'foo',
    bar: 'bar',
    test: {
        a: '1'
    }
}
observe(obj)

// obj.foo = '1234'
// obj.test.a = '789'
obj.test.a = {
    m: '123'
}
obj.test.a = '567'
// 新增或者
set(obj, 'dong', 'dong')

// arr数据 defineproperty为什么不行
// 数组中有很多方法会改变数组本身，push/pop/unshift.. 使用defineproperty的方式拦截不到
// 通过拿到原型里面的方法去修改原型中的方法
