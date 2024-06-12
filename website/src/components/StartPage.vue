<script>
export default {
  mounted() {
    const sections = document.querySelectorAll('.section-fade');

    // fade in with observer

    const sectionVisible = (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
        });
    };
    const sectionObserver = new IntersectionObserver(sectionVisible, {
        root: null,
        threshold: 0,
        rootMargin: '0px'
    });
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // fade in with on scroll (observer sometimes doesn't work well on mobile)

    document.addEventListener('scroll', () => {
        const pageBottom = window.scrollY + window.innerHeight;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageBottom > sectionTop) {
                section.classList.add('section-visible');
            }
        });
    });
  }
}
</script>


<template>
  <div id="homepage">
  <header>
      <img src="./../assets/logo.png" alt="GRAB Logo">
      <div class="buttons">
          <a href="https://www.meta.com/experiences/4104088956355944/" aria-label="Get GRAB on Meta">GET GRAB!</a>
          <a href="/levels" aria-label="Browse GRAB levels">BROWSE LEVELS</a>
      </div>
      <h2>FREE TO PLAY ON META, STEAM, AND PICO</h2>
  </header>
  <main>
      <section id="trailer" class="section-fade">
          <h3>ARE YOU READY TO <strong>GRAB</strong> YOUR DESTINY?</h3>
          <video id="trailer-video" autoplay muted loop controls>
              <source src="https://files.slindev.com/videos/grab_trailer.mp4" type="video/mp4">
          </video>
      </section>
      <section class="section-fade">
          <h3>PLAY COMMUNITY BUILT PARKOUR LEVELS</h3>
          <p>GRAB is a VR multiplayer parkour game. Climb, jump, slide and swing through the levels to reach the end, but don't fall or touch the lava!</p>
      </section>
      <section class="section-fade">
          <h3>BUILD YOUR OWN MAPS IN THE EDITOR</h3>
          <p>A core component of GRAB is the level editor that lets you and your friends create your own levels together and upload them for everyone else to play. View community creations on the level browser!</p>
          <div class="buttons">
              <a href="/levels" aria-label="Browse GRAB levels">LEVEL BROWSER</a>
          </div>
      </section>
      <section class="section-fade">
          <h3>JOIN THE COMMUNITY!</h3>
          <p>Join the GRAB community on Discord to share your levels, get feedback, and find other players to play with.</p>
          <div class="buttons">
              <a href="https://discord.gg/slindev" aria-label="Join GRAB community on Discord">DISCORD</a>
          </div>
      </section>
      <section class="section-fade">
          <h3>GET GRAB!</h3>
          <p>GRAB is available on Meta, Steam, and Pico. Click the links below to download the game.</p>
          <div class="buttons buttons-mid">
              <a href="https://store.steampowered.com/app/1701130/GRAB/" aria-label="Get GRAB on Steam">GRAB ON STEAM</a>
              <a href="https://www.meta.com/experiences/4104088956355944/" aria-label="Get GRAB on Meta">GRAB ON META</a>
              <a href="https://www.picoxr.com/global/games/grab" aria-label="Get GRAB on Pico">GRAB ON PICO</a>
              <a href="https://sidequestvr.com/app/4222/grab" aria-label="Get GRAB on SideQuest">GRAB ON SIDEQUEST</a>
          </div>
      </section>
  </main>
  <div id="players">
      <div>
          <img src="./../assets/player.png" title="Player by BlackCat508" alt="GRAB player">
          <img src="./../assets/editor.png" title="Builder by BlackCat508" alt="GRAB builder">
      </div>
  </div>
  <footer>
      <nav>
          <span id="copy">
              <span>&copy; <a href="https://slindev.com" aria-label="SlinDev's website">SlinDev</a> 2024</span>
              <span>Site by <a href="https://twhlynch.me" aria-label="twhlynch's website">twhlynch</a></span>
          </span>
          <nav>
              <a href="https://slindev.com/legalnotice" aria-label="Legal notice">LEGAL NOTICE</a>
              <a href="https://slindev.com/privacy" aria-label="Privacy policy">PRIVACY POLICY</a>
              <a href="https://slindev.com/terms" aria-label="End user license agreement">EULA</a>
              <a href="https://slindev.com" aria-label="SlinDev website">SLINDEV</a>
              <a href="https://www.youtube.com/@grabvrgame" aria-label="GRAB YouTube channel">YOUTUBE</a>
              <a href="https://www.tiktok.com/@grabvr_official" aria-label="GRAB TikTok channel">TIKTOK</a>
          </nav>
      </nav>
  </footer>
</div>
</template>

<style scoped>

</style>