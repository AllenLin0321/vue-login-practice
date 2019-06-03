import Vue from 'vue'
import Vuex from 'vuex'
import axios from "./axios-auth";
import globalAxios from 'axios';
import router from './router';

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
    },
    clearAuthData(state) {
      state.idToken = null,
        state.userId = null
    }
  },
  actions: {
    setLogoutTimer({
      commit,
      dispatch
    }, expirationTime) {
      setTimeout(() => {
        dispatch('logout')
      }, expirationTime * 1000);
    },
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

          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          dispatch('storeUser', authData);
          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(error => {
          console.log('Error!' + error);
        })
    },
    tryAutoLogin({
      commit
    }) {
      const token = localStorage.getItem('token');
      if (!token) {
        return
      }

      const expirationDate = localStorage.getItem('expirationDate');
      const now = new Date();
      if (now >= expirationDate) {
        return
      }

      const userId = localStorage.getItem('userId');

      commit('authUser', {
        idToken: token,
        userId: userId
      })
      router.push('/dashboard');

    },
    login({
      commit,
      dispatch
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

          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          dispatch('setLogoutTimer', res.data.expiresIn);
          router.push('/dashboard');
        })
        .catch(error => {
          console.log('Error!' + error);
        })
    },
    logout({
      commit
    }) {
      commit('clearAuthData');
      router.replace('/signin');
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
    },
    isAuthenticated(state) {
      return state.idToken !== null
    }
  }
})