import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { listRequest } from '../requests/ListRequest';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    expires: 0,
    favoriteLevels: []
  }),

  getters: {
    accessToken: (state) => {
      if (state.expires - Date.now() > 0) return state.user?.access_token ?? undefined
      else return undefined
    },
    isLoggedIn: (state) => {
      if (!state.accessToken || state.accessToken.length == 0) return false
      return true
    },
    isModerator: (state) => {
      if (!state.isLoggedIn) return false
      return state.user.info.is_moderator === true
    },
    isAdmin: (state) => {
      if (!state.isLoggedIn) return false
      return state.user.info.is_admin === true
    },
    userID: (state) => {
      if (!state.isLoggedIn) return undefined
      return state.user.info?.user_id ?? undefined
    },
    userInfo: (state) => {
      if (!state.isLoggedIn) return undefined
      return state.user.info ?? undefined
    }
  },

  actions: {
    async fetchUser(serverURL, authInfo) {
      if (authInfo !== null && "org_scoped_id" in authInfo && "code" in authInfo) {
        let response = await fetch(serverURL + 'get_access_token?service_type=oculus_web_demo&service_user_token=' + authInfo.org_scoped_id + ':' + authInfo.code)
        if (response.status != 200) {
          const responseBody = await response.text()
          console.log(responseBody)
        }
        else {
          const responseBody = await response.json()
          this.user = responseBody;
          this.expires = Date.now() + 2 * 60 * 60 * 1000 //valid for 2 hours
        }
      }
    },
    async fetchUsersFavorites(serverURL, maxLevelFormatVersion) {
      if (this.accessToken) {
        const favoriteLevels = await listRequest(serverURL, this.accessToken, 'tab_favorite_levels', null, maxLevelFormatVersion, null, null)
        if (favoriteLevels !== false) {
          this.favoriteLevels = favoriteLevels.map(level => level.identifier);
        }
      }
    },
    isFavorited(level_id) {
      return this.favoriteLevels.includes(level_id)
    },
    removeFavoriteLevel(level_id) {
      const index = this.favoriteLevels.indexOf(level_id);
      if (index !== -1) {
        this.favoriteLevels.splice(index, 1);
      }
    },
    addFavoriteLevel(level_id) {
      if (!this.favoriteLevels.includes(level_id)) {
        this.favoriteLevels.push(level_id);
      }
    }
  },
  persist: true,
})
