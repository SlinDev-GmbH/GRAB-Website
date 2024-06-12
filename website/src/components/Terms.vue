<template>
<div class="terms-container">
    <a href="https://slindev.com/legalnotice" class="terms-link">Legal Notice</a>
    <a href="https://slindev.com/terms" class="terms-link">EULA</a>
    <a href="https://slindev.com/privacy" class="terms-link">Privacy Policy</a>
</div>
</template>

<style scoped>
.terms-container
{
    position: fixed;
    bottom: 10px;
    right: 10px;
    background-color: #ffffff60;
    border-radius: 15px;
}

.terms-link
{
    display: inline-block;
    margin-left: 10px;
    margin-right: 10px;
    text-decoration: none;
    color: black;
    font-family: 'Roboto', sans-serif;
    font-weight: normal;
    font-size: 14px;
    transition: color 0.3s;
}

.terms-link:hover
{
    color: #555;
}
</style>

<script>
export default {

};
</script>