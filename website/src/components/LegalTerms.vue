<template>
	<div class="terms-container">
		<a href="https://slindev.com/legalnotice" class="terms-link">Legal Notice</a>
		<a href="https://slindev.com/terms" class="terms-link">EULA</a>
		<a href="https://slindev.com/privacy" class="terms-link">Privacy Policy</a>
	</div>
</template>

<style scoped>
.terms-container {
	position: fixed;
	bottom: 0;
	right: 0;
	background-color: var(--hover);
	border-top-left-radius: 10px;
	padding-inline: 5px;
}
.terms-link {
	margin-inline: 5px;
	color: var(--light);
	font-weight: normal;
	font-size: 13px;
	transition: color 0.3s;
}
.terms-link:hover {
	color: var(--alt);
}
</style>

<script>
export default {};
</script>
