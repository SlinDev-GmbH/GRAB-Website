<script>
export default {
  
}
</script>


<template>
  <img src="../assets/logo.png" alt="GRAB Logo" class="title-image">
  <div class="button-container">
    <button class="login-button" type="button" onclick="window.location.href = 'https://sidequestvr.com/app/4222'">GET GRAB</button>

    <router-link to="/levels"><button class="login-button" type="button">LEVEL BROWSER</button></router-link>
    <button class="login-button" type="button" onclick="window.location.href = 'https://discord.slin.dev'">DISCORD</button>
  </div>
  <iframe class="video" width="560" height="315" src="https://www.youtube-nocookie.com/embed/Qr6zxZg9Ag4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</template>


<style>
.title-image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 50%;
}
.title-text {
  display: block;
  margin-left: auto;
  margin-right: auto;
  color: #FFFFFF;
  max-width: 50%;
  text-align: center;
}

.button-container {
  display: block;
    justify-content: space-around;
  margin-left: auto;
  margin-right: auto;
  margin-top: 4em;
  margin-bottom: 4em;

  max-width: 50%;
}

.login-button {
  display: block;
  padding: 1em;
  width: 100%;
  margin-top: 0.5em;
  margin-left: 0px;
  margin-right: 0px;
  font-weight: semibold;
  font-size: 2em;
  border-radius: 2em;
  box-sizing: border-box;
  text-decoration: none;
  background-color: #00BC87;
  color: #FFFFFF;
  text-align: center;
  border: none;
}

.video {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>