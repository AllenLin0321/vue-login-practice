import Vue from 'vue'
import Vuex from 'vuex'
import axios from "./axios-auth";
import globalAxios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.idToken,
        state.userId = userData.userId
    },
    storeUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    signup({
      commit,
      dispatch
    }, authData) {
      axios.post('/signupNewUser?key=AIzaSyB_7AE9XzHKRhHaYfLWY38zJJH0GVB2Q84', {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          commit('authUser', {
            idToken: res.data.idToken,
            userId: res.data.localId
          });
          dispatch('storeUser', authData);
        })
        .catch(error => {
          console.log('Error!' + error);
        })
    },
    login({
      commit
    }, authData) {
      axios.post('/verifyPassword?key=AIzaSyB_7AE9XzHKRhHaYfLWY38zJJH0GVB2Q84', {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          commit('authUser', {
            idToken: res.data.idToken,
            userId: res.data.localId
          })
        })
        .catch(error => {
          console.log('Error!' + error);
        })
    },
    storeUser({
      commit,
      state
    }, userData) {
      if (!state.idToken) {
        return
      }
      globalAxios.post(`/users.json?auth=${state.idToken}`, userData)
        .then(res => console.log(res))
        .catch(error => console.log(error))
    },
    fetchUser({
      commit,
      state
    }) {
      // Check there is the Token or not
      if (!state.idToken) {
        return
      }
      globalAxios.get(`/users.json?auth=${state.idToken}`)
        .then(res => {
          const data = res.data;
          const users = [];
          for (const key in data) {
            const user = data[key];
            user.id = key;
            users.push(user);
          }
          commit('storeUser', users[0]);
        })
        .catch(error => console.log(error))
    }
  },
  getters: {
    user(state) {
      return state.user;
    }
  }
})