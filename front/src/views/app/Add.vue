<template>
    <div class="queue">
    </div>

</template>

<script>
    import session from 'localStorage'
    import Search from './Search'

    export default {
        name: "Queue",
        data: () => ({}),
        components: {
            'search': Search
        }
    }
</script>
