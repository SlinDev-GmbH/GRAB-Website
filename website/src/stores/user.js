import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    expires: 0
  }),

  getters: {
    accessToken(state) {
      if(state.expires - Date.now() > 0) return state.user?.access_token ?? undefined
      else return undefined
    },
    isLoggedIn(state) {
      if(!this.accessToken || this.accessToken.length == 0) return false
      return true
    },
    isModerator(state) {
      if(!this.isLoggedIn) return false
      return state.user.info.is_moderator === true
    },
    isAdmin(state) {
      if(!this.isLoggedIn) return false
      return state.user.info.is_admin === true
    },
    userID(state) {
      if(!this.isLoggedIn) return undefined
      return state.user.info?.user_id ?? undefined
    },
    userInfo(state) {
      if(!this.isLoggedIn) return undefined
      return state.user.info ?? undefined
    }
  },

  actions: {
    async fetchUser(serverURL, authInfo) {
      if(authInfo !== null && "org_scoped_id" in authInfo && "code" in authInfo)
      {
        let response = await fetch(serverURL + 'get_access_token?service_type=oculus_web_demo&service_user_token=' + authInfo.org_scoped_id + ':' + authInfo.code)
        if(response.status != 200)
        {
          const responseBody = await response.text()
          console.log(responseBody)
        }
        else
        {
          const responseBody = await response.json()
          this.user = responseBody;
          console.log(responseBody)

          this.expires = Date.now() + 2*60*60*1000 //valid for 2 hours
        }
      }
    }
  },
  persist: true,
})
