<template>
    <div class="notification-replacement fixed bottom-12 right-4 z-50 space-x-4">
        <transition-group name="notification-slide" tag="div">
            <div v-for="(notification, index) in reversedNotifications" :key="notification.id">
                <NotificationComponent :notification-prop="notification" :secondsAgo="notification.elapsedSeconds" />
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NotifyEvents } from '@AthenaPlugins/plugin-notifications/shared/events.js';
import { Notification } from '../shared/interface.js';
import NotificationComponent from './components/NotificationComponent.vue';
import WebViewEvents from '@utility/webViewEvents.js';

defineProps({
    notificationProp: Object,
    secondsAgo: Number,
});

interface VueNotification extends Notification {
    id?: number;
    progress?: number;
    startTime?: number;
    elapsedSeconds?: number;
}

const notifications = ref<VueNotification[]>([]);
let timer: NodeJS.Timeout | null = null;

const reversedNotifications = computed(() => {
    return notifications.value.slice().reverse();
});

const addNotification = (notification: VueNotification) => {
    notification.progress = 0;
    notification.id = generateUniqueId();
    notification.startTime = Date.now();

    notifications.value.push(notification);

    if (!timer) {
        timer = setInterval(updateProgress, 10);
    }
};

const removeNotification = (index: number) => {
    notifications.value.splice(index, 1);

    if (notifications.value.length === 0 && timer) {
        clearInterval(timer);
        timer = null;
    }
};

function generateUniqueId() {
    return Date.now();
}

const updateProgress = () => {
    const currentTime = Date.now();

    for (let i = notifications.value.length - 1; i >= 0; i--) {
        const notification = notifications.value[i];
        if (notification.progress < 100) {
            const elapsedTime = currentTime - notification.startTime;
            notification.elapsedSeconds = Math.floor(elapsedTime / 1000);
            if (elapsedTime < notification.duration) {
                notification.progress = (elapsedTime / notification.duration) * 100;
            } else {
                notification.progress = 100;
                removeNotification(i);
            }
        }
    }
};

let debugMode = false; // Set to true for debugging

const addDebugNotification = () => {
    if (debugMode) {
        const debugNotification: VueNotification = {
            title: 'Debug Notification',
            subTitle: 'Success',
            icon: '🤣',
            message:
                'This is a very long test debug notification to redesign the notification system! This is a very long test debug notification to redesign the notification system!',
            duration: 60000 * 2, // 1 hour in milliseconds
        };
        addNotification(debugNotification);
    }
};

onMounted(() => {
    WebViewEvents.on(NotifyEvents.CREATE_NOTIFICATION, addNotification);

    addDebugNotification();
});
</script>

<style scoped>
.notification-replacement {
    z-index: 100;
}
.notification-slide-enter-active,
.notification-slide-leave-active {
    transition: opacity 1.5s, transform 1.5s;
}

.notification-slide-enter,
.notification-slide-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>
