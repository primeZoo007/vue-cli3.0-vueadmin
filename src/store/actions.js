export default {
    add({ commit }) {
        setTimeout(() => {
            commit('add')
        }, 1000)
    }
}
