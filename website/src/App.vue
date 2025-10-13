<template>
	<router-view></router-view>
	<ToastNotifier />
</template>

<style scoped></style>

<script>
import ToastNotifier from './components/ToastNotifier.vue';
export default {
	components: { ToastNotifier },
};
</script>
