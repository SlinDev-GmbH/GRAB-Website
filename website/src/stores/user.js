import { defineStore } from 'pinia'
import { listRequest } from '../requests/ListRequest';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    expires: 0,
    favoriteLevels: [],
    listType: null,
    list: [],
    listIndex: null,
    processedList: {}
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
    isVerifier: (state) => {
      if (!state.isLoggedIn) return false
      return state.user.info.is_verifier === true || this.isModerator(state)
    },
    isModerator: (state) => {
      if (!state.isLoggedIn) return false
      return state.user.info.is_moderator === true || this.isSuperModerator(state)
    },
    isSuperModerator: (state) => {
      if (!state.isLoggedIn) return false
      return state.user.info.is_supermoderator === true || this.isAdmin(state)
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

          // redirect may have been too fast, try again in a second
          await new Promise(resolve => setTimeout(resolve, 1000));

          let newResponse = await fetch(serverURL + 'get_access_token?service_type=oculus_web_demo&service_user_token=' + authInfo.org_scoped_id + ':' + authInfo.code)
          if (newResponse.status!= 200) {
            const newResponseBody = await newResponse.text()
            console.log(newResponseBody)
          }
          else {
            const newNewResponseBody = await newResponse.json()
            this.user = newNewResponseBody;
            this.expires = Date.now() + 2 * 60 * 60 * 1000 //valid for 2 hours
          }
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
    },
    getProcessedList(listType){ //reported levels, reported users just so it doesnt reshow 
      return this.processedList[listType];
    },
    pushProcessedList(listType, item){
      if(!this.processedList[listType]) this.processedList[listType] = [];
      this.processedList[listType].push(item);
    },
    getListItem(index) {
      return this.list[index];
    },
    setList(type, content) {
      this.list = content;
      this.listType = type;
    },
    getListType() {
      return this.listType;
    },
    setListIndex(index) {
      this.listIndex = index;
    }
  },
  persist: true,
})
