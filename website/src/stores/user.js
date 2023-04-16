import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    expires: 0
  }),

  getters: {
    accessToken: (state) => {
      if(state.expires - Date.now() > 0) return state.user?.access_token ?? undefined
      else return undefined
    }
  },

  actions: {
    async fetchUser(serverURL, authInfo) {
      if(authInfo !== null && "org_scoped_id" in authInfo && "code" in authInfo)
      {
        let response = await fetch(serverURL + 'get_access_token?service_type=oculus_web_demo&service_user_token=' + authInfo.org_scoped_id + ':' + authInfo.code)
        if(response.status != 200)
        {
          let responseBody = await response.text()
          console.log(responseBody)
        }
        else
        {
          let responseBody = await response.json()
          this.user = responseBody;

          this.expires = Date.now() + 2*60*60*1000 //valid for 2 hours
        }
      }
    }
  },
  persist: true,
})
