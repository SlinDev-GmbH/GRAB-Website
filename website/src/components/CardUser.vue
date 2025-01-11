<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ReportModerationTools from './ReportModerationTools.vue'
import UserModerationTools from './UserModerationTools.vue'

export default {
  components: {
    ReportModerationTools,
    UserModerationTools
  },

  emit: ['profile', 'toggle_role'],

  props: {
    item: Object,
    moderationItem : Object
  },

  data() {
    return {
      cardColor: 'var(--hover)',
      copied: false,
      isPunished: false,
      isReset: false,
    }
  },

  computed: {
    isReportModerationCell() {
      return this.moderationItem !== null
    },

    isUserModerationCell() {
      return this.moderationItem === null && this.isSuperModerator
    },

    profileGradient() {
      const color1 = this.item.active_customizations?.player_color_primary?.color;
      const color2 = this.item.active_customizations?.player_color_secondary?.color;
      if (color1 && color1.length == 3 && color2 && color2.length == 3) {
        const rgb1 = `rgb(${color1[0] * 255}, ${color1[1] * 255}, ${color1[2] * 255})`;
        const rgb2 = `rgb(${color2[0] * 255}, ${color2[1] * 255}, ${color2[2] * 255})`;
        return `background-image: linear-gradient(to bottom right, ${rgb1}, ${rgb2})`
      }
      return '';
    },

    ...mapState(useUserStore, ['isSuperModerator'])
  },

  methods: {
    didPunishOrReset(bad) {
      if (bad) {
        this.isPunished = true;
      } else {
        this.isReset = true;
      }
    },

    showProfile() {
      this.$emit('profile', this.item.user_id)
    },

    copyId() {
      navigator.clipboard.writeText(this.item.user_id);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }
}
</script>

<template>
  <div class="card-container">
    <div class="user-card" :style="{'background-color': cardColor}" @click="showProfile">
      <div class="details">
        <div class="user-name-container">
          <div class="user-name">
            <span :style="isPunished ? 'color: var(--red);' : isReset ? 'color: var(--green);' : ''">{{ item.user_name }}</span>
            <img v-if="item.is_creator" alt="creator" class="creator-icon" src="./../assets/icons/checkmark.svg" />
            <span v-if="item.is_moderator" title="Moderator" class="moderator-icon">M</span>
            <span v-if="item.is_admin" title="Developer" class="developer-icon">D</span>
          </div>
          <div v-if="item.user_level_count" class="level-count">Levels: {{ item.user_level_count }}</div>
        </div>
        <div class="profile-icon" :style="profileGradient"></div>
      </div>
    </div>
    <div v-if="isSuperModerator" class="moderation">
      <div class="user-id">
        <span>{{ item.user_id }}</span>
        <button class="copy" @click="copyId">
          <img v-show="!copied" src="./../assets/icons/copy.svg">
          <img v-show="copied" src="./../assets/icons/copied.svg">
        </button>
      </div>
      <div class="actions">
        <ReportModerationTools v-if="isReportModerationCell" :moderation-item="moderationItem" @handled="didPunishOrReset"/>
        <UserModerationTools v-if="isUserModerationCell" :user-info="item" @handled="didPunishOrReset" @toggle_role="this.$emit('toggle_role', $event)"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-card {
  width: 100%;
  height: fit-content;
  background-color: var(--hover);
  border-radius: 15px;
  padding: 0.5rem 1rem;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: box-shadow 0.3s linear, transform 0.3s ease;
  cursor: pointer;
  transform: scale(1);
}
.user-card:hover {
  box-shadow: 3px 3px 0 #0005;
  transform: scale(1.05);
}
.details {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.actions {
  justify-self: flex-end;
  width: 100%;;
  height: 100%;
  display: grid;
  grid-template-rows: auto;
  padding-top: 0.5rem;
  margin-top: auto;
}
.moderation {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-block: 0.5rem;
  padding-inline: 10px;
  height: 100%;
  width: calc(100% - 30px);
  background-color: var(--button);
  border-radius: 0 0 15px 15px;
  margin-inline: 10px;
}
.user-name-container {
  font-size: 20px;
  font-style: bold;
}
.user-name {
  font-size: 20px;
  font-style: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
.level-count {
  font-size: 15px;
  opacity: 0.5;
}
.user-id {
  font-size: 15px;
  font-style: italic;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}
.user-id span {
  opacity: 0.5;
}
.copy {
  cursor: pointer;
  background-color: transparent;
  transition: transform 0.2s ease-in-out;
  display: grid;
  place-content: center;
  padding: 3px;
  border-radius: 5px;
}
.copy:hover {
  background-color: var(--hover);
}
.copy img {
  height: 1rem;
  width: 1rem;
}

.profile-icon {
  height: 60px;
  width: 60px;
  aspect-ratio: 1/1;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 10px;
  margin-block: 0.5rem;
}

.creator-icon {
  width: 20px;
  height: 20px;
}

.moderator-icon {
  width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #DE9343;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.developer-icon {
  width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #DD3619;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media screen and (max-width: 600px) {
  .user-card {
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
  }
  .user-name {
    font-size: 16px;
  }
  .profile-icon {
    height: 40px;
    width: 40px;
    border-radius: 5px;
  }
  .user-id {
    font-size: 10px;
  }
  .moderation {
    margin-inline: 5px;
    padding-inline: 5px;
  }
}
</style>
