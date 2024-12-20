<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  methods: {
    login() {
      localStorage.setItem('currentLocation', JSON.stringify(this.$route.query)) //This will be read by the scroll list to navigate back to where it was! I tried to do it in here, but didn't get it passed to the scroll list nicely...
      window.location.href = 'https://auth.oculus.com/sso/?redirect_uri=' + this.$page_url + '/levels&organization_id=1298096256894263'
    },

    logout() {
      const userStore = useUserStore()
      userStore.$reset()
    }
  },

  async created() {
    let authInfo = null
    if(window.location.hash.length > 0)
    {
      let hash = this.$route.hash.substring(1)
      let data = atob(hash)
      authInfo = JSON.parse(data)

      this.$router.replace({ path: this.$route.path })
    }

		const userStore = useUserStore()
    await userStore.fetchUser(this.$api_server_url, authInfo)
    await userStore.fetchUsersFavorites(this.$api_server_url, this.$max_level_format_version)
  },

  computed: {
    ...mapState(useUserStore, ['isLoggedIn'])
  }
}
</script>

<template>
  <button v-if="isLoggedIn" class="logout-button" type="button" @click="logout">Logout</button>
  <button v-else class="login-button" type="button" @click="login">Login with Meta</button>
</template>

<style scoped>
.login-button {
  width: 150px;
  height:  30px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 15px;
  box-sizing: border-box;
  text-decoration: none;
  background-color: var(--green);
  color: #FFFFFF;
  text-align: center;
  top: 0px;
  right: 0px;
  position: absolute;
  cursor: pointer;
}

.logout-button {
  width: 120px;
  height:  30px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 15px;
  box-sizing: border-box;
  text-decoration: none;
  background-color: var(--red);
  color: #FFFFFF;
  text-align: center;
  top: 0px;
  right: 0px;
  position: absolute;
  cursor: pointer;
}
</style>
