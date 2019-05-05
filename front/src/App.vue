<template>
    <transition name="slide">
        <router-view></router-view>
    </transition>
</template>

<script>
    export default {
        name: 'App',
        data: () => ({})
    }
</script>
